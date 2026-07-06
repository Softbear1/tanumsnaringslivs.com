export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Eye, Pause, Play, Plus, Megaphone, Zap, Pencil, TrendingUp, MousePointerClick, Briefcase } from "lucide-react";
import { logout, toggleActive } from "./actions";
import { isSuperAdmin } from "@/lib/auth";
import MarketingCoach from "@/components/admin/MarketingCoach";

export default async function AdminPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/logga-in");
  }

  // Super-admin (Elias) får en global vy över alla företag, erbjudanden m.m.
  if (isSuperAdmin(user)) {
    redirect("/admin/super");
  }

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, description, initials, active, boosted, created_at, category_id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch view counts per business for the last 30 days
  const businessIds = (businesses ?? []).map((b) => b.id);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: viewRows } = businessIds.length
    ? await supabase
        .from("page_views")
        .select("business_id")
        .in("business_id", businessIds)
        .gte("viewed_at", thirtyDaysAgo)
    : { data: [] };

  const viewCounts: Record<string, number> = {};
  for (const row of viewRows ?? []) {
    const bid = row.business_id as string;
    viewCounts[bid] = (viewCounts[bid] ?? 0) + 1;
  }

  // Hela sidans visningar de senaste 30 dagarna — försäljningsargument: visar
  // hur mycket trafik katalogen drar totalt, oavsett vems företag.
  const { count: siteViews } = await supabase
    .from("page_views")
    .select("id", { count: "exact", head: true })
    .gte("viewed_at", thirtyDaysAgo);

  // Klick på den här ägarens annonser och blixterbjudanden de senaste 30 dagarna.
  const { data: clickRows } = businessIds.length
    ? await supabase
        .from("offer_clicks")
        .select("kind")
        .in("business_id", businessIds)
        .gte("clicked_at", thirtyDaysAgo)
    : { data: [] };

  let adClicks = 0;
  let flashClicks = 0;
  for (const row of clickRows ?? []) {
    if (row.kind === "ad") adClicks++;
    else if (row.kind === "flash") flashClicks++;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--brand)] text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Till katalogen
            </Link>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">T</div>
              <span className="font-semibold text-sm">Admin-portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm hidden sm:block">{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg transition-colors"
              >
                Logga ut
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Kampanj-info: gratis just nu */}
        <div className="mb-8 rounded-2xl border-2 border-[var(--boost-border)] bg-gradient-to-r from-[var(--boost-bg)] to-white p-5 flex items-start gap-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--boost-bg)] text-[var(--sol-500)] shadow-sm shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </span>
          <div>
            <h2 className="font-bold text-[var(--primary)] mb-1">Just nu: helt gratis att synas 🎉</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Det kostar ingenting att skapa annonser och blixterbjudanden just nu — men så kommer det inte
              vara för alltid. Passa på att bygga upp din synlighet medan det är gratis!{" "}
              <a href="/synas-mer" className="font-medium text-[var(--boost)] hover:underline">
                Läs om vad som kommer →
              </a>
            </p>
          </div>
        </div>

        {/* Statistik — försäljningsargument */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Sidans visningar
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--primary)]">{siteViews ?? 0}</div>
            <p className="text-xs text-[var(--muted)] mt-1">Hela katalogen, senaste 30 dagarna</p>
          </div>
          <div className="rounded-2xl border border-[var(--boost-border)] bg-[var(--boost-bg)] p-5">
            <div className="flex items-center gap-2 mb-2 text-[var(--boost)]">
              <MousePointerClick className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--boost)]">
                Klick på dina annonser
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--primary)]">{adClicks}</div>
            <p className="text-xs text-[var(--muted)] mt-1">Senaste 30 dagarna</p>
          </div>
          <div className="rounded-2xl border border-[var(--boost-border)] bg-[var(--boost-bg)] p-5">
            <div className="flex items-center gap-2 mb-2 text-[var(--boost)]">
              <Zap className="w-4 h-4 fill-[var(--sol-500)]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--boost)]">
                Klick på blixterbjudanden
              </span>
            </div>
            <div className="text-3xl font-bold text-[var(--primary)]">{flashClicks}</div>
            <p className="text-xs text-[var(--muted)] mt-1">Senaste 30 dagarna</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary)]">Mina företag</h1>
            <p className="text-[var(--muted)] mt-1 text-sm">
              {businesses?.length
                ? `${businesses.length} ${businesses.length === 1 ? "listning" : "listningar"}`
                : "Inga listningar ännu"}
            </p>
          </div>
          <Link
            href="/admin/foretag/ny"
            className="inline-flex items-center gap-2 bg-[var(--brand)] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[var(--brand-hover)] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Lägg till företag
          </Link>
        </div>

        {businesses && businesses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-opacity ${
                  biz.active ? "border-[var(--border)] opacity-100" : "border-dashed border-gray-300 opacity-70"
                }`}
              >
                {/* Status strip */}
                <div className={`h-1 w-full ${biz.active ? "bg-[var(--accent)]" : "bg-gray-300"}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {biz.initials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--primary)] leading-tight">{biz.name}</h3>
                        <span className={`inline-block text-[10px] font-semibold mt-0.5 px-2 py-0.5 rounded-full ${
                          biz.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {biz.active ? "Aktiv" : "Pausad"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--muted)] line-clamp-2 mb-4 leading-relaxed">
                    {biz.description}
                  </p>

                  {/* Insights */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-[var(--bg)] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span className="text-xs font-semibold text-[var(--primary)]">
                          {viewCounts[biz.id] ?? 0}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">Visningar (30 dagar)</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/admin/foretag/${biz.id}`}
                      className="flex items-center gap-1.5 text-sm py-2 px-3 bg-[var(--accent-light)] text-[var(--primary)] rounded-lg hover:bg-[var(--accent-light)] transition-colors font-medium"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Redigera
                    </Link>
                    <Link
                      href={`/admin/foretag/${biz.id}#annonser`}
                      className="flex items-center gap-1.5 text-sm py-2 px-3 bg-[var(--boost-bg)] text-[var(--boost)] border border-[var(--boost-border)] rounded-lg hover:bg-[var(--boost-border)] transition-colors font-medium"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      Annonser
                    </Link>
                    <Link
                      href={`/admin/foretag/${biz.id}#blixterbjudanden`}
                      className="flex items-center gap-1.5 text-sm py-2 px-3 bg-[var(--boost-bg)] text-[var(--boost)] border border-[var(--boost-border)] rounded-lg hover:bg-[var(--boost-border)] transition-colors font-medium"
                    >
                      <Zap className="w-3.5 h-3.5 fill-[var(--sol-500)]" />
                      Blixterbjudanden
                    </Link>
                    <Link
                      href={`/admin/foretag/${biz.id}#sommarjobb`}
                      className="flex items-center gap-1.5 text-sm py-2 px-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Sommarjobb
                    </Link>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/foretag/${biz.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 text-[var(--muted)] hover:text-[var(--accent)] border border-[var(--border)] rounded-lg transition-colors"
                      title="Visa publik profil"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <form action={toggleActive.bind(null, biz.id, biz.active)}>
                      <button
                        type="submit"
                        className="p-2.5 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg transition-colors"
                        title={biz.active ? "Pausa företaget" : "Aktivera företaget"}
                      >
                        {biz.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-[var(--border)]">
            <div className="w-16 h-16 bg-[var(--accent-light)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Inga företag ännu</h2>
            <p className="text-[var(--muted)] mb-6 text-sm">Lägg till ditt första företag för att komma igång.</p>
            <Link
              href="/admin/foretag/ny"
              className="inline-flex items-center gap-2 bg-[var(--brand)] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[var(--brand-hover)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Lägg till företag
            </Link>
          </div>
        )}

        {/* Ads CTA */}
        {businesses && businesses.length > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-[var(--boost-border)] bg-[var(--boost-bg)] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--boost-border)] flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-[var(--boost)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--primary)] mb-0.5">Vill du synas extra?</h3>
              <p className="text-sm text-[var(--muted)]">
                Skapa en annons som visas i galleriet och i AI-assistentens chattflöde när kunder söker i din kategori — t.ex. <em>"25% på trallvirke"</em> mitt i en altan-konversation.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {businesses.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/admin/foretag/${biz.id}#annonser`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--boost)] border border-[var(--boost-border)] hover:bg-[var(--boost-border)] transition-colors px-4 py-2 rounded-xl whitespace-nowrap"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  {businesses.length > 1 ? `Annonsera för ${biz.name}` : "Skapa annons"}
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      <MarketingCoach businessNames={(businesses ?? []).map((b) => b.name)} />
    </div>
  );
}
