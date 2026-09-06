import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * Singleton Mongo connection, stashed on globalThis so hot-reload in dev
 * (and every route/module in the same process) shares one client instead of
 * opening a fresh connection per request — same pattern `lib/store.ts` uses
 * for its in-memory singleton.
 */

const globalForMongo = globalThis as unknown as {
  __encyMongoClient?: MongoClient;
  __encyMongoClientPromise?: Promise<MongoClient>;
};

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MongoDB is not configured. Set MONGODB_URI in .env.local.");
  }
  return uri;
}

function getClientPromise(): Promise<MongoClient> {
  if (!globalForMongo.__encyMongoClientPromise) {
    const client = new MongoClient(getUri());
    globalForMongo.__encyMongoClient = client;
    globalForMongo.__encyMongoClientPromise = client.connect();
  }
  return globalForMongo.__encyMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB_NAME || "encypherist");
}

export async function getCollections() {
  const db = await getDb();
  return {
    admins: db.collection("admins"),
    events: db.collection("events"),
    registrations: db.collection("registrations"),
    auditLog: db.collection("admin_audit_log"),
  };
}
