import { connectToDatabase } from "../database/db";
import { ObjectId } from "mongodb";

async function createIndexes() {
  console.log("🚀 Starting System-Wide Indexing...");
  try {
    const { db } = await connectToDatabase();

    // 1. Users
    console.log("-> Indexing users...");
    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true, sparse: true });
    await db.collection("users").createIndex({ role: 1 });
    
    // 2. Bookings
    console.log("-> Indexing bookings...");
    await db.collection("bookings").createIndex({ monkId: 1, date: 1, time: 1 });
    await db.collection("bookings").createIndex({ userId: 1 });
    await db.collection("bookings").createIndex({ clientId: 1 });
    await db.collection("bookings").createIndex({ status: 1 });

    // 3. Direct Messages
    console.log("-> Indexing direct_messages...");
    await db.collection("direct_messages").createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });
    await db.collection("direct_messages").createIndex({ receiverId: 1, read: 1 });

    // 4. Booking Locks (Atomic)
    console.log("-> Indexing booking_locks...");
    try {
      await db.collection("booking_locks").createIndex({ monkId: 1, date: 1, time: 1 }, { unique: true });
      await db.collection("booking_locks").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    } catch (e) {
      console.log("! booking_locks index might already exist or conflict.");
    }

    console.log("✅ ALL INDEXES CREATED. Site should be snappy now.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Indexing failed:", err);
    process.exit(1);
  }
}

createIndexes();
