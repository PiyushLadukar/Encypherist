/**
 * Loads seed/*.json (the verified research → structured content pipeline)
 * into Supabase via the service-role key. Idempotent: upserts on the
 * natural unique key of each table (slug, platform+url, singleton).
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database, SiteSettingsRow } from "../../src/types/database";

function loadJson<T>(file: string): T {
  const filePath = path.join(process.cwd(), "seed", file);
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local."
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Seeding members...");
  const members = loadJson<Database["public"]["Tables"]["members"]["Insert"][]>("members.json");
  {
    const { error } = await supabase.from("members").upsert(members, { onConflict: "slug" });
    if (error) throw error;
    console.log(`  ${members.length} members upserted.`);
  }

  console.log("Seeding events...");
  const events = loadJson<Database["public"]["Tables"]["events"]["Insert"][]>("events.json");
  {
    const { error } = await supabase.from("events").upsert(events, { onConflict: "slug" });
    if (error) throw error;
    console.log(`  ${events.length} events upserted.`);
  }

  console.log("Seeding projects...");
  const projects = loadJson<Database["public"]["Tables"]["projects"]["Insert"][]>("projects.json");
  if (projects.length > 0) {
    const { error } = await supabase.from("projects").upsert(projects, { onConflict: "slug" });
    if (error) throw error;
  }
  console.log(`  ${projects.length} projects upserted.`);

  console.log("Seeding site settings...");
  const settings = loadJson<Partial<SiteSettingsRow>>("site-settings.json");
  {
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { ...settings, singleton: true } as Database["public"]["Tables"]["site_settings"]["Insert"],
        { onConflict: "singleton" }
      );
    if (error) throw error;
    console.log("  site settings upserted.");
  }

  console.log("Seeding social links...");
  const socialLinks = loadJson<Database["public"]["Tables"]["social_links"]["Insert"][]>(
    "social-links.json"
  );
  {
    for (const link of socialLinks) {
      const { error } = await supabase
        .from("social_links")
        .upsert(link, { onConflict: "platform" });
      if (error) throw error;
    }
    console.log(`  ${socialLinks.length} social links upserted.`);
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
