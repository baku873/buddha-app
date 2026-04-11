import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { db } = await connectToDatabase();
    const query = user.isClerk
      ? { clerkId: user.id }
      : { _id: new ObjectId(user.dbId) };
    const dbUser = await db.collection("users").findOne(query);

    if (!dbUser || !dbUser.wishlist) return NextResponse.json({ wishlist: [] });

    const monks = await db.collection("users")
      .find({ _id: { $in: dbUser.wishlist.map((id: string) => new ObjectId(id)) } })
      .toArray();

    return NextResponse.json({
      wishlist: monks.map(m => ({ ...m, _id: m._id.toString() }))
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { monkId } = await request.json();
    if (!monkId) return NextResponse.json({ error: "Monk ID required" }, { status: 400 });

    const { db } = await connectToDatabase();
    const query = user.isClerk
      ? { clerkId: user.id }
      : { _id: new ObjectId(user.dbId) };
    const dbUser = await db.collection("users").findOne(query);

    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const wishlist = dbUser.wishlist || [];
    const exists = wishlist.includes(monkId);

    const update = exists
      ? { $pull: { wishlist: monkId } }
      : { $addToSet: { wishlist: monkId } };

    await db.collection("users").updateOne(query, update);

    return NextResponse.json({
      success: true,
      action: exists ? "removed" : "added",
      wishlist: exists ? wishlist.filter((id: string) => id !== monkId) : [...wishlist, monkId]
    });
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
