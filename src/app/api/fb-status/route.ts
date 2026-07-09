export const runtime = "edge";

// Diagnos för Facebook-kopplingen: visar om FB_PAGE_ID/FB_PAGE_TOKEN når
// runtimen och om token faktiskt fungerar mot Graph API. Läser bara — postar
// aldrig något. Avslöjar inga hemligheter, bara statusflaggor och sidnamn.
export async function GET() {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_TOKEN;
  const version = process.env.FB_GRAPH_VERSION || "v21.0";

  const status: Record<string, unknown> = {
    fb_page_id_satt: Boolean(pageId),
    fb_page_token_satt: Boolean(token),
    graph_version: version,
  };

  if (!pageId || !token) {
    status.diagnos =
      "Miljövariablerna når inte runtimen. Kontrollera att FB_PAGE_ID och FB_PAGE_TOKEN " +
      "är satta som secrets på rätt miljö (Production vs Preview) i Cloudflare Pages, " +
      "och att en ny deploy gjorts efter att de sattes.";
    return Response.json(status);
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${pageId}?fields=id,name&access_token=${encodeURIComponent(token)}`
    );
    const data = (await res.json()) as {
      id?: string;
      name?: string;
      error?: { message?: string; type?: string; code?: number };
    };

    if (!res.ok || data.error) {
      status.graph_ok = false;
      status.graph_fel = data.error ?? { message: `HTTP ${res.status}` };
      status.diagnos =
        "Graph API avvisar anropet. Vanliga orsaker: token är en användartoken i stället " +
        "för en Page Access Token, token har gått ut, eller FB_PAGE_ID är inte sidans id.";
    } else {
      status.graph_ok = true;
      status.sida = { id: data.id, namn: data.name };
      status.diagnos =
        "Konfigurationen ser korrekt ut. Om inlägg ändå inte publiceras: kontrollera att " +
        "token har behörigheten pages_manage_posts (se Cloudflare-loggarna för Graph-fel " +
        "vid själva postningen).";
    }
  } catch (err) {
    status.graph_ok = false;
    status.graph_fel = { message: err instanceof Error ? err.message : String(err) };
    status.diagnos = "Kunde inte nå Graph API.";
  }

  return Response.json(status);
}
