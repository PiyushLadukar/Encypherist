import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client. Bypasses RLS entirely — never import this
 * from a Client Component, never return its results without an explicit
 * server-side admin/auth check first. The `server-only` import makes any
 * accidental client-bundle import a build-time error.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client is not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only)."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
