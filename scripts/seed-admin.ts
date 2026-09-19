/**
 * Creates (or promotes) an admin account directly in MongoDB. This is the
 * ONLY way to provision an admin — there is deliberately no public
 * admin-registration endpoint in the app.
 *
 * Usage:
 *   npm run db:seed-admin -- --name="Jane Doe" --email=jane@example.com --password=changeme --role=super_admin
 *
 * --role defaults to "super_admin" for the very first admin (so there's
 * always someone who can use the in-app Admin Management screen afterwards).
 */
import "dotenv/config";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((a) => a.startsWith(prefix));
  return match?.slice(prefix.length);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local (see .env.local.example).");
    process.exit(1);
  }

  const name = getArg("name");
  const email = getArg("email")?.toLowerCase();
  const password = getArg("password");
  const role = getArg("role") === "admin" ? "admin" : "super_admin";

  if (!name || !email || !password) {
    console.error('Usage: npm run db:seed-admin -- --name="Jane Doe" --email=jane@example.com --password=... [--role=admin|super_admin]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB_NAME || "encypherist");
    const admins = db.collection("admins");

    await admins.createIndex({ email: 1 }, { unique: true });

    const existing = await admins.findOne({ email });
    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date();

    if (existing) {
      await admins.updateOne({ _id: existing._id }, { $set: { name, passwordHash, role, isActive: true, updatedAt: now } });
      console.log(`Updated existing admin ${email} (role: ${role}, reactivated).`);
    } else {
      await admins.insertOne({
        name,
        email,
        passwordHash,
        role,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null,
      });
      console.log(`Created admin ${email} (role: ${role}).`);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("seed-admin failed:", err);
  process.exit(1);
});
