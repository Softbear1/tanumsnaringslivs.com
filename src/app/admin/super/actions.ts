"use server";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSuperAdmin } from "@/lib/auth";
import { postBoardAdTeaser } from "@/lib/boardAds";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// OBS: Server actions svarar 404 på Cloudflare Pages-deployen (next-on-pages
// stödjer inte Next 16:s actions). All övrig super-admin-moderering går därför
// via webbläsarklienten med RLS-policyerna i supabase/add_superadmin_rls.sql.
// Den här FB-efterpostningen kräver serverhemligheter (FB_PAGE_TOKEN) och kan
// inte flyttas till klienten — den förblir trasig i produktion tills sajten
// migrerats till OpenNext-adaptern eller funktionen fått en egen API-route.

async function requireSuperAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");
  if (!isSuperAdmin(user)) redirect("/admin");
  const admin = createAdminClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY saknas");
  return admin;
}

// Efterpostar en enskild radannons till Facebook (t.ex. publicerad medan
// Facebook-kopplingen var trasig). postBoardAdTeaser sätter fb_post_id,
// så en redan postad annons hoppas alltid över — ingen dubbelpostning.
export async function adminPostBoardAdTeaser(id: string) {
  const admin = await requireSuperAdmin();
  const { data: ad } = await admin
    .from("board_ads")
    .select("id, category, title, fb_post_id")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (ad) await postBoardAdTeaser(admin, ad);
  revalidatePath("/admin/super");
}
