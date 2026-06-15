export const runtime = "edge";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { staticCategories } from "@/lib/data";
import { logout } from "./actions";
import Link from "next/link";
import { TreePine, Plus, Pencil, Zap, Globe, Phone, Mail } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/logga-in");

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const cats = staticCategories;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Admin header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-[var(--primary)]">
            <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <TreePine className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">Tanums Näringsliv</span>
            <span className="text-[var(--muted)] text-sm hidden sm:inline">/ Admin</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted)] hidden sm:block">{user.email}</span>
            <form action={logout}>
              <button type="submit" className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors px-3 py-1.5 border border-[var(--border)] rounded-lg">
                Logga ut
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--primary)]">Mina företag</h1>
            <p className="text-sm text-[var(--muted)] mt-0.5">
              {businesses?.length ?? 0} {businesses?.length === 1 ? "företag" : "företag"} registrerade
            </p>
          </div>
          <Link
            href="/admin/foretag/ny"
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[#152E3D] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Lägg till företag
          </Link>
        </div>

        {!businesses || businesses.length === 0 ? (
          <div className="bg-white rounded-2xl card-shadow p-16 text-center">
            <div className="w-14 h-14 bg-[var(--accent-light)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-7 h-7 text-[var(--accent)]" />
            </div>
            <h2 className="font-bold text-[var(--primary)] text-lg mb-2">Inget företag än</h2>
            <p className="text-sm text-[var(--muted)] mb-6">Lägg till ditt första företag för att synas i katalogen.</p>
            <Link
              href="/admin/foretag/ny"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[#152E3D] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Lägg till ditt första företag
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {businesses.map((b) => {
              const cat = cats.find((c) => c.id === b.category_id);
              return (
                <div key={b.id} className="bg-white rounded-2xl card-shadow overflow-hidden">
                  <div className="h-1 w-full" style={{ backgroundColor: cat?.color ?? "#6B7280" }} />
                  <div className="p-5 flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: cat?.bgColor ?? "#F3F4F6", color: cat?.color ?? "#374151" }}
                    >
                      {b.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[var(--primary)]">{b.name}</h3>
                        {b.boosted && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--boost)] bg-[var(--boost-bg)] px-2 py-0.5 rounded-full">
                            <Zap className="w-2.5 h-2.5" />BOOST
                          </span>
                        )}
                        <span
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: cat?.bgColor, color: cat?.color }}
                        >
                          {cat?.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <Phone className="w-3 h-3" />{b.phone}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <Mail className="w-3 h-3" />{b.email}
                        </span>
                        {b.website && (
                          <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                            <Globe className="w-3 h-3" />{b.website}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/foretag/${b.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-[var(--primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg)] transition-colors flex-shrink-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Redigera
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
