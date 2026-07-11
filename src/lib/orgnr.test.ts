import { describe, it, expect } from "vitest";
import { orgNrMatches } from "./orgnr";

describe("orgNrMatches", () => {
  it("matchar exakt samma nummer", () => {
    expect(orgNrMatches("5566778899", "5566778899")).toBe(true);
  });

  it("ignorerar bindestreck och mellanslag", () => {
    expect(orgNrMatches("556677-8899", "5566778899")).toBe(true);
    expect(orgNrMatches("556677 8899", "556677-8899")).toBe(true);
  });

  it("matchar 12-siffrigt personnummer mot 10-siffrigt i registret (enskild firma)", () => {
    expect(orgNrMatches("196512248899", "6512248899")).toBe(true);
    expect(orgNrMatches("19651224-8899", "651224-8899")).toBe(true);
  });

  it("matchar 10-siffrig inmatning mot 12-siffrigt register", () => {
    expect(orgNrMatches("6512248899", "196512248899")).toBe(true);
  });

  it("avvisar fel nummer", () => {
    expect(orgNrMatches("5566778800", "5566778899")).toBe(false);
    expect(orgNrMatches("651224-8898", "196512248899")).toBe(false);
  });

  it("avvisar tomt och för kort", () => {
    expect(orgNrMatches("", "5566778899")).toBe(false);
    expect(orgNrMatches("12345", "5566778899")).toBe(false);
  });
});
