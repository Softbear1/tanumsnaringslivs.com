import { describe, it, expect } from "vitest";
import { toApiMessages, extractReady, extractDraft, extractAdDraft, ChatMessage } from "./chat";

describe("toApiMessages", () => {
  it("strips a leading assistant greeting so the array starts with a user message", () => {
    const msgs: ChatMessage[] = [
      { role: "assistant", content: "Hej! Vad behöver du hjälp med?" },
      { role: "user", content: "Jag vill bygga en altan i Grebbestad" },
    ];
    const result = toApiMessages(msgs);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
  });

  it("keeps an alternating conversation that already starts with user", () => {
    const msgs: ChatMessage[] = [
      { role: "user", content: "a" },
      { role: "assistant", content: "b" },
      { role: "user", content: "c" },
    ];
    expect(toApiMessages(msgs)).toEqual(msgs);
  });

  it("returns an empty array when there is no user message (never sends greeting-only)", () => {
    const msgs: ChatMessage[] = [{ role: "assistant", content: "Hej!" }];
    expect(toApiMessages(msgs)).toEqual([]);
  });

  it("strips multiple leading assistant messages", () => {
    const msgs: ChatMessage[] = [
      { role: "assistant", content: "greeting" },
      { role: "assistant", content: "another" },
      { role: "user", content: "real" },
    ];
    const result = toApiMessages(msgs);
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("real");
  });
});

describe("extractReady", () => {
  it("returns null payload when no marker present", () => {
    const { clean, payload } = extractReady("Bara vanlig text");
    expect(payload).toBeNull();
    expect(clean).toBe("Bara vanlig text");
  });

  it("parses the READY marker and strips it from the visible text", () => {
    const text =
      'Jag föreslår Tanums Bygg.\nREADY:{"businessIds":["b1"],"summary":"Altan i Grebbestad","categoryId":"bygg"}';
    const { clean, payload } = extractReady(text);
    expect(clean).toBe("Jag föreslår Tanums Bygg.");
    expect(payload).toEqual({
      businessIds: ["b1"],
      summary: "Altan i Grebbestad",
      categoryId: "bygg",
    });
  });

  it("ignores a malformed marker", () => {
    const text = "Text\nREADY:{not valid json";
    const { payload } = extractReady(text);
    expect(payload).toBeNull();
  });
});

describe("extractDraft", () => {
  it("returns null draft when no marker present", () => {
    const { clean, draft } = extractDraft("Berätta mer om ditt företag");
    expect(draft).toBeNull();
    expect(clean).toBe("Berätta mer om ditt företag");
  });

  it("parses the DRAFT marker into a business draft and strips it", () => {
    const text =
      'Klart! Här är ditt förslag.\nDRAFT:{"name":"Fjällbacka Måleri","category_id":"bygg","description":"Målare i Fjällbacka","phone":"0525-1","email":"a@b.se","website":null,"address":"Strandvägen 1, Fjällbacka","initials":"FM"}';
    const { clean, draft } = extractDraft(text);
    expect(clean).toBe("Klart! Här är ditt förslag.");
    expect(draft?.name).toBe("Fjällbacka Måleri");
    expect(draft?.category_id).toBe("bygg");
    expect(draft?.website).toBeNull();
  });

  it("ignores a malformed marker", () => {
    expect(extractDraft("DRAFT:{broken").draft).toBeNull();
  });
});

describe("extractAdDraft", () => {
  it("returns null ad when no marker present", () => {
    expect(extractAdDraft("Vad vill du annonsera?").ad).toBeNull();
  });

  it("parses the ANNONS marker and strips it", () => {
    const text =
      'Klart!\nANNONS:{"headline":"25% på trallvirke","body":"Hela juni","cta_label":"Läs mer","cta_url":"https://x.se","category_id":"bygg"}';
    const { clean, ad } = extractAdDraft(text);
    expect(clean).toBe("Klart!");
    expect(ad?.headline).toBe("25% på trallvirke");
    expect(ad?.category_id).toBe("bygg");
  });

  it("does not collide with the DRAFT marker", () => {
    // An ad marker line should not be mistaken for a business draft.
    const text = 'ANNONS:{"headline":"h","body":null,"cta_label":null,"cta_url":null,"category_id":null}';
    expect(extractDraft(text).draft).toBeNull();
    expect(extractAdDraft(text).ad?.headline).toBe("h");
  });
});
