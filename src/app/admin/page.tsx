export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "./actions";

export default async function AdminPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/logga-in");
  }

  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--primary)] text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">T</div>
            <span className="font-semibold">Admin-portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/70 text-sm hidden sm:block">{user.email}</span>
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
            <p className="text-[var(--muted)] mt-1">Hantera dina företagslistningar</p>
          </div>
          <Link
            href="/admin/foretag/ny"
            className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Lägg till företag
          </Link>
        </div>

        {businesses && businesses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((biz) => (
              <div key={biz.id} className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-lg">
                    {biz.initials}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${biz.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {biz.active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>
                <h3 className="font-semibold text-[var(--primary)] mb-1">{biz.name}</h3>
                <p className="text-[var(--muted)] text-sm line-clamp-2 mb-4">{biz.description}</p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/foretag/${biz.id}`}
                    className="flex-1 text-center text-sm py-2 px-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg hover:bg-[var(--primary)]/20 transition-colors font-medium"
                  >
                    Redigera
                  </Link>
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
            <p className="text-[var(--muted)] mb-6">Lägg till ditt första företag för att komma igång.</p>
            <Link
              href="/admin/foretag/ny"
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Lägg till företag
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
