// Tunn klient mot /api/claim. Claim-flödet gick tidigare via server actions,
// men de svarar 404 på Cloudflare Pages-deployen — därför vanlig fetch.

export type ClaimResult =
  | { status: "sent"; email: string }
  | { status: "already" }
  | { status: "no-email" }
  | { status: "error"; message: string };

export type ClaimVerifyResult = { ok: boolean; error?: string; code?: "no_orgnr" };

export async function claimApi<T>(body: {
  op: "send-link" | "verify-orgnr" | "manual";
  businessId: string;
  email?: string;
  orgNr?: string;
  message?: string;
}): Promise<T> {
  const res = await fetch("/api/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`claim api ${res.status}`);
  return (await res.json()) as T;
}
