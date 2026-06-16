import { describe, it, expect } from "vitest";
import { toApiMessages, extractReady, ChatMessage } from "./chat";

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
