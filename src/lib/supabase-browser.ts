import { createBrowserClient as createSSRBrowser } from "@supabase/ssr";
import type { Database } from "./supabase";

export function createBrowserClient() {
  return createSSRBrowser<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
