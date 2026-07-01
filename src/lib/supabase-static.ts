import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

// Cookie-free client for statically generated pages (SEO pages, sitemap).
// Using the server client would pull in cookies() and force dynamic rendering.
export function createStaticClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
