export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, ExternalLink, Eye, Pause, Play, Plus, Inbox, Clock, Megaphone } from "lucide-react";
import { logout, toggleActive, markQuoteHandled } from "./actions";

export default async function AdminPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/logga-in");
  }

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, description, initials, active, boosted, rating, review_count, created_at, category_id")
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

  // Fetch quote requests for this owner's businesses
  const { data: quoteLinks } = businessIds.length
    ? await supabase
        .from("quote_request_businesses")
        .select("quote_request_id, business_id")
        .in("business_id", businessIds)
    : { data: [] };

  const quoteRequestIds = [...new Set((quoteLinks ?? []).map((r) => r.quote_request_id as string))];
  const { data: quoteRequests } = quoteRequestIds.length
    ? await supabase
        .from("quote_requests")
        .select("id, summary, contact_name, contact_email, contact_phone, status, created_at")
        .in("id", quoteRequestIds)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--primary)] text-white shadow">
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
            className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-colors text-sm"
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
                      <div className="w-11 h-11 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shrink-0">
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
                    {biz.boosted && (
                      <span className="text-[10px] font-bold text-[var(--boost)] bg-[var(--boost-bg)] px-2 py-0.5 rounded-full shrink-0">
                        BOOST
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[var(--muted)] line-clamp-2 mb-4 leading-relaxed">
                    {biz.description}
                  </p>

                  {/* Insights */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-[var(--bg)] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400" fill="var(--star)" />
                        <span className="text-xs font-semibold text-[var(--primary)]">
                          {biz.rating ? Number(biz.rating).toFixed(1) : "–"}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">
                        {biz.review_count ? `${biz.review_count} recensioner` : "Inga recensioner"}
                      </div>
                    </div>
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
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/foretag/${biz.id}`}
                      className="flex-1 text-center text-sm py-2 px-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors font-medium"
                    >
                      Redigera
                    </Link>
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
            <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">Inga företag ännu</h2>
            <p className="text-[var(--muted)] mb-6 text-sm">Lägg till ditt första företag för att komma igång.</p>
            <Link
              href="/admin/foretag/ny"
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Lägg till företag
            </Link>
          </div>
        )}

        {/* Ads CTA */}
        {businesses && businesses.length > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-5 h-5 text-amber-700" />
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
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors px-4 py-2 rounded-xl whitespace-nowrap"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  {businesses.length > 1 ? `Annonsera för ${biz.name}` : "Skapa annons"}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quote requests section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <Inbox className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-xl font-bold text-[var(--primary)]">Offertförfrågningar</h2>
            {(quoteRequests ?? []).length > 0 && (
              <span className="bg-[var(--accent)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {(quoteRequests ?? []).filter((q) => q.status === "pending").length} nya
              </span>
            )}
          </div>

          {(quoteRequests ?? []).length > 0 ? (
            <div className="space-y-3">
              {(quoteRequests ?? []).map((q) => (
                <div key={q.id} className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--primary)] leading-snug mb-1">{q.summary}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {q.contact_name} · {q.contact_email}
                        {q.contact_phone ? ` · ${q.contact_phone}` : ""}
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        {new Date(q.created_at).toLocaleString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {q.status === "pending" ? (
                        <>
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            Ny
                          </span>
                          <form action={markQuoteHandled.bind(null, q.id)}>
                            <button
                              type="submit"
                              className="text-xs font-medium text-[var(--primary)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] px-2.5 py-1 rounded-full transition-colors"
                              title="Markera som hanterad — kunden kan då lämna ett omdöme"
                            >
                              Markera som hanterad
                            </button>
                          </form>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-[var(--accent)] bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                          Hanterad
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--border)] py-10 text-center">
              <Inbox className="w-8 h-8 text-[var(--muted)] mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[var(--muted)]">Inga offertförfrågningar ännu.</p>
              <p className="text-xs text-[var(--muted)] mt-1">De visas här när kunder använder AI-assistenten.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
