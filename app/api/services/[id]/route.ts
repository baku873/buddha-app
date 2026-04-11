import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/database/db";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, props: Props) {
  try {
    const params = await props.params;
    const { id } = params;

    const { db } = await connectToDatabase();

    // --- STRATEGY 1: Check 'services' collection (Standard Services) ---
    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    } else {
      query = { _id: id };
    }

    let service = await db.collection("services").findOne(query);

    // --- STRATEGY 2: If not found, check 'users' collection (Monk Services) ---
    if (!service) {
      // We look for a user where the 'services' array contains an item with id matching our param
      const monk = await db.collection("users").findOne({
        role: "monk",
        "services.id": id 
      });

      if (monk && monk.services) {
        // We found the monk, now find the specific service object from their array
        const embeddedService = monk.services.find((s: any) => s.id === id);
        
        if (embeddedService) {
          service = {
            ...embeddedService,
            _id: embeddedService.id, // map internal id to root _id
            source: "monk",
            monkId: monk._id.toString(),
            providerName: monk.name,
            description: `Service provided by ${monk.name.en || monk.name.mn}`, // Fallback description
          };
        }
      }
    }

    // --- RESULT ---
    if (!service) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}