/**
 * One-time migration: upserts seed/events.json (the events that used to live
 * only in the in-memory store) into MongoDB, so nothing already "published"
 * is lost when the admin/event system switches over to Mongo. Safe to
 * re-run — upserts by slug.
 *
 * The old schema had no eligibility/registration-type/team-size/custom-form
 * concepts, so those come out at sensible generic defaults (open to
 * everyone, individual registration, no custom fields) — an admin can edit
 * each event afterwards to configure them properly.
 *
 * Usage: npm run db:seed-mongo-events
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

type SeedEvent = {
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  summary?: string | null;
  description?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  location?: string | null;
  poster_url?: string | null;
  registration_enabled?: boolean;
  registration_deadline?: string | null;
};

function splitDateTime(iso: string | null | undefined): { date: Date | null; time: string | null } {
  if (!iso) return { date: null, time: null };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: new Date(iso.slice(0, 10)), time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local (see .env.local.example).");
    process.exit(1);
  }

  const events = JSON.parse(
    readFileSync(path.join(process.cwd(), "seed", "events.json"), "utf-8")
  ) as SeedEvent[];

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB_NAME || "encypherist");
    const collection = db.collection("events");

    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ startDate: 1 });

    const now = new Date();
    let count = 0;

    for (const seedEvent of events) {
      const start = splitDateTime(seedEvent.start_at);
      const end = splitDateTime(seedEvent.end_at);

      await collection.updateOne(
        { slug: seedEvent.slug },
        {
          $setOnInsert: { createdAt: now, createdBy: null },
          $set: {
            slug: seedEvent.slug,
            name: seedEvent.title,
            description: seedEvent.description || seedEvent.summary || null,
            startDate: start.date,
            startTime: start.time,
            endDate: end.date,
            endTime: end.time,
            venue: seedEvent.location || null,
            registrationDeadline: seedEvent.registration_deadline ? new Date(seedEvent.registration_deadline) : null,
            coordinator: { name: "", email: "", phone: "" },
            posterUrl: seedEvent.poster_url || null,
            status: seedEvent.status,
            registrationEnabled: Boolean(seedEvent.registration_enabled),
            eligibility: { audience: "everyone", departments: "all", years: "all", semesters: "all" },
            registration: { type: "individual", teamSize: null },
            registrationForm: { version: 1, fields: [] },
            updatedAt: now,
          },
        },
        { upsert: true }
      );
      count++;
    }

    console.log(`Upserted ${count} events into MongoDB.`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("seed-mongo-events failed:", err);
  process.exit(1);
});
