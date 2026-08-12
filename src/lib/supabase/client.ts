import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** Browser Supabase client — used only in Client Components (admin forms, login). */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
