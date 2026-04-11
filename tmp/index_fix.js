const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "";

async function run() {
  if (!uri) {
    console.error("❌ MONGODB_URI is missing");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log("Creating indexes to speed up performance...");

    // 1. Users
    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true, sparse: true });
    console.log("✅ users:clerkId index created");

    // 2. Bookings
    await db.collection("bookings").createIndex({ monkId: 1, date: 1, time: 1 });
    await db.collection("bookings").createIndex({ userId: 1 });
    await db.collection("bookings").createIndex({ clientId: 1 });
    await db.collection("bookings").createIndex({ userEmail: 1 });
    console.log("✅ bookings indexes created");

    // 3. Messages
    await db.collection("direct_messages").createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });
    await db.collection("direct_messages").createIndex({ receiverId: 1, read: 1 });
    console.log("✅ direct_messages indexes created");

    // 4. Locks
    try {
      await db.collection("booking_locks").createIndex({ monkId: 1, date: 1, time: 1 }, { unique: true });
      await db.collection("booking_locks").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
      console.log("✅ booking_locks indexes created");
    } catch (e) {
      console.log("⚠️ booking_locks indexes already exist or failed (unique constraint might trigger if data exists)");
    }

    console.log("🚀 ALL INDEXES CREATED SYSTEM-WIDE.");
  } catch (e) {
    console.error("Index creation error", e);
  } finally {
    await client.close();
  }
}

run();
