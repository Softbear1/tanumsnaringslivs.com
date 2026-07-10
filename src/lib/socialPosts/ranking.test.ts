import { describe, it, expect } from "vitest";
import { rankPool, type PoolBusiness, type HistoryRow } from "./ranking";

const TODAY = "2026-07-10";

const pool: PoolBusiness[] = [
  { id: "a", name: "Alfa", created_at: "2024-01-01" },
  { id: "b", name: "Beta", created_at: "2024-02-01" },
  { id: "c", name: "Gamma", created_at: "2024-03-01" },
];

describe("rankPool", () => {
  it("sätter aldrig-visade företag först, äldsta created_at först", () => {
    const ranked = rankPool(pool, [], TODAY);
    expect(ranked.map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("prioriterar det som väntat längst bland visade", () => {
    const history: HistoryRow[] = [
      { business_id: "a", scheduled_date: "2026-07-01" }, // visad nyligen
      { business_id: "b", scheduled_date: "2026-06-01" }, // visad för länge sen
      { business_id: "c", scheduled_date: "2026-06-15" },
    ];
    const ranked = rankPool(pool, history, TODAY);
    // b väntat längst, sedan c, sedan a.
    expect(ranked.map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("blandar aldrig-visade (först) med visade (efter)", () => {
    const history: HistoryRow[] = [{ business_id: "a", scheduled_date: "2026-05-01" }];
    const ranked = rankPool(pool, history, TODAY);
    // b och c är aldrig-visade → först (äldsta created_at först), a sist.
    expect(ranked.map((r) => r.id)).toEqual(["b", "c", "a"]);
  });

  it("utesluter företag som redan är köade idag eller framåt", () => {
    const history: HistoryRow[] = [
      { business_id: "b", scheduled_date: TODAY }, // köad idag
      { business_id: "c", scheduled_date: "2026-07-20" }, // köad framåt
    ];
    const ranked = rankPool(pool, history, TODAY);
    expect(ranked.map((r) => r.id)).toEqual(["a"]);
  });

  it("räknar bara senaste visningen per företag", () => {
    const history: HistoryRow[] = [
      { business_id: "a", scheduled_date: "2026-01-01" },
      { business_id: "a", scheduled_date: "2026-07-05" }, // senaste
      { business_id: "b", scheduled_date: "2026-07-02" },
    ];
    const ranked = rankPool(pool, history, TODAY);
    // c aldrig visad → först. Sedan b (2026-07-02) före a (2026-07-05).
    expect(ranked.map((r) => r.id)).toEqual(["c", "b", "a"]);
  });

  it("ignorerar historikrader utan business_id", () => {
    const history: HistoryRow[] = [{ business_id: null, scheduled_date: TODAY }];
    const ranked = rankPool(pool, history, TODAY);
    expect(ranked.map((r) => r.id)).toEqual(["a", "b", "c"]);
  });
});
