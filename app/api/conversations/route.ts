import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { getAuth } from "@clerk/nextjs/server";
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to get authenticated user
async function getAuthenticatedUser(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // Check Authorization header for custom JWT (Mobile app)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      if (!JWT_SECRET) return null;
      const token = authHeader.split(" ")[1];
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        
        if (payload && payload.sub) {
          const dbUser = await db.collection("users").findOne({ _id: new ObjectId(payload.sub as string) });
          if (dbUser) return { user: dbUser, db };
        }
      } catch (e) {
        console.log("Custom JWT verification failed in conversations API:", e);
      }
    }
    
    // Check Clerk 
    const { userId: clerkId } = getAuth(request as any);
    if (clerkId) {
      const dbUser = await db.collection("users").findOne({ clerkId });
      if (dbUser) return { user: dbUser, db };
    }
    
    return null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function GET(request: Request) {
  if (!JWT_SECRET) return NextResponse.json({message:'Server config error'},{status:500});
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { user, db } = auth;
    const currentUserId = user._id.toString();
    
    // Optimized Conversations Fetch using Lookup Aggregation (O(1) database trip)
    const conversations = await db.collection("direct_messages").aggregate([
      {
        $match: {
          $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", currentUserId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$text" },
          lastMessageAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", currentUserId] }, { $eq: ["$read", false] }] },
                1, 0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { otherId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$otherId"] } } },
            { $project: { name: 1, image: 1, avatar: 1, role: 1, firstName: 1 } }
          ],
          as: "otherUser"
        }
      },
      { $unwind: { path: "$otherUser", preserveNullAndEmpty: true } },
      {
        $project: {
          otherId: "$_id",
          lastMessage: 1,
          lastMessageAt: 1,
          unreadCount: 1,
          otherName: { $ifNull: ["$otherUser.name.mn", { $ifNull: ["$otherUser.firstName", "Unknown"] }] },
          otherImage: { $ifNull: ["$otherUser.image", { $ifNull: ["$otherUser.avatar", "/default-monk.jpg"] }] },
          isMonk: { $eq: ["$otherUser.role", "monk"] }
        }
      },
      { $limit: 50 }
    ]).toArray();

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("GET Conversations Error:", error);
    return NextResponse.json({ message: "Failed to fetch conversations" }, { status: 500 });
  }
}
