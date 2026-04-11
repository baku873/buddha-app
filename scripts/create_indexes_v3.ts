import { connectToDatabase } from "../database/db";

async function run() {
  console.log("🚀 Starting System-Wide Indexing...");
  try {
    const { db } = await connectToDatabase();

    // 1. Users
    console.log("-> Indexing users...");
    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true, sparse: true });
    await db.collection("users").createIndex({ role: 1 });

    // 2. Bookings
    console.log("-> Indexing bookings...");
    await db.collection("bookings").createIndex({ monkId: 1, date: 1 });
    await db.collection("bookings").createIndex({ userId: 1 });
    await db.collection("bookings").createIndex({ clientId: 1 });
    await db.collection("bookings").createIndex({ userPhone: 1 });

    // 3. Direct Messages
    console.log("-> Indexing direct_messages...");
    await db.collection("direct_messages").createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });

    console.log("✅ ALL INDEXES CREATED. Site should be snappy now.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Indexing failed:", err);
    process.exit(1);
  }
}

run();
