const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// 1. Manually parse .env without external deps
const envPath = path.join(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/^["'](.+)["']$/, '$1');
  });
}

const uri = env.MONGODB_URI || process.env.MONGODB_URI;
const dbName = env.MONGODB_DB || process.env.MONGODB_DB;

async function run() {
  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env or environment variables");
    process.exit(1);
  }

  console.log("🚀 Starting System-Wide Indexing...");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);

    // Users
    console.log("-> Indexing users...");
    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true, sparse: true });
    await db.collection("users").createIndex({ role: 1 });

    // Bookings
    console.log("-> Indexing bookings...");
    await db.collection("bookings").createIndex({ monkId: 1, date: 1 });
    await db.collection("bookings").createIndex({ userId: 1 });
    await db.collection("bookings").createIndex({ clientId: 1 });
    await db.collection("bookings").createIndex({ userPhone: 1 });

    // Direct Messages
    console.log("-> Indexing direct_messages...");
    await db.collection("direct_messages").createIndex({ senderId: 1, receiverId: 1, createdAt: -1 });

    console.log("✅ ALL INDEXES CREATED. Site performance should be significantly improved.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Indexing failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
