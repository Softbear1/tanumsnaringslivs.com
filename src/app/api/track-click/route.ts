export const runtime = "edge";

import { createAdminClient } from "@/lib/supabase-admin";

type Body = {
  offerId?: string;
  businessId?: string | null;
  kind?: "ad" | "flash";
};

// Loggar ett klick på en annons eller ett blixterbjudande. Anropas via
// navigator.sendBeacon från klienten, så svaret behöver bara vara 204.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response(null, { status: 204 });
  }

  const { offerId, businessId, kind } = body;
  if (!offerId || (kind !== "ad" && kind !== "flash")) {
    return new Response(null, { status: 204 });
  }

  const supabase = createAdminClient();
  if (supabase) {
    await supabase
      .from("offer_clicks")
      .insert({ offer_id: offerId, business_id: businessId ?? null, kind });
  }

  return new Response(null, { status: 204 });
}
