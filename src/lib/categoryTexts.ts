// Handskrivna introtexter för kategorisidorna (/hitta/[kategori]).
// Ton enligt DESIGN.md §8: enkel och rak svenska, du-tilltal, inga superlativ.
// Texterna är statiska med avsikt — unikt innehåll per sida är det som gör
// att sidorna förtjänar att rankas, en mallmening gör det inte.

export const categoryIntros: Record<string, { intro: string; meta: string }> = {
  bygg: {
    intro:
      "Ska du bygga altan, lägga om taket eller renovera köket? I Tanum finns snickare, murare, elektriker, rörmokare och markentreprenörer från Tanumshede till Hamburgsund. Många är små firmor där du pratar direkt med den som gör jobbet — och som vet hur man bygger för västkustväder och grund på granit.",
    meta: "Hitta snickare, elektriker, rörmokare och andra hantverkare i Tanums kommun. Lokala byggföretag från Tanumshede, Grebbestad, Fjällbacka och Hamburgsund.",
  },
  restaurang: {
    intro:
      "Från fiskrestauranger vid kajen i Grebbestad och Fjällbacka till luncher och fik inne i Tanumshede. Här hittar du kommunens restauranger, caféer och matställen — både de som har öppet året runt och de som slår upp portarna när sommargästerna kommer. Håll utkik efter blixterbjudanden, många ställen lägger upp dagens erbjudande här.",
    meta: "Restauranger, caféer och matställen i Tanum — Grebbestad, Fjällbacka, Tanumshede och Hamburgsund. Öppettider, kontakt och dagens erbjudanden.",
  },
  skonhet: {
    intro:
      "Frisörer, hudterapeuter, massörer och naprapater i Tanums kommun. De flesta salonger är småföretag med bokning per telefon — här hittar du numret direkt, utan omvägar. Bra att veta som sommargäst: boka i god tid under högsäsong.",
    meta: "Frisörer, massörer, hudvård och hälsa i Tanum. Hitta salonger i Tanumshede, Grebbestad och Fjällbacka med telefonnummer och kontaktuppgifter.",
  },
  tjanster: {
    intro:
      "Redovisning, juridik, städ, flytt och andra tjänster för både hushåll och företag. Många av kommunens tjänsteföretag jobbar i hela norra Bohuslän, så även om kontoret ligger i Tanumshede kommer de gärna ut till dig. Beskriv vad du behöver i chatten så matchar vi dig med rätt företag.",
    meta: "Tjänsteföretag och konsulter i Tanum — redovisning, städ, flytt och mer. Hitta lokala företag som jobbar i hela norra Bohuslän.",
  },
  butiker: {
    intro:
      "Handla lokalt i Tanum: livsmedel, kläder, järnhandel, inredning och specialbutiker. Butikerna i Grebbestad och Fjällbacka lever med säsongen, medan Tanumshede har handeln som håller öppet året om. Varje krona som stannar i kommunen gör bygden lite starkare.",
    meta: "Butiker och handel i Tanums kommun — livsmedel, kläder, järnhandel och specialbutiker i Tanumshede, Grebbestad och Fjällbacka.",
  },
  turism: {
    intro:
      "Kajakturer mellan kobbarna, hummersafari, boenden och guidningar vid hällristningarna i Vitlycke — världsarv sedan 1994. Tanums upplevelseföretag drivs ofta av folk som vuxit upp här och kan vattnen, lederna och historien. Boka direkt hos företaget, utan mellanhänder.",
    meta: "Upplevelser och turism i Tanum — kajak, hummersafari, boende och guidningar vid världsarvet i Vitlycke. Boka direkt hos lokala företag.",
  },
  fastighet: {
    intro:
      "Mäklare, fastighetsförvaltning och uthyrning i Tanums kommun. Bostadsmarknaden här är speciell — fritidshus vid kusten, åretruntboende inåt landet — och de lokala aktörerna kan skillnaden. Här hittar du dem som förmedlar, förvaltar och hyr ut.",
    meta: "Fastighetsmäklare, förvaltning och uthyrning i Tanum. Lokala aktörer som kan bostadsmarknaden vid kusten och i inlandet.",
  },
  transport: {
    intro:
      "Åkerier, taxi, bud och maskintransporter i Tanum. Behöver du flytta grus, få hem en container eller skjuts till Strömstad tidigt en morgon — här finns företagen som kör. De flesta tar uppdrag i hela norra Bohuslän.",
    meta: "Transport i Tanum — åkerier, taxi, bud och maskintransporter i norra Bohuslän. Hitta lokala transportföretag med kontaktuppgifter.",
  },
  lantbruk: {
    intro:
      "Tanum är mer än kusten. Inåt landet ligger gårdarna med kött, ägg och grönsaker, och i hamnarna landas skaldjur som gjort trakten känd — grebbestadsostronen inte minst. Här hittar du producenterna; många säljer direkt från gården eller båten.",
    meta: "Lantbruk och fiske i Tanum — gårdsbutiker, lokalproducerat och skaldjur från norra Bohuslän. Köp direkt från producenten.",
  },
  industri: {
    intro:
      "Verkstäder, stenhuggerier och tillverkande företag. Graniten från Bohuslän har byggt gator och kajer i hela Europa, och hantverkskunnandet lever kvar i kommunens industriföretag. Här finns de som svetsar, gjuter, hugger och tillverkar.",
    meta: "Industri och tillverkning i Tanum — verkstäder, stenhuggerier och tillverkande företag i Bohuslän.",
  },
  it: {
    intro:
      "Hemsidor, IT-support, nätverk och teknik. Du behöver inte åka till Uddevalla eller Göteborg — det finns folk i kommunen som bygger, lagar och supportar. Bra att ha numret till innan skrivaren strular en fredag eftermiddag.",
    meta: "IT och teknik i Tanum — hemsidor, support och nätverk från lokala företag i kommunen.",
  },
};
