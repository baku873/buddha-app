import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log("Creating indexes to speed up performance...");

    // 1. Users - clerkId is essential for auth
    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true, sparse: true });
    console.log("✅ users:clerkId index created");

    // 2. Bookings - monkId+date+time is the main booking lookup
    await db.collection("bookings").createIndex({ monkId: 1, date: 1, time: 1 });
    await db.collection("bookings").createIndex({ userId: 1 });
    await db.collection("bookings").createIndex({ clientId: 1 });
    await db.collection("bookings").createIndex({ userEmail: 1 });
    console.log("✅ bookings indexes created");

    // 3. Messages - sender + receiver + date is used for history
    await db.collection("direct_messages").createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });
    await db.collection("direct_messages").createIndex({ receiverId: 1, read: 1 });
    console.log("✅ direct_messages indexes created");

    // 4. Locks - for atomic booking
    await db.collection("booking_locks").createIndex({ monkId: 1, date: 1, time: 1 }, { unique: true });
    await db.collection("booking_locks").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log("✅ booking_locks indexes created");

    console.log("🚀 ALL INDEXES CREATED SYSTEM-WIDE.");
  } catch (e) {
    console.error("Index creation error", e);
  } finally {
    await client.close();
  }
}

run();
