import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (_request, user) => {
  try {
    const { db } = await connectToDatabase();
    const currentUserId = user.dbId;

    // Optimized Conversations Fetch using Lookup Aggregation
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
      { $unwind: { path: "$otherUser", preserveNullAndEmptyArrays: true } },
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
});
