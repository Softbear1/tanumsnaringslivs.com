// Tunn wrapper mot Facebook Graph API för att publicera inlägg på en
// Facebook-sida. Kräver en permanent Page Access Token och sidans id, båda
// satta som miljövariabler (Cloudflare-secrets):
//
//   FB_PAGE_ID       — id för Facebook-sidan
//   FB_PAGE_TOKEN    — permanent Page Access Token
//   FB_GRAPH_VERSION — valfri, default v21.0
//
// Alla anrop är edge-säkra (bara fetch). Funktionerna kastar vid fel så att
// anroparen kan logga och gå vidare till nästa erbjudande.

const GRAPH_VERSION = process.env.FB_GRAPH_VERSION || "v21.0";

export function facebookConfigured(): boolean {
  return Boolean(process.env.FB_PAGE_ID && process.env.FB_PAGE_TOKEN);
}

function graphUrl(path: string): string {
  return `https://graph.facebook.com/${GRAPH_VERSION}/${path}`;
}

async function graphPost(path: string, params: Record<string, string>): Promise<string> {
  const token = process.env.FB_PAGE_TOKEN;
  if (!token) throw new Error("FB_PAGE_TOKEN saknas");

  const body = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(graphUrl(path), { method: "POST", body });
  const data = (await res.json()) as { id?: string; post_id?: string; error?: { message?: string } };

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Graph API-fel (${res.status})`);
  }
  // /photos returnerar både id (foto) och post_id (inlägget); /feed returnerar id.
  return data.post_id || data.id || "";
}

/** Postar en bild (via URL) med bildtext. Returnerar inläggets id. */
export function postPhotoToPage(imageUrl: string, caption: string): Promise<string> {
  const pageId = process.env.FB_PAGE_ID;
  if (!pageId) throw new Error("FB_PAGE_ID saknas");
  return graphPost(`${pageId}/photos`, { url: imageUrl, caption });
}

/** Postar ett text-/länkinlägg (fallback när bild saknas). Returnerar inläggets id. */
export function postLinkToPage(message: string, link: string): Promise<string> {
  const pageId = process.env.FB_PAGE_ID;
  if (!pageId) throw new Error("FB_PAGE_ID saknas");
  return graphPost(`${pageId}/feed`, { message, link });
}
