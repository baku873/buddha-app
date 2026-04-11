import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // 1. Delete all standard services
    await db.collection("services").deleteMany({});
    
    // 2. Clear services array for all monks
    await db.collection("users").updateMany(
      { role: "monk" },
      { $set: { services: [] } }
    );

    return NextResponse.json({ message: "All services removed and monk profiles reset." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
