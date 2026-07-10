export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CalendarClock, Send, Trash2, SkipForward, ArrowLeft, Sparkles } from "lucide-react";
import { stockholmToday } from "@/lib/time";
import { getUpcomingAutoPicks } from "@/lib/socialPosts/presentation";
import { postTypeOptions } from "@/lib/socialPosts/registry";
import { logout } from "../../actions";
import { queuePost, skipPost, removePost, postDailyNow } from "../actions";

type PostRow = {
  id: string;
  post_type: string;
  business_id: string | null;
  scheduled_date: string;
  status: string;
  source: string;
  fb_post_id: string | null;
  image_url: string | null;
  caption: string | null;
  error: string | null;
  posted_at: string | null;
};

function fmtDate(s: string | null): string {
  if (!s) return "–";
  return new Date(s).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" });
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    posted: "bg-blue-100 text-blue-700",
    queued: "bg-green-50 text-green-700",
    failed: "bg-red-100 text-red-700",
    skipped: "bg-gray-100 text-gray-500",
  };
  const label: Record<string, string> = { posted: "Postat", queued: "Köad", failed: "Misslyckat", skipped: "Överhoppat" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-500"}`}>{label[status] ?? status}</span>;
}

export default async function SchemalagdaInlaggPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");
  if (!isSuperAdmin(user)) redirect("/admin");

  const admin = createAdminClient();
  if (!admin) {
    return <div className="p-10 text-center text-red-600">SUPABASE_SERVICE_ROLE_KEY saknas — kan inte ladda schemat.</div>;
  }

  const today = stockholmToday();
  const [{ data: postsData }, { data: bizData }, upcomingAuto] = await Promise.all([
    admin.from("scheduled_posts").select("*").order("scheduled_date", { ascending: false }),
    admin.from("businesses").select("id, name, active, claimed, reklamsparr").order("name"),
    getUpcomingAutoPicks(admin, 6),
  ]);

  const posts = (postsData ?? []) as PostRow[];
  const bizName: Record<string, string> = {};
  const pool: Array<{ id: string; name: string }> = [];
  for (const b of bizData ?? []) {
    bizName[b.id] = b.name;
    if (b.active && b.claimed && !b.reklamsparr) pool.push({ id: b.id, name: b.name });
  }

  const upcoming = posts.filter((p) => p.scheduled_date >= today).sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date));
  const history = posts.filter((p) => p.scheduled_date < today);
  const typeLabel: Record<string, string> = {};
  for (const o of postTypeOptions()) typeLabel[o.value] = o.label;

  const bizLabel = (p: PostRow) => (p.business_id ? (bizName[p.business_id] ?? "Okänt företag") : "–");
  const [ty, tm, td] = today.split("-").map(Number);
  const tomorrow = new Date(Date.UTC(ty, tm - 1, td + 1)).toISOString().slice(0, 10);
  const defaultDate = upcoming.some((p) => p.scheduled_date === today) ? tomorrow : today;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--brand)] text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[var(--sol-500)]" />
            <span className="font-semibold text-sm">Schemalagda inlägg</span>
            <Link href="/admin/super" className="text-white/60 hover:text-white text-sm underline flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Super-admin</Link>
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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary)] flex items-center gap-2"><CalendarClock className="w-6 h-6 text-[var(--accent)]" /> Dagliga Facebook-inlägg</h1>
            <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">Ett inlägg per dag postas automatiskt till Facebook-sidan på morgonen. &quot;Dagens företagspresentation&quot; roterar bland verifierade företag. Du kan köa ett specifikt inlägg, hoppa över en dag eller posta manuellt.</p>
          </div>
          <form action={postDailyNow}>
            <button type="submit" className="inline-flex items-center gap-2 bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] transition-colors"><Send className="w-4 h-4" /> Posta dagens nu</button>
          </form>
        </div>

        {/* Köa manuellt */}
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-sm font-bold text-[var(--primary)] mb-3 flex items-center gap-2">Köa ett inlägg manuellt</h2>
          <form action={queuePost} className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
              Datum
              <input type="date" name="scheduled_date" defaultValue={defaultDate} min={today} required className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--primary)]" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
              Typ
              <select name="post_type" className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--primary)] bg-white">
                {postTypeOptions().map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--muted)]">
              Företag
              <select name="business_id" className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--primary)] bg-white min-w-[220px]">
                <option value="">Auto (välj längst väntande)</option>
                {pool.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
            <button type="submit" className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white text-sm font-semibold px-4 py-2 rounded-[10px] transition-colors">Köa</button>
          </form>
          <p className="text-[11px] text-[var(--muted)] mt-2">Köar du samma datum igen ersätts det inlägget (så länge det inte redan postats).</p>
        </section>

        {/* På tur (auto) */}
        {upcomingAuto.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--sol-500)]" /> Nästa på tur i auto-rotationen</h2>
            <div className="flex flex-wrap gap-2">
              {upcomingAuto.map((b, i) => (
                <span key={b.id} className="inline-flex items-center gap-2 text-sm bg-[var(--accent-light)] text-[var(--hav-900)] px-3 py-1.5 rounded-full">
                  <span className="text-[var(--muted)] font-mono text-xs">{i + 1}</span>{b.name}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-2">De företag som väntat längst — nästa dag utan köat inlägg får det översta.</p>
          </section>
        )}

        {/* Kommande */}
        <section>
          <h2 className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Kommande</h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg)] text-[var(--muted)] text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold">Typ</th>
                  <th className="text-left px-4 py-3 font-semibold">Företag</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {upcoming.map((p) => (
                  <tr key={p.id} className={p.scheduled_date === today ? "bg-[var(--accent-light)]/40" : ""}>
                    <td className="px-4 py-3 text-[var(--primary)] font-medium">{fmtDate(p.scheduled_date)}{p.scheduled_date === today && <span className="ml-2 text-[10px] bg-[var(--sol-100)] text-[var(--sol-700)] px-1.5 py-0.5 rounded-full">Idag</span>}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{typeLabel[p.post_type] ?? p.post_type}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{bizLabel(p)}<span className="ml-2 text-[10px] text-[var(--muted)]">({p.source})</span></td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {!p.fb_post_id && p.status !== "skipped" && (
                          <form action={skipPost.bind(null, p.id)}>
                            <button type="submit" className="p-2 text-[var(--muted)] hover:text-[var(--primary)] border border-[var(--border)] rounded-lg" title="Hoppa över"><SkipForward className="w-3.5 h-3.5" /></button>
                          </form>
                        )}
                        {!p.fb_post_id && (
                          <form action={removePost.bind(null, p.id)}>
                            <button type="submit" className="p-2 text-[var(--muted)] hover:text-red-600 border border-[var(--border)] rounded-lg" title="Ta bort"><Trash2 className="w-3.5 h-3.5" /></button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {upcoming.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--muted)]">Inget köat. Morgondagens inlägg väljs automatiskt.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Historik */}
        <section>
          <h2 className="text-lg font-bold text-[var(--primary)] mb-3 flex items-center gap-2">Historik</h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg)] text-[var(--muted)] text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Bild</th>
                  <th className="text-left px-4 py-3 font-semibold">Företag</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Facebook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {history.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-[var(--muted)]">{fmtDate(p.scheduled_date)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.image_url
                        // eslint-disable-next-line @next/next/no-img-element -- egen og-route-PNG, endast admin-preview
                        ? <img src={p.image_url} alt="" loading="lazy" className="w-28 h-auto rounded-md border border-[var(--border)]" />
                        : <span className="text-[var(--muted)] text-xs">–</span>}
                    </td>
                    <td className="px-4 py-3 text-[var(--primary)] font-medium">{bizLabel(p)}{p.error && <span className="block text-[11px] text-red-600 mt-0.5">{p.error}</span>}</td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {p.fb_post_id
                        ? <a href={`https://facebook.com/${p.fb_post_id}`} target="_blank" rel="noopener noreferrer" className="text-[var(--brand)] hover:underline text-xs font-medium">Visa inlägg</a>
                        : <span className="text-[var(--muted)] text-xs">–</span>}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-[var(--muted)]">Ingen historik än.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
