// Mappar SNI 2025 (femsiffrig näringsgrenskod) till Tanums Näringslivs kategorier.
// Mappningen sker på tvåsiffrig avdelning (de två första siffrorna) med några
// finkorniga undantag.

export type CategoryId =
  | "bygg" | "restaurang" | "skonhet" | "butiker"
  | "transport" | "it" | "fastighet" | "turism"
  | "tjanster" | "lantbruk" | "industri";

export function mapSniToCategory(sni: string | null | undefined): CategoryId {
  const code = (sni ?? "").replace(/\D/g, "");
  const d2 = code.slice(0, 2);
  const d4 = code.slice(0, 4);

  // Specifika undantag (fyrsiffrig nivå)
  if (d4 === "9602") return "skonhet";
  if (d4 === "9604") return "skonhet";
  if (d4 === "4711" || d4 === "4719") return "butiker";

  switch (d2) {
    // Lantbruk, skogsbruk & fiske
    case "01": case "02": case "03": case "05":
      return "lantbruk";

    // Industri & tillverkning (inkl. livsmedel, trä, metall, båtbyggeri)
    case "10": case "11": case "12": case "13": case "14": case "15":
    case "16": case "17": case "18": case "19": case "20": case "21":
    case "22": case "23": case "24": case "25": case "27": case "28":
    case "29": case "30": case "31": case "32": case "33":
    // Energi, vatten & avfall
    case "35": case "36": case "37": case "38": case "39":
      return "industri";

    // Bygg & hantverk (inkl. mark- och anläggning, grävning)
    case "41": case "42": case "43": case "44":
      return "bygg";

    // Butiker & handel (detaljhandel, motorfordon)
    case "45": case "47":
      return "butiker";

    // Grosshandel — närmare handel än tjänster
    case "46":
      return "butiker";

    // Restaurang & café
    case "56":
      return "restaurang";

    // Transport & logistik
    case "49": case "50": case "51": case "52": case "53":
      return "transport";

    // IT & teknik
    case "26": case "58": case "61": case "62": case "63": case "95":
      return "it";

    // Fastighet
    case "68":
      return "fastighet";

    // Turism & upplevelser
    case "55": case "77": case "79": case "90": case "91": case "93":
      return "turism";

    // Tjänster & konsult (finans, juridik, redovisning, arkitektur, konsulter)
    case "64": case "65": case "66":
    case "69": case "70": case "71": case "72": case "73": case "74": case "75":
    // Bemanning, säkerhet, facility management, callcenter m.m.
    case "78": case "80": case "81": case "82":
      return "tjanster";

    // Skönhet & hälsa
    case "86": case "87": case "88":
      return "skonhet";

    // Utbildning
    case "85":
      return "tjanster";

    // Personliga tjänster, reparationer, friskvård
    case "94": case "96":
      return "tjanster";

    default:
      return "butiker";
  }
}
