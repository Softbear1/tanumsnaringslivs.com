// Klientsidans hjälpare för att logga klick på annonser och blixterbjudanden.
// Använder sendBeacon så att loggningen hinner skickas även när klicket leder
// vidare till en annan sida eller extern länk.

export function trackOfferClick(
  offerId: string,
  businessId: string | null | undefined,
  kind: "ad" | "flash"
) {
  try {
    const payload = JSON.stringify({ offerId, businessId: businessId ?? null, kind });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/track-click", payload);
    } else {
      void fetch("/api/track-click", {
        method: "POST",
        body: payload,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    // Statistik får aldrig störa användarflödet.
  }
}
