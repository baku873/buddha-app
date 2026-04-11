import { NextResponse } from "next/server";
import { connectToDatabase } from "@/database/db";
import { ObjectId } from "mongodb";
import { withAuth } from "@/lib/auth";

// Get recent conversations for the current user
export const GET = withAuth(async (request, user) => {
  try {
    const { db } = await connectToDatabase();
    const currentUserId = user.dbId;

    // Find all messages where the user is either sender or receiver
    const messages = await db.collection("direct_messages")
      .find({
        $or: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Group by conversation partner to get the latest message per partner
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, msg);
      }
    });

    const recentConversations = Array.from(conversationsMap.entries()).map(([partnerId, lastMessage]) => ({
      partnerId,
      lastMessage
    }));

    // Fetch partner profiles
    const partnerIds = recentConversations.map(c => {
      try {
        return new ObjectId(c.partnerId);
      } catch {
        return null;
      }
    }).filter((id): id is ObjectId => id !== null);

    const partners = await db.collection("users")
      .find({ _id: { $in: partnerIds } })
      .project({ name: 1, firstName: 1, lastName: 1, image: 1, role: 1, isSpecial: 1, avatar: 1 })
      .toArray();

    const enrichedConversations = recentConversations.map(conv => {
      const partnerData = partners.find(p => p._id.toString() === conv.partnerId);

      let displayName = "User";
      if (partnerData) {
        if (partnerData.name && typeof partnerData.name === 'object') {
          displayName = partnerData.name.mn || partnerData.name.en || displayName;
        } else if (partnerData.name) {
          displayName = partnerData.name;
        } else if (partnerData.firstName) {
          displayName = partnerData.firstName;
        }
      }

      return {
        ...conv,
        partner: partnerData ? {
          _id: partnerData._id.toString(),
          name: displayName,
          image: partnerData.image || partnerData.avatar || null,
          role: partnerData.role,
          isSpecial: partnerData.isSpecial
        } : null
      };
    });

    return NextResponse.json(enrichedConversations);
  } catch (error) {
    console.error("GET Recent Conversations Error:", error);
    return NextResponse.json({ message: "Failed to fetch conversations" }, { status: 500 });
  }
});
