export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ReadyPayload {
  businessIds: string[];
  summary: string;
  categoryId: string | null;
}

/**
 * Prepare the conversation for the Anthropic Messages API.
 *
 * The API requires the messages array to:
 *  - be non-empty
 *  - start with a `user` message
 *
 * Our UI seeds a hardcoded assistant greeting for display, so we must strip any
 * leading assistant messages before sending — otherwise the API returns a 400.
 */
export function toApiMessages(msgs: ChatMessage[]): ChatMessage[] {
  let start = 0;
  while (start < msgs.length && msgs[start].role !== "user") {
    start++;
  }
  return msgs.slice(start);
}

/** Parse a trailing READY:{...} marker from an assistant message. */
export function extractReady(text: string): { clean: string; payload: ReadyPayload | null } {
  const idx = text.lastIndexOf("READY:");
  if (idx === -1) return { clean: text, payload: null };
  try {
    const json = text.slice(idx + 6).trim();
    const payload = JSON.parse(json) as ReadyPayload;
    return { clean: text.slice(0, idx).trim(), payload };
  } catch {
    return { clean: text, payload: null };
  }
}

/** A business listing drafted by the admin onboarding assistant. */
export interface BusinessDraft {
  name: string;
  category_id: string;
  description: string;
  phone: string;
  email: string;
  website: string | null;
  address: string;
  initials: string;
  logo_url?: string | null;
}

/**
 * Parse a trailing DRAFT:{...} marker holding a business listing the assistant
 * has gathered. Kept separate from extractReady so the customer and admin chats
 * use distinct, type-safe markers.
 */
export function extractDraft(text: string): { clean: string; draft: BusinessDraft | null } {
  const idx = text.lastIndexOf("DRAFT:");
  if (idx === -1) return { clean: text, draft: null };
  try {
    const draft = JSON.parse(text.slice(idx + 6).trim()) as BusinessDraft;
    return { clean: text.slice(0, idx).trim(), draft };
  } catch {
    return { clean: text, draft: null };
  }
}

/** An ad drafted by the admin ad assistant. */
export interface AdDraft {
  headline: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  category_id: string | null;
}

/**
 * Parse a trailing ANNONS:{...} marker holding an ad draft. Uses a distinct
 * marker word (not containing "DRAFT") so it never collides with extractDraft.
 */
export function extractAdDraft(text: string): { clean: string; ad: AdDraft | null } {
  const idx = text.lastIndexOf("ANNONS:");
  if (idx === -1) return { clean: text, ad: null };
  try {
    const ad = JSON.parse(text.slice(idx + 7).trim()) as AdDraft;
    return { clean: text.slice(0, idx).trim(), ad };
  } catch {
    return { clean: text, ad: null };
  }
}
