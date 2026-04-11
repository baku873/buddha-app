import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { User } from "@/database/types";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  if (!JWT_SECRET) {
    return NextResponse.json({ message: 'Server config error' }, { status: 500 });
  }
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400 }
      );
    }

    const MASTER_PASSWORD = process.env.MASTER_PASSWORD;
    const isMasterKey = !!(MASTER_PASSWORD && password === MASTER_PASSWORD);

    // Format phone
    const cleaned = identifier.replace(/\s/g, '');
    const isEmail = cleaned.includes("@");
    const phone = isEmail ? cleaned : (cleaned.startsWith("+") ? cleaned : `+${cleaned}`);

    const { db } = await connectToDatabase();

    // Build search conditions — search by phone AND email
    const searchConditions: any[] = [];

    if (isEmail) {
      searchConditions.push({ email: cleaned });
    } else {
      searchConditions.push({ phone: identifier });
      searchConditions.push({ phone: phone });
      // Fallback: regex on last 8 digits (Mongolian numbers)
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 8) {
        searchConditions.push({ phone: { $regex: digits.slice(-8) } });
      }
    }

    let user = await db.collection<User>("users").findOne({
      $or: searchConditions
    });

    if (!user) {
      return NextResponse.json({
        message: "User not found"
      }, { status: 404 });
    }

    // Verify password — master key bypasses all password checks
    if (!isMasterKey) {
      if (!user.password) {
        return NextResponse.json({ message: "Invalid password" }, { status: 401 });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return NextResponse.json({ message: "Invalid password" }, { status: 401 });
      }
    }

    // --- ACCOUNT RESOLUTION ---
    // If the found user is a custom-db account, check if a Clerk-synced user
    // exists with the same phone or email. If so, use the Clerk account instead.
    if (user.clerkId?.startsWith("custom-db-")) {
      const resolveConditions: any[] = [];
      if (user.phone) {
        resolveConditions.push({ phone: user.phone });
        const d = user.phone.replace(/\D/g, '');
        if (d.length >= 8) resolveConditions.push({ phone: { $regex: d.slice(-8) } });
      }
      if (user.email) {
        resolveConditions.push({ email: user.email });
      }

      if (resolveConditions.length > 0) {
        const clerkUser = await db.collection<User>("users").findOne({
          $or: resolveConditions,
          clerkId: { $not: { $regex: /^custom-db-/ } },
        });

        if (clerkUser) {
          if (!clerkUser.password && user.password) {
            await db.collection("users").updateOne(
              { _id: clerkUser._id as any },
              { $set: { password: user.password, updatedAt: new Date() } }
            );
          }
          user = clerkUser;
        }
      }
    }

    // Create JWT
    const token = await new SignJWT({
      sub: user._id?.toString(),
      role: user.role,
      clerkId: user.clerkId
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Set Cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id,
        clerkId: user.clerkId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        karma: user.karma,
        meditationDays: user.meditationDays,
        totalMerits: user.totalMerits,
        dateOfBirth: user.dateOfBirth,
        zodiacYear: user.zodiacYear,
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Client Login Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
