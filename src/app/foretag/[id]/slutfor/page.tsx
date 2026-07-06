export const runtime = "edge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Slutför övertagandet: körs efter att den magiska länken loggat in användaren.
// Verifierar att den inloggade adressen matchar företagets registrerade adress
// och sätter då owner_id. Detta är beviset på ägarskap.
export default async function SlutforPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/admin/logga-in?next=${encodeURIComponent(`/foretag/${id}/slutfor`)}`);
  }

  const admin = createAdminClient();
  if (!admin) {
    return <Message title="Tjänsten är inte konfigurerad" body="Försök igen senare." />;
  }

  const { data: biz } = await admin
    .from("businesses")
    .select("id, name, claimed, owner_id, claim_email")
    .eq("id", id)
    .maybeSingle();

  if (!biz) {
    return <Message title="Företaget hittades inte" body="Listningen finns inte längre." />;
  }

  // Redan din? Gå vidare.
  if (biz.owner_id && biz.owner_id === user.id) {
    redirect("/admin");
  }

  // Ägd av någon annan.
  if (biz.owner_id) {
    return (
      <Message
        title="Listningen administreras redan"
        body="Den här listningen har redan en verifierad ägare. Kontakta oss om du tror att det är fel."
      />
    );
  }

  const userEmail = (user.email ?? "").toLowerCase();
  const claimEmail = (biz.claim_email ?? "").toLowerCase();

  // Adressen måste matcha den registrerade — annars är det inte ett giltigt bevis.
  if (!claimEmail || userEmail !== claimEmail) {
    return (
      <Message
        title="Länken matchar inte din inloggning"
        body={`Du är inloggad som ${user.email}. Övertagandelänken skickades till företagets registrerade adress. Logga in med den adressen, eller begär ett manuellt övertagande.`}
      />
    );
  }

  // Allt stämmer — tilldela ägarskap.
  await admin
    .from("businesses")
    .update({ owner_id: user.id, claimed: true })
    .eq("id", biz.id);

  redirect("/admin");
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white rounded-2xl card-shadow p-8">
            <h1 className="text-xl font-bold text-[var(--primary)] mb-3">{title}</h1>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">{body}</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[var(--brand)] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[var(--brand-hover)] transition-colors text-sm"
            >
              Till startsidan
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
