"use client";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Globe, MapPin, BadgeCheck } from "lucide-react";
import { Business, Category, getCategory } from "@/lib/data";
import clsx from "clsx";

type Props = {
  business: Business;
  categories: Category[];
  isAd?: boolean;
};

export default function BusinessCard({ business, categories, isAd }: Props) {
  const cat = getCategory(categories, business.categoryId);

  return (
    <div
      className={clsx(
        "relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group",
        "card-shadow hover:card-shadow-hover"
      )}
    >
      {/* Category color strip */}
      <div className="h-1 w-full" style={{ backgroundColor: cat?.color ?? "var(--muted)" }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo circle — visar uppladdad logga om den finns, annars initialer */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: cat?.bgColor ?? "var(--hover-bg)", color: cat?.color ?? "var(--muted)" }}
            >
              {business.logoUrl ? (
                <Image src={business.logoUrl} alt={`${business.name} logotyp`} width={48} height={48} className="object-contain w-full h-full" />
              ) : (
                business.initials
              )}
            </div>
            <div className="min-w-0">
              <Link href={`/foretag/${business.id}`} className="group/name">
                <h3 className="font-semibold text-[var(--primary)] text-base leading-tight group-hover/name:text-[var(--accent)] transition-colors line-clamp-2">
                  {business.name}
                </h3>
              </Link>
              <span
                className="inline-block text-[11px] font-medium mt-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: cat?.bgColor ?? "var(--hover-bg)", color: cat?.color ?? "var(--muted)" }}
              >
                {cat?.name}
              </span>
            </div>
          </div>

          {isAd && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-[var(--muted)] bg-gray-100 px-2 py-0.5 rounded-full">
                Annonserat
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 line-clamp-2">
          {business.description}
        </p>

        {/* Divider */}
        <div className="border-t border-[var(--border)] mb-4" />

        {/* Contact info */}
        {business.claimed ? (
          <div className="space-y-2">
            {business.phone && (
              <a
                href={`tel:${business.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors group/link"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{business.phone}</span>
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2.5 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors group/link"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{business.email}</span>
              </a>
            )}
            {business.website && (
              <a
                href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors group/link min-w-0"
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{business.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
            {business.address && (
              <div className="flex items-center gap-2.5 text-sm text-[var(--muted)]">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {business.website && (
              <a
                href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors min-w-0"
              >
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{business.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
            <Link
              href={`/foretag/${business.id}`}
              className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              <BadgeCheck className="w-4 h-4 flex-shrink-0 text-[var(--accent)]" />
              <span>Är detta ditt företag? <span className="text-[var(--accent)] font-medium">Ta över →</span></span>
            </Link>
          </div>
        )}

        <Link
          href={`/foretag/${business.id}`}
          className="mt-4 block w-full text-center text-sm font-medium text-[var(--accent)] border border-[var(--accent)]/30 rounded-xl py-2.5 hover:bg-[var(--accent)] hover:text-white transition-colors"
        >
          Visa profil
        </Link>
      </div>
    </div>
  );
}
