import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { currentUser } from "@clerk/nextjs/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    // 1. Find the booking
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    // 2. Authorization Check (Only Monk or Admin)
    const isAdmin = user.publicMetadata.role === "admin";
    let isMonk = false;

    if (booking.monkId) {
      // Fetch monk profile to check if it matches current user
      const monkProfile = await db.collection("users").findOne({ _id: new ObjectId(booking.monkId) });
      if (monkProfile && monkProfile.clerkId === user.id) {
        isMonk = true;
      }
    }

    if (!isMonk && !isAdmin) {
      return NextResponse.json({ message: "Forbidden: Only the Monk or Admin can complete this booking." }, { status: 403 });
    }

    // 3. Check if already processed
    if (booking.status === 'completed') {
      return NextResponse.json({ message: "Booking already completed" });
    }

    // 4. Update Monk's Earnings (Add 50,000 as requested)
    const monkId = booking.monkId;
    if (monkId) {
      // monkId can be string or ObjectId in booking, ensure we match correctly
      // In types.ts: monkId: ObjectId | string
      const monkQuery = ObjectId.isValid(monkId) ? { _id: new ObjectId(monkId) } : { _id: monkId };

      // Fetch monk to check status for earnings
      const monk = await db.collection("users").findOne(monkQuery);

      if (monk) {
        const isSpecial = monk.isSpecial === true;
        const earningsAmount = isSpecial ? 88800 : 40000;

        await db.collection("users").updateOne(
          monkQuery,
          { $inc: { earnings: earningsAmount } }
        );

        // If the monk who completed the service is NOT special, 
        // give 10,000₮ commission to all special monks
        if (!isSpecial) {
          await db.collection("users").updateMany(
            { role: "monk", isSpecial: true },
            { $inc: { earnings: 10000 } }
          );
        }
      }
    }

    // 5. Delete Chat Messages (Cleanup)
    await db.collection("messages").deleteMany({ bookingId: id });

    // 6. Mark Booking as Completed
    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'completed', updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: "Booking completed, payment added, and chat history cleaned." });

  } catch (error: any) {
    console.error("Complete Booking Error:", error);
    return NextResponse.json({ message: "Internal Error", error: error.message }, { status: 500 });
  }
}
