"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase-browser";

// Godkänn/neka-knappar för manuella övertagandebegäranden i super-admin.
// Skriver via webbläsarklienten — RLS-policyn i
// supabase/add_superadmin_rls_claim_requests.sql släpper igenom super-admin-
// kontot. Godkännande sätter listningens claim_email till begärarens adress
// och skickar en inloggningslänk dit; /foretag/[id]/slutfor sätter owner_id
// när mottagaren klickar, eftersom adresserna då matchar — samma bevis-
// mekanism som det automatiska claim-flödet, fast admin-verifierat.
export default function SuperClaimButtons({
  id,
  businessId,
  claimantEmail,
}: {
  id: string;
  businessId: string;
  claimantEmail: string;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function approve() {
    setBusy(true);
    const supabase = createBrowserClient();

    const { data: biz } = await supabase
      .from("businesses")
      .select("id, owner_id, claimed")
      .eq("id", businessId)
      .maybeSingle();

    if (!biz || biz.owner_id || biz.claimed) {
      await supabase.from("claim_requests").update({ status: "rejected", resolved_at: new Date().toISOString() }).eq("id", id);
      setBusy(false);
      router.refresh();
      return;
    }

    await supabase.from("businesses").update({ claim_email: claimantEmail }).eq("id", businessId);

    const next = `/foretag/${businessId}/slutfor`;
    await supabase.auth.signInWithOtp({
      email: claimantEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });

    await supabase.from("claim_requests").update({ status: "approved", resolved_at: new Date().toISOString() }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  async function reject() {
    setBusy(true);
    const supabase = createBrowserClient();
    await supabase.from("claim_requests").update({ status: "rejected", resolved_at: new Date().toISOString() }).eq("id", id);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={reject}
        disabled={busy}
        className="p-2 text-[var(--muted)] hover:text-red-600 border border-[var(--border)] rounded-lg disabled:opacity-50"
        title="Neka"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={approve}
        disabled={busy}
        className="flex items-center gap-1.5 px-3 py-2 bg-[var(--brand)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--brand-hover)] transition-colors disabled:opacity-50"
      >
        <Check className="w-3.5 h-3.5" /> Godkänn
      </button>
    </div>
  );
}
