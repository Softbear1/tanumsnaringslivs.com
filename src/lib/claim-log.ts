import type { createAdminClient } from "@/lib/supabase-admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

// Skriver ett spår i claim_attempt_log — så att claim-försök syns någonstans
// (lyckade som misslyckade) i stället för att bara försvinna som en spinner
// som aldrig landar. Får aldrig själv stoppa flödet, därför fångas alla fel.
export async function logClaimAttempt(
  admin: AdminClient,
  params: { businessId: string; source: string; outcome: string; targetEmail?: string | null; detail?: string | null },
) {
  try {
    await admin.from("claim_attempt_log").insert({
      business_id: params.businessId,
      source: params.source,
      outcome: params.outcome,
      target_email: params.targetEmail ?? null,
      detail: params.detail ?? null,
    });
  } catch { /* logga aldrig-fel */ }
}
