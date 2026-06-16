export const runtime = "edge";
import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, Building2, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReviewForm from "@/components/ReviewForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OffertPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/admin/logga-in?next=/offert/${id}`);
  }

  const { data: quote } = await supabase
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!quote) {
    redirect("/");
  }

  const { data: qrb } = await supabase
    .from("quote_request_businesses")
    .select("business_id, notified_at")
    .eq("quote_request_id", id);

  const businessIds = (qrb ?? []).map((r) => r.business_id as string);
  const { data: businesses } = businessIds.length
    ? await supabase
        .from("businesses")
        .select("id, name, initials, email, phone")
        .in("id", businessIds)
    : { data: [] };

  // Once the quote is handled, the customer can review the businesses it went to.
  // Skip any they've already reviewed.
  let reviewableBusinesses: typeof businesses = [];
  if (quote.status === "handled" && businessIds.length) {
    const { data: existing } = await supabase
      .from("reviews")
      .select("business_id")
      .eq("quote_request_id", id);
    const reviewed = new Set((existing ?? []).map((r) => r.business_id as string));
    reviewableBusinesses = (businesses ?? []).filter((b) => !reviewed.has(b.id));
  }

  const createdAt = new Date(quote.created_at).toLocaleString("sv-SE", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="mb-6 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-[var(--accent)]" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--primary)]">Din offertförfrågan</h1>
              <p className="text-sm text-[var(--muted)]">Skickad {createdAt}</p>
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-6 mb-4">
            <h2 className="font-semibold text-[var(--primary)] mb-3">Vad du söker</h2>
            <p className="text-[var(--muted)] leading-relaxed">{quote.summary}</p>

            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-2">
              {quote.status === "pending" ? (
                <>
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-700 font-medium">Väntar på svar från företagen</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-sm text-[var(--accent)] font-medium">Hanterad</span>
                </>
              )}
            </div>
          </div>

          {/* Businesses notified */}
          {(businesses ?? []).length > 0 && (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-6 mb-4">
              <h2 className="font-semibold text-[var(--primary)] mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Förfrågan skickad till
              </h2>
              <div className="space-y-3">
                {(businesses ?? []).map((biz) => (
                  <div key={biz.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold shrink-0">
                      {biz.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--primary)]">{biz.name}</p>
                      <p className="text-xs text-[var(--muted)]">{biz.email} · {biz.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review prompt — only once the quote is handled */}
          {quote.status === "handled" && reviewableBusinesses.length > 0 && (
            <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-6 mb-4">
              <h2 className="font-semibold text-[var(--primary)] mb-1 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" fill="var(--star)" />
                Lämna ett omdöme
              </h2>
              <p className="text-sm text-[var(--muted)] mb-4">
                Hur gick det? Ditt omdöme hjälper andra i Tanum att hitta rätt företag.
              </p>
              <div className="space-y-3">
                {reviewableBusinesses.map((biz) => (
                  <ReviewForm
                    key={biz.id}
                    quoteRequestId={id}
                    businessId={biz.id}
                    businessName={biz.name}
                    businessInitials={biz.initials}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Contact info */}
          <div className="bg-white rounded-2xl border border-[var(--border)] card-shadow p-6">
            <h2 className="font-semibold text-[var(--primary)] mb-3">Dina uppgifter</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="text-[var(--muted)] w-20 shrink-0">Namn</dt>
                <dd className="text-[var(--primary)] font-medium">{quote.contact_name}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-[var(--muted)] w-20 shrink-0">E-post</dt>
                <dd className="text-[var(--primary)] font-medium">{quote.contact_email}</dd>
              </div>
              {quote.contact_phone && (
                <div className="flex gap-3">
                  <dt className="text-[var(--muted)] w-20 shrink-0">Telefon</dt>
                  <dd className="text-[var(--primary)] font-medium">{quote.contact_phone}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
              ← Tillbaka till Tanums Näringsliv
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
