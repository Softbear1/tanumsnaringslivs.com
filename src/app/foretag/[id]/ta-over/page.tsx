export const runtime = "edge";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase-admin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClaimClient from "./ClaimClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Ta över ditt företag – Tanums Näringsliv",
  robots: { index: false },
};

export default async function TaOverPage({ params }: PageProps) {
  const { id } = await params;
  const admin = createAdminClient();
  if (!admin) notFound();

  const { data: biz } = await admin
    .from("businesses")
    .select("id, name, claimed, owner_id, claim_email")
    .eq("id", id)
    .maybeSingle();

  if (!biz) notFound();

  const alreadyClaimed = Boolean(biz.owner_id || biz.claimed);

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href={`/foretag/${biz.id}`}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till företaget
          </Link>

          <div className="bg-white rounded-2xl card-shadow p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-[var(--primary)] mb-1">Ta över {biz.name}</h1>

            {alreadyClaimed ? (
              <p className="text-[var(--muted)] mt-3 text-sm leading-relaxed">
                Den här listningen administreras redan av en verifierad ägare. Tror du att det är
                fel? Kontakta oss på{" "}
                <a href="mailto:elias.bengtsson@live.com" className="text-[var(--accent)] underline">
                  elias.bengtsson@live.com
                </a>{" "}
                så hjälper vi dig.
              </p>
            ) : (
              <ClaimClient
                businessId={biz.id}
                hasClaimEmail={Boolean(biz.claim_email)}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
