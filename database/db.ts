import { MongoClient, Db, Collection, Document } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

// Use the same global pattern for both development AND production
// to prevent connection pool exhaustion in serverless environments.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
  });
  global._mongoClientPromise = client.connect();
}

const clientPromise: Promise<MongoClient> = global._mongoClientPromise;

/**
 * Global helper function to connect to the database.
 * Use this in your API routes or Server Components.
 */
export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  return { client, db };
}

/**
 * Get a MongoDB collection from a given database instance.
 * Use this after calling connectToDatabase() to obtain a typed collection.
 */
export function getCollection<T extends Document = Document>(
  db: Db,
  name: string,
): Collection<T> {
  return db.collection<T>(name);
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
