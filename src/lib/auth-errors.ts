// Supabase Auth svarar med engelska felmeddelanden. De vanligaste översätts
// till begriplig svenska innan de visas — ett rått "For security purposes,
// you can only request this after 47 seconds" mitt i claim-flödet stjälper
// mer än det hjälper.
export function svAuthError(message: string | null | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("rate limit") || m.includes("only request this after")) {
    return "För många försök just nu. Vänta en minut och försök sedan igen.";
  }
  if (m.includes("invalid") && m.includes("email")) {
    return "E-postadressen ser inte giltig ut. Kontrollera stavningen och försök igen.";
  }
  if (m.includes("expired")) {
    return "Länken har gått ut. Be om en ny så skickar vi direkt.";
  }
  return "Något gick fel på vägen. Försök igen om en stund.";
}
