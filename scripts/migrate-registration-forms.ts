/**
 * One-time migration: adds the standard identity fields (name, email, phone,
 * department, year) to the registration form of every event that predates the
 * "all fields are admin-controlled" change.
 *
 * Before this change those five fields were hardcoded in the public form and
 * never stored on the event. Now they live in `registrationForm.fields` tagged
 * with an `identity` role, so the admin can edit/reorder/remove them and the
 * server can still derive a participant record for eligibility, dedup and export.
 *
 * Events whose form already has an identity-tagged field are left untouched, so
 * this is safe to re-run. Existing registrations keep their own `formSnapshot`
 * and `individual`/`team` records and are not modified.
 *
 * Usage: npm run db:migrate-forms
 */
import "dotenv/config";
import { MongoClient } from "mongodb";

// Keep in sync with DEFAULT_REGISTRATION_FIELDS in src/lib/registration-form.ts
const DEFAULT_REGISTRATION_FIELDS = [
  { key: "name", type: "short_text", label: "Full name", required: true, identity: "name", order: 0 },
  { key: "email", type: "email", label: "Email", required: true, identity: "email", order: 1 },
  { key: "phone", type: "phone", label: "Phone", required: true, identity: "phone", order: 2 },
  { key: "department", type: "department", label: "Department", required: true, identity: "department", order: 3 },
  { key: "year", type: "year", label: "Year", required: true, identity: "year", order: 4 },
];

type FormField = { key: string; order: number; identity?: string; [k: string]: unknown };
type EventDoc = {
  _id: unknown;
  slug: string;
  registrationForm?: { version?: number; fields?: FormField[] };
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local (see .env.local.example).");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB_NAME || "encypherist");
    const events = db.collection<EventDoc>("events");

    const all = await events.find({}).toArray();
    let migrated = 0;

    for (const event of all) {
      const form = event.registrationForm ?? { version: 1, fields: [] };
      const fields = form.fields ?? [];
      if (fields.some((f) => f.identity)) continue;

      // Seed any missing standard field; where a field already uses a reserved
      // key (name/email/...), tag it with the identity role instead of adding a
      // duplicate. Mirrors mergeIdentityFields() in src/lib/registration-form.ts.
      const existingKeys = new Set(fields.map((f) => f.key));
      const missingSeeds = DEFAULT_REGISTRATION_FIELDS.filter((s) => !existingKeys.has(s.key));
      const promoted = fields.map((f) => {
        const seed = DEFAULT_REGISTRATION_FIELDS.find((s) => s.key === f.key);
        return seed && !f.identity ? { ...f, identity: seed.identity } : f;
      });
      const nextFields = [...missingSeeds, ...promoted].map((f, i) => ({ ...f, order: i }));

      await events.updateOne(
        { _id: event._id },
        {
          $set: {
            "registrationForm.fields": nextFields,
            "registrationForm.version": (form.version ?? 1) + 1,
            updatedAt: new Date(),
          },
        }
      );
      migrated++;
      console.log(`  migrated ${event.slug}`);
    }

    console.log(`Done. ${migrated} of ${all.length} event(s) updated.`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("migrate-registration-forms failed:", err);
  process.exit(1);
});
