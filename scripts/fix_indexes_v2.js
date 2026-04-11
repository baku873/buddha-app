const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
}

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI not found in .env");
    return;
  }
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
