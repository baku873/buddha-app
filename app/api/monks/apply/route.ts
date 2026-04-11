import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();

    const { db } = await connectToDatabase();

    // Fetch all services from the services collection
    const allServices = await db.collection("services").find({}).toArray();

    // Map services to the format expected in user.services array
    const serviceRefs = allServices.map((svc: any) => ({
      id: svc.id || svc._id.toString(),
      name: svc.name,
      price: svc.price,
      duration: svc.duration,
      status: 'active'
    }));

    // Update the User record. 
    // monkStatus: "pending" -> This triggers it to show up in Admin Dashboard
    // services: all services from the services collection
    await db.collection("users").updateOne(
      { clerkId: clerkUser.id },
      {
        $set: {
          ...body,
          monkStatus: "pending",
          services: serviceRefs, // Assign all services immediately
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // Sync to Clerk Metadata immediately
    const client = await clerkClient();
    await client.users.updateUser(clerkUser.id, {
        publicMetadata: {
            role: "monk", // Assuming applying makes them a monk role (or pending monk)
            monkStatus: "pending"
        },
        unsafeMetadata: {
            phone: body.phone,
            name: body.name
        }
    });

    // Add Phone Number as Login Identifier (Auto-Verified)
    if (body.phone) {
        try {
            await client.phoneNumbers.createPhoneNumber({
                userId: clerkUser.id,
                phoneNumber: body.phone,
                verified: true 
            });
        } catch (e) {
            console.log("Note: Could not add phone number to Clerk (might already exist):", e);
        }
    }

    return NextResponse.json({ message: "Application received" });

  } catch (error: any) {
    console.error("Monk Apply Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}