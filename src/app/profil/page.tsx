export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function ProfilPage() {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/logga-in?next=/profil");
  }

  // Fetch all quotes where contact_email matches the logged-in user's email
  const { data: quotes } = await supabase
    .from("quote_requests")
    .select("id, summary, status, created_at, category_id")
    .eq("contact_email", user.email ?? "")
    .order("created_at", { ascending: false });

  const statusLabel = (status: string) => {
    if (status === "handled") return { label: "Hanterad", icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-100" };
    return { label: "Väntar på svar", icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-100" };
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-[var(--primary)] mb-1">Mina offertförfrågningar</h1>
        <p className="text-sm text-[var(--muted)] mb-8">{user.email}</p>

        {!quotes || quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm p-10 text-center">
            <FileText className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" />
            <p className="text-[var(--primary)] font-medium mb-1">Inga förfrågningar ännu</p>
            <p className="text-sm text-[var(--muted)] mb-5">Hitta ett företag och skicka din första offertförfrågan.</p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
            >
              Hitta företag
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => {
              const { label, icon: Icon, color } = statusLabel(quote.status ?? "pending");
              return (
                <Link
                  key={quote.id}
                  href={`/offert/${quote.id}`}
                  className="block bg-white rounded-2xl border border-[var(--border)] shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-[var(--primary)] leading-relaxed flex-1">{quote.summary}</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border shrink-0 ${color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2">
                    {new Date(quote.created_at).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
