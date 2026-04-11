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
    const { services } = await request.json();

    if (!services || !Array.isArray(services)) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const objectId = new ObjectId(id);

    // 1. Fetch existing monk profile to check current statuses
    const existingMonk = await db.collection("users").findOne({ _id: objectId });
    if (!existingMonk) {
      return NextResponse.json({ message: "Monk profile not found" }, { status: 404 });
    }

    const existingServices = existingMonk.services || [];

    // 2. Process incoming services
    // - If service ID exists, preserve its status
    // - If new, set status to 'pending'
    // - Force override any user-provided status to prevent bypassing approval
    const processedServices = services.map((newSvc: any) => {
      const existingSvc = existingServices.find((s: any) => s.id === newSvc.id);
      
      // Default to 'pending' for new services or if legacy data is missing status
      let status = 'pending';
      
      if (existingSvc && existingSvc.status) {
        status = existingSvc.status;
      }

      return {
        ...newSvc,
        status: status 
      };
    });

    // 3. Update the 'users' collection
    const result = await db.collection("users").updateOne(
      { _id: objectId },
      { $set: { services: processedServices } }
    );

    return NextResponse.json({ message: "Services updated", success: true });

  } catch (error: any) {
    console.error("Services Update Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}