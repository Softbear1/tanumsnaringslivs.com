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
