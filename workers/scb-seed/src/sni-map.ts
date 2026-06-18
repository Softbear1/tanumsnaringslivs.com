// Mappar SNI 2025 (femsiffrig näringsgrenskod) till Tanums Näringslivs kategorier.
// Mappningen sker på tvåsiffrig avdelning (de två första siffrorna) med några
// finkorniga undantag. Okända koder hamnar i "butiker" som generell fallback —
// ägaren kan justera kategori när hen tar över listningen.

export type CategoryId =
  | "bygg" | "restaurang" | "skonhet" | "butiker"
  | "transport" | "it" | "fastighet" | "turism";

export function mapSniToCategory(sni: string | null | undefined): CategoryId {
  const code = (sni ?? "").replace(/\D/g, "");
  const d2 = code.slice(0, 2);
  const d4 = code.slice(0, 4);

  // Specifika undantag först (fyrsiffrig nivå)
  if (d4 === "9602") return "skonhet";        // Hår- och skönhetsvård
  if (d4 === "9604") return "skonhet";        // Kroppsvård
  if (d4 === "4711" || d4 === "4719") return "butiker";

  switch (d2) {
    // Bygg & hantverk
    case "41": case "42": case "43":
      return "bygg";

    // Restaurang & café
    case "56":
      return "restaurang";

    // Skönhet & hälsa
    case "86": case "87": case "88":
      return "skonhet";

    // Butiker / handel
    case "45": case "47":
      return "butiker";

    // Transport
    case "49": case "50": case "51": case "52": case "53":
      return "transport";

    // IT & teknik
    case "58": case "61": case "62": case "63": case "26": case "95":
      return "it";

    // Fastighet
    case "68":
      return "fastighet";

    // Turism & upplevelser
    case "55": case "79": case "90": case "91": case "93": case "77":
      return "turism";

    default:
      return "butiker";
  }
}
