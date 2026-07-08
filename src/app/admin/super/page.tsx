export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Zap, Megaphone, Pause, Play, Trash2, ShieldCheck, Eye, BadgeCheck, Sparkles, Sunrise, StickyNote, Send, MousePointerClick, Users } from "lucide-react";
import { startOfStockholmDayISO } from "@/lib/time";
import { logout } from "../actions";
import {
  adminToggleDeal, adminDeleteDeal,
  adminToggleAd, adminDeleteAd,
} from "./actions";
import SuperBusinessTable from "./SuperBusinessTable";

function fmtDate(s: string | null): string {
  if (!s) return "–";
  return new Date(s).toLocaleDateString("sv-SE");
}

export default async function SuperAdminPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");
  if (!isSuperAdmin(user)) redirect("/admin");

  const admin = createAdminClient();
  if (!admin) {
    return <div className="p-10 text-center text-red-600">SUPABASE_SERVICE_ROLE_KEY saknas — kan inte ladda super-admin.</div>;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: businesses }, { data: deals }, { data: ads }, { data: categories }, { count: views7d }, { count: views30d }, { count: claimedCount }, { count: unclaimedCount }] = await Promise.all([
    admin.from("businesses").select("id, name, active, boosted, owner_id, created_at, category_id, claimed, claimed_at").order("created_at", { ascending: false }),
    admin.from("flash_deals").select("id, headline, deal_date, active, post_to_fb, fb_post_id, business_id").order("deal_date", { ascending: false }),
    admin.from("ads").select("id, headline, active, category_id, business_id").order("created_at", { ascending: false }),
    admin.from("categories").select("id, name"),
    admin.from("page_views").select("*", { count: "exact", head: true }).gte("viewed_at", sevenDaysAgo),
    admin.from("page_views").select("*", { count: "exact", head: true }).gte("viewed_at", thirtyDaysAgo),
    admin.from("businesses").select("*", { count: "exact", head: true }).eq("claimed", true),
    admin.from("businesses").select("*", { count: "exact", head: true }).eq("claimed", false),
  ]);

  // Dagens rapport — allt som hänt sedan svensk midnatt, med gårdagen som
  // jämförelse för besöken. Head-counts är billiga; åtta parallella queries.
  const dayStart = startOfStockholmDayISO();
  const yesterdayStart = new Date(new Date(dayStart).getTime() - 24 * 60 * 60 * 1000).toISOString();
  const [
    { count: viewsToday }, { count: viewsYesterday },
    { count: claimsToday }, { count: newBizToday },
    { count: boardToday }, { count: boardPending },
    { count: applicationsToday }, { count: quotesToday },
    { count: clicksToday },
  ] = await Promise.all([
    admin.from("page_views").select("*", { count: "exact", head: true }).gte("viewed_at", dayStart),
    admin.from("page_views").select("*", { count: "exact", head: true }).gte("viewed_at", yesterdayStart).lt("viewed_at", dayStart),
    admin.from("businesses").select("*", { count: "exact", head: true }).eq("claimed", true).gte("claimed_at", dayStart),
    admin.from("businesses").select("*", { count: "exact", head: true }).gte("created_at", dayStart),
    admin.from("board_ads").select("*", { count: "exact", head: true }).gte("created_at", dayStart),
    admin.from("board_ads").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("applications").select("*", { count: "exact", head: true }).gte("created_at", dayStart),
    admin.from("quote_requests").select("*", { count: "exact", head: true }).gte("created_at", dayStart),
    admin.from("offer_clicks").select("*", { count: "exact", head: true }).gte("clicked_at", dayStart),
  ]);

  const dayReport = [
    { icon: Eye, label: "Besök", value: viewsToday ?? 0, sub: `igår ${viewsYesterday ?? 0}` },
    { icon: BadgeCheck, label: "Claimade företag", value: claimsToday ?? 0 },
    { icon: Building2, label: "Nya företag", value: newBizToday ?? 0, sub: "inkl. SCB-synk" },
    { icon: StickyNote, label: "Radannonser", value: boardToday ?? 0, sub: (boardPending ?? 0) > 0 ? `${boardPending} väntar på dig` : undefined },
    { icon: Users, label: "Jobbansökningar", value: applicationsToday ?? 0 },
    { icon: Send, label: "Offertförfrågningar", value: quotesToday ?? 0 },
    { icon: MousePointerClick, label: "Klick på erbjudanden", value: clicksToday ?? 0 },
  ];

  const todayLabel = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm", weekday: "long", day: "numeric", month: "long",
  }).format(new Date());

  // Nyligen claimade = ÄKTA övertaganden. claimed_at sätts bara av triggern vid
  // övergången oclaimerad→claimad, så ett självskapat företag (som föds med
  // claimed=true men aldrig UPDATE:as) har claimed_at=null och räknas INTE som
  // claim. Det skiljer ett övertagande från en nyskapad listning.
  type BizRow = NonNullable<typeof businesses>[number];
  const recentClaims = (businesses ?? [])
    .filter((b) => (b as BizRow & { claimed_at?: string | null }).claimed_at)
    .sort((a, b) =>
      String((b as BizRow & { claimed_at?: string | null }).claimed_at).localeCompare(
        String((a as BizRow & { claimed_at?: string | null }).claimed_at)
      )
    )
    .slice(0, 8);

  // Nyligen tillagda — nya listningar, inte SCB-seeden. Seedens ~900 företag
  // bulk-skapades samma dag; den vanligaste skapelsedagen är alltså seed-dagen,
  // och allt skapat därefter är på riktigt tillagt. Exkluderar övertaganden
  // (claimed_at satt) så samma företag aldrig visas i båda panelerna.
  const dayCounts = new Map<string, number>();
  for (const b of businesses ?? []) {
    const day = String(b.created_at ?? "").slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }
  const seedDay = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  const recentlyAdded = (businesses ?? [])
    .filter(
      (b) =>
        String(b.created_at ?? "").slice(0, 10) > seedDay &&
        !(b as BizRow & { claimed_at?: string | null }).claimed_at
    )
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, 8);

  const catName: Record<string, string> = {};
  for (const c of categories ?? []) catName[c.id] = c.name;

  const bizName: Record<string, string> = {};
  for (const b of businesses ?? []) bizName[b.id] = b.name;

  const stats = [
    { icon: Building2, label: "Företag", value: businesses?.length ?? 0 },
    { icon: Zap, label: "Blixterbjudanden", value: deals?.length ?? 0 },
    { icon: Megaphone, label: "Annonser", value: ads?.length ?? 0 },
    { icon: Eye, label: "Besök 7 dagar", value: views7d ?? 0 },
    { icon: Eye, label: "Besök 30 dagar", value: views30d ?? 0 },
    { icon: BadgeCheck, label: "Claimade", value: claimedCount ?? 0, sub: `${unclaimedCount ?? 0} ej claimade` },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--brand)] text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[var(--sol-500)]" />
            <span className="font-semibold text-sm">Super-admin</span>
            <Link href="/admin" className="text-white/60 hover:text-white text-sm underline">Min vanliga vy</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm hidden sm:block">{user.email}</span>
            <form action={logout}>
              <button type="submit" className="text-sm text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-lg transition-colors">Logga ut</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Dagens rapport — morgonöverblicken */}
        <section className="rounded-2xl border-2 border-[var(--accent-light)] bg-white card-shadow overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)] bg-[var(--accent-light)]/40">
            <Sunrise className="w-5 h-5 text-[var(--sol-500)]" />
            <h2 className="font-bold text-[var(--primary)]">Dagens rapport</h2>
            <span className="text-sm text-[var(--muted)] capitalize">— {todayLabel}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 divide-x divide-y sm:divide-y-0 lg:divide-y-0 divide-[var(--border)]">
            {dayReport.map((s) => (
              <div key={s.label} className="px-4 py-4">
                <div className="flex items-center gap-1.5 mb-1 text-[var(--muted)]">
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">{s.label}</span>
                </div>
                <div className={`text-2xl font-bold ${s.value > 0 ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                  {s.value}
                </div>
                {s.sub && <div className="text-[11px] text-[var(--muted)] mt-0.5">{s.sub}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Statistik */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-white p-5">
              <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
                <s.icon className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{s.label}</span>
              </div>
              <div className="text-3xl font-bold text-[var(--primary)]">{s.value}</div>
              {"sub" in s && s.sub && <div className="text-xs text-[var(--muted)] mt-1">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Nyligen claimade — det du vill se först: vilka har verifierat sig? */}
        {recentClaims.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-[var(--accent)]" /> Nyligen claimade
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentClaims.map((b) => (
                <div key={b.id} className="rounded-2xl border-2 border-[var(--accent-light)] bg-white p-4 card-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <BadgeCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <span className="font-semibold text-sm text-[var(--primary)] truncate">{b.name}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-0.5">
                    {catName[b.category_id] ?? b.category_id}
                    {" · "}Claimad {fmtDate(b.claimed_at ?? null)}
                  </p>
                  {/* "Innan" — hur länge listningen låg oclaimerad före övertagandet */}
                  <p className="text-[11px] text-[var(--muted)] mb-3">
                    Låg oclaimerad sedan {fmtDate(b.created_at)}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Link href={`/admin/foretag/${b.id}`} className="text-[var(--brand)] hover:underline">Redigera</Link>
                    <span className="text-[var(--border)]">·</span>
                    <Link href={`/foretag/${b.id}`} target="_blank" rel="noopener noreferrer" className="text-[var(--brand)] hover:underline">Visa publikt</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Nyligen tillagda — nya listningar sedan SCB-seeden */}
        {recentlyAdded.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--sol-500)]" /> Nyligen tillagda
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyAdded.map((b) => (
                <div key={b.id} className="rounded-2xl border border-[var(--boost-border)] bg-white p-4 card-shadow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[var(--primary)] truncate">{b.name}</span>
                    {b.claimed && <BadgeCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />}
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-3">
                    {catName[b.category_id] ?? b.category_id}
                    {" · "}Tillagd {fmtDate(b.created_at)}
                    {!b.claimed && " · Ej verifierad"}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Link href={`/admin/foretag/${b.id}`} className="text-[var(--brand)] hover:underline">Redigera</Link>
                    <span className="text-[var(--border)]">·</span>
                    <Link href={`/foretag/${b.id}`} target="_blank" rel="noopener noreferrer" className="text-[var(--brand)] hover:underline">Visa publikt</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Företag */}
        <section>
          <h2 className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2"><Building2 className="w-4 h-4" /> Alla företag</h2>
          <SuperBusinessTable businesses={businesses ?? []} catName={catName} />
        </section>

        {/* Blixterbjudanden */}
        <section>
          <h2 className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Alla blixterbjudanden</h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg)] text-[var(--muted)] text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Erbjudande</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Företag</th>
                  <th className="text-left px-4 py-3 font-semibold">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Facebook</th>
                  <th className="text-right px-4 py-3 font-semibold">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(deals ?? []).map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 font-medium text-[var(--primary)]">{d.headline}{!d.active && <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Pausat</span>}</td>
                    <td className="px-4 py-3 text-[var(--muted)] hidden sm:table-cell">{bizName[d.business_id] ?? "–"}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{fmtDate(d.deal_date)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {d.fb_post_id
                        ? <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Postat</span>
                        : d.post_to_fb
                          ? <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">Postas</span>
                          : <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Av</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <form action={adminToggleDeal.bind(null, d.id, d.active)}>
                          <button type="submit" className="p-2 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg" title={d.active ? "Pausa" : "Aktivera"}>{d.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</button>
                        </form>
                        <form action={adminDeleteDeal.bind(null, d.id)}>
                          <button type="submit" className="p-2 text-[var(--muted)] hover:text-red-600 border border-[var(--border)] rounded-lg" title="Ta bort"><Trash2 className="w-3.5 h-3.5" /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {(deals ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--muted)]">Inga blixterbjudanden.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Annonser */}
        <section>
          <h2 className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2"><Megaphone className="w-4 h-4" /> Alla annonser</h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg)] text-[var(--muted)] text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Rubrik</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Företag</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(ads ?? []).map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 font-medium text-[var(--primary)]">{a.headline}</td>
                    <td className="px-4 py-3 text-[var(--muted)] hidden sm:table-cell">{bizName[a.business_id] ?? "–"}</td>
                    <td className="px-4 py-3 text-[var(--muted)] hidden md:table-cell">{a.category_id ? (catName[a.category_id] ?? a.category_id) : "Alla"}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${a.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{a.active ? "Aktiv" : "Pausad"}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <form action={adminToggleAd.bind(null, a.id, a.active)}>
                          <button type="submit" className="p-2 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg" title={a.active ? "Pausa" : "Aktivera"}>{a.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}</button>
                        </form>
                        <form action={adminDeleteAd.bind(null, a.id)}>
                          <button type="submit" className="p-2 text-[var(--muted)] hover:text-red-600 border border-[var(--border)] rounded-lg" title="Ta bort"><Trash2 className="w-3.5 h-3.5" /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {(ads ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--muted)]">Inga annonser.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
