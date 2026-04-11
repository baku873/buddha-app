const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    console.log("Connected to MongoDB. Creating indexes...");

    // Users
    await db.collection('users').createIndex({ clerkId: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ role: 1 });

    // Bookings
    await db.collection('bookings').createIndex({ monkId: 1, date: 1, status: 1 });
    await db.collection('bookings').createIndex({ clientId: 1, status: 1 });
    await db.collection('bookings').createIndex({ userId: 1, status: 1 });
    await db.collection('bookings').createIndex({ date: 1, time: 1 });

    // Conversations/Messages
    await db.collection('direct_messages').createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });

    console.log("✅ Indexes created successfully.");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

run();
