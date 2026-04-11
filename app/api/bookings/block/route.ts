import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { invalidateCache } from "@/lib/api/cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // Verify monk role
    const dbUser = await db.collection("users").findOne({
      $or: [
        { clerkId: user.id },
        ...(ObjectId.isValid(user.dbId) ? [{ _id: new ObjectId(user.dbId) }] : [])
      ]
    });

    if (!dbUser || (dbUser.role !== "monk" && dbUser.role !== "admin")) {
      return NextResponse.json({ message: "Зөвхөн лам хэрэглэгч цаг хааж болно" }, { status: 403 });
    }

    const { date, time } = await request.json();
    if (!date || !time) {
      return NextResponse.json({ message: "date and time are required" }, { status: 400 });
    }

    const blockBooking = {
      monkId: dbUser._id.toString(),
      clientId: user.dbId,
      clientName: "Хаасан цаг",
      serviceName: { mn: "Хаасан цаг", en: "Blocked Slot" },
      date,
      time,
      status: "blocked",
      userEmail: dbUser.email || "",
      userPhone: dbUser.phone || "",
      note: "Лам өөрсдөө хаасан",
      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(blockBooking);

    await invalidateCache('bookings:*');

    return NextResponse.json({ _id: result.insertedId, ...blockBooking });
  } catch (error: any) {
    console.error("Block slot error:", error);
    return NextResponse.json({ message: "Цаг хаах явцад алдаа гарлаа" }, { status: 500 });
  }
}
