// Jämförelse av organisationsnummer. Formatet varierar: "556677-8899",
// "5566778899", och för enskild firma anges ofta personnumret med sekel
// (12 siffror) fast registret har 10 — eller tvärtom. Jämför därför de
// sista tio siffrorna, oavsett skiljetecken.
export function orgNrMatches(input: string, stored: string): boolean {
  const a = input.replace(/\D/g, "");
  const b = stored.replace(/\D/g, "");
  if (a.length < 10 || b.length < 10) return a === b && a.length > 0;
  return a.slice(-10) === b.slice(-10);
}
