import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

// Service-role client for trusted server-side writes (bypasses RLS).
// Only used by protected routes such as /api/season/refresh. Returns null when
// the key isn't configured so callers can degrade gracefully.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
