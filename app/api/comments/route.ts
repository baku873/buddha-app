import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { Comment } from "@/database/types";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const comments = await db.collection("comments").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch comments.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    // Remove _id from body if present to avoid type conflicts with MongoDB ObjectId
    const { _id, ...commentData } = body;
    
    const newComment = {
      ...commentData,
      createdAt: new Date(),
      karma: 1, // Start with 1 merit
    };

    const result = await db.collection("comments").insertOne(newComment);
    
    return NextResponse.json({ ...newComment, _id: result.insertedId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to post comment.", error: error.message },
      { status: 500 }
    );
  }
}
