import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params;
    // We expect both 'schedule' (weekly) and 'blockedSlots' (specific dates)
    const { schedule, blockedSlots } = await request.json();

    const { db } = await connectToDatabase();

    const updateFields: any = {};
    if (schedule) updateFields.schedule = schedule;
    if (blockedSlots) updateFields.blockedSlots = blockedSlots;

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Monk profile not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Schedule updated", success: true });

  } catch (error: any) {
    console.error("Schedule Update Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}