import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { Message } from "@/database/types";
import { ObjectId } from "mongodb";
import { ablyRest } from "@/lib/ably";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get("bookingId");

  if (!bookingId) {
    return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }

    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Authorization Check
    const isClient = booking.clientId === user.id || booking.userId === user.id
      || booking.clientId === user.dbId || booking.userId === user.dbId;
    const isAdmin = user.role === "admin";

    let isMonk = false;
    if (booking.monkId) {
      try {
        const monkId = ObjectId.isValid(booking.monkId) ? new ObjectId(booking.monkId) : booking.monkId;
        const monkProfile = await db.collection("users").findOne({ _id: monkId });
        if (monkProfile && (monkProfile.clerkId === user.id || monkProfile._id.toString() === user.dbId)) {
          isMonk = true;
        }
      } catch (e) {
        console.error("Error fetching monk for chat auth", e);
      }
    }

    if (!isClient && !isMonk && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await db
      .collection<Message>("messages")
      .find({ bookingId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bookingId, text, senderName: bodySenderName } = await req.json();

    if (!bookingId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Prevent chat if completed or cancelled
    if (['completed', 'cancelled', 'rejected'].includes(booking.status)) {
      return NextResponse.json({ error: "Chat is closed for this booking" }, { status: 403 });
    }

    // Authorization Check
    const isClient = booking.clientId === user.id || booking.userId === user.id
      || booking.clientId === user.dbId || booking.userId === user.dbId;
    const isAdmin = user.role === "admin";
    let isMonk = false;

    if (booking.monkId) {
      const monkId = ObjectId.isValid(booking.monkId) ? new ObjectId(booking.monkId) : booking.monkId;
      const monkProfile = await db.collection("users").findOne({ _id: monkId });
      if (monkProfile && (monkProfile.clerkId === user.id || monkProfile._id.toString() === user.dbId)) {
        isMonk = true;
      }
    }

    if (!isClient && !isMonk && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Construct Message with Verified Sender
    const senderName = user.fullName || bodySenderName || "User";

    const message: Message = {
      bookingId,
      senderId: user.dbId,
      senderName,
      text,
      createdAt: new Date(),
    };

    const result = await db.collection<Message>("messages").insertOne(message);
    const savedMessage = { ...message, _id: result.insertedId };

    // Publish real-time event to the booking's Ably channel
    try {
      const channel = ablyRest.channels.get(`booking-chat:${bookingId}`);
      await channel.publish("new_message", savedMessage);
    } catch (ablyErr) {
      console.error("Ably publish failed for booking chat:", ablyErr);
    }

    return NextResponse.json(savedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
