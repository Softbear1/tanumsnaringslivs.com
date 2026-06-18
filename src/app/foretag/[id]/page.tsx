export const runtime = "edge";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Globe, MapPin, Zap, ArrowLeft, Clock, BadgeCheck } from "lucide-react";
import { getBusiness } from "@/lib/fetch";
import { stockholmToday } from "@/lib/time";
import { getCategory } from "@/lib/data";
import { createServerClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { business, categories } = await getBusiness(id);

  if (!business) {
    return { title: "Företaget hittades inte – Tanums Näringsliv" };
  }

  const cat = getCategory(categories, business.categoryId);
  const title = `${business.name} – ${cat?.name ?? "Företag"} i Tanum`;
  const description = business.description.slice(0, 155);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "sv_SE",
    },
    alternates: {
      canonical: `https://tanumsnaringsliv.com/foretag/${business.id}`,
    },
  };
}

export default async function ForetagPage({ params }: PageProps) {
  const { id } = await params;
  const { business, categories } = await getBusiness(id);

  if (!business) {
    notFound();
  }

  // Track page view — fire and forget, never block rendering
  let todayDeal: { headline: string; description: string | null } | null = null;
  try {
    const supabase = await createServerClient();
    supabase.from("page_views").insert({ business_id: id }).then(() => {});
    const { data } = await supabase
      .from("flash_deals")
      .select("headline, description")
      .eq("business_id", id)
      .eq("active", true)
      .eq("deal_date", stockholmToday())
      .maybeSingle();
    todayDeal = data ?? null;
  } catch { /* ignore */ }

  const cat = getCategory(categories, business.categoryId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
    ...(business.claimed && business.phone ? { telephone: business.phone } : {}),
    ...(business.claimed && business.email ? { email: business.email } : {}),
    ...(business.claimed && business.address ? {
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address,
        addressLocality: "Tanum",
        addressCountry: "SE",
      },
    } : {}),
    ...(business.website ? { url: business.website.startsWith("http") ? business.website : `https://${business.website}` } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till listan
          </Link>

          {/* Ta över-banner — visas bara för oclaimerade listningar */}
          {!business.claimed && (
            <div className="mb-6 rounded-2xl border-2 border-[var(--accent)]/40 bg-[var(--accent)]/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-[var(--primary)] mb-0.5">Är detta ditt företag?</h2>
                <p className="text-sm text-[var(--muted)]">
                  Ta över din kostnadsfria listning så kan du redigera uppgifterna, skapa
                  blixterbjudanden och annonser — gratis.
                </p>
              </div>
              <Link
                href={`/foretag/${business.id}/ta-over`}
                className="inline-flex items-center justify-center gap-1.5 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-colors text-sm whitespace-nowrap"
              >
                Ta över företaget →
              </Link>
            </div>
          )}

          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="h-2 w-full" style={{ backgroundColor: cat?.color ?? "#6B7280" }} />

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: cat?.bgColor ?? "#F3F4F6", color: cat?.color ?? "#374151" }}
                >
                  {business.logoUrl ? (
                    <Image src={business.logoUrl} alt={`${business.name} logotyp`} width={64} height={64} className="object-contain w-full h-full" />
                  ) : (
                    business.initials
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-[var(--primary)]">{business.name}</h1>
                    {business.claimed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)]" title="Verifierad ägare">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verifierad
                      </span>
                    )}
                  </div>
                  {cat && (
                    <span
                      className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      {cat.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-[var(--muted)] leading-relaxed mb-6">{business.description}</p>

              {/* Today's flash deal banner */}
              {todayDeal && (
                <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Blixterbjudande idag</span>
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                        <Clock className="w-3 h-3" /> Gäller till midnatt
                      </span>
                    </div>
                    <p className="font-bold text-[var(--primary)] leading-snug">{todayDeal.headline}</p>
                    {todayDeal.description && (
                      <p className="text-sm text-[var(--muted)] mt-1">{todayDeal.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact */}
              {!business.claimed && (
                <div className="mb-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-[var(--muted)] text-center">
                  Kontaktuppgifter visas när företaget har tagit över sin listning.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {business.claimed && business.phone && (
                  <a
                    href={`tel:${business.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg)] hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--muted)]">Telefon</div>
                      <div className="text-sm font-medium text-[var(--primary)]">{business.phone}</div>
                    </div>
                  </a>
                )}
                {business.claimed && business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg)] hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-[var(--muted)]">E-post</div>
                      <div className="text-sm font-medium text-[var(--primary)] truncate">{business.email}</div>
                    </div>
                  </a>
                )}
                {business.website && (
                  <a
                    href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg)] hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-[var(--muted)]">Webbplats</div>
                      <div className="text-sm font-medium text-[var(--primary)] truncate">{business.website.replace(/^https?:\/\//, "")}</div>
                    </div>
                  </a>
                )}
                {business.claimed && business.address && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg)]">
                    <MapPin className="w-5 h-5 text-[var(--accent)] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-[var(--muted)]">Adress</div>
                      <div className="text-sm font-medium text-[var(--primary)]">{business.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
