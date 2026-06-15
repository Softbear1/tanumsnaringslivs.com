-- Seed categories
insert into public.categories (id, name, icon, color, bg_color, sort_order) values
  ('bygg',      'Bygg & Hantverk',       'Hammer',          '#C2410C', '#FFF7ED', 1),
  ('restaurang','Restaurang & Café',      'UtensilsCrossed', '#0369A1', '#F0F9FF', 2),
  ('skonhet',   'Skönhet & Hälsa',       'Sparkles',        '#7C3AED', '#F5F3FF', 3),
  ('butiker',   'Butiker',               'ShoppingBag',     '#0F766E', '#F0FDFA', 4),
  ('transport', 'Transport',             'Truck',           '#1D4ED8', '#EFF6FF', 5),
  ('it',        'IT & Teknik',           'Monitor',         '#374151', '#F9FAFB', 6),
  ('fastighet', 'Fastighet',             'Home',            '#B45309', '#FFFBEB', 7),
  ('turism',    'Turism & Upplevelser',  'Map',             '#047857', '#ECFDF5', 8)
on conflict (id) do nothing;

-- Seed businesses
insert into public.businesses (name, category_id, description, phone, email, website, address, initials, boosted, featured, rating, review_count) values
  ('Tanums Bygg & Snickeri', 'bygg', 'Familjeföretag med 30 års erfarenhet av nybyggnation, renovering och allt inom snickeri på Sotenäs och i Tanum.', '0525-123 45', 'info@tanumsbygg.se', 'www.tanumsbygg.se', 'Industrivägen 4, Tanumshede', 'TB', true, false, 4.8, 47),
  ('Fjällbacka Måleri', 'bygg', 'Professionell målarmästare med certifierade hantverkare. Vi utför alla typer av målningsarbeten, invändigt och utvändigt.', '0525-456 78', 'hej@fjallbackamaleri.se', null, 'Strandvägen 12, Fjällbacka', 'FM', false, false, 4.9, 31),
  ('Grebbestad VVS', 'bygg', 'Din lokala rörmokare för installation, service och reparation av värme, vatten och sanitet.', '0525-789 01', 'kontakt@grebbevvs.se', 'www.grebbevvs.se', 'Hamnvägen 3, Grebbestad', 'GV', false, false, 4.6, 22),
  ('Hamburgsund El AB', 'bygg', 'Behörig elinstallatör för alla slags elarbeten i bostad, fritidshus och företag.', '0525-321 00', 'info@hamburgsel.se', null, 'Norra Hamnen 7, Hamburgsund', 'HE', false, false, 4.7, 18),
  ('Koster Mark & Anläggning', 'bygg', 'Markarbeten, dränering, sprängning och asfaltering.', '0525-654 32', 'projekt@kostermark.se', null, 'Kostervägen 18, Strömstad', 'KM', false, false, 4.5, 14),
  ('Café Havsbris', 'restaurang', 'Mysigt hamnkafé med husmanskost, nybakat bröd och utsikt över Grebbestad. Öppet maj–september.', '0525-112 23', 'info@cafehavsbris.se', 'www.cafehavsbris.se', 'Kajen 1, Grebbestad', 'CH', true, false, 4.9, 124),
  ('Fjällbacka Krog', 'restaurang', 'Klassisk krog i hjärtat av Fjällbacka. Säsongsmenyer med lokalt fångad fisk.', '0525-334 55', 'boka@fjallbackakrog.se', 'www.fjallbackakrog.se', 'Ingrid Bergmans torg 4, Fjällbacka', 'FK', false, false, 4.7, 89),
  ('Tanums Pizzeria', 'restaurang', 'Hemgjord pizza, pasta och sallader. Takeaway och leverans i Tanumshede.', '0525-445 67', 'order@tanumspizzeria.se', null, 'Affärsvägen 5, Tanumshede', 'TP', false, false, 4.3, 56),
  ('Smak av Bohuslän', 'restaurang', 'Delikatessbutik och bistro med fokus på lokala producenter.', '0525-556 78', 'info@smakavbohuslan.se', null, 'Storgatan 2, Tanumshede', 'SB', false, false, 4.8, 43),
  ('Hälsostudio Tanum', 'skonhet', 'Gym, yoga och personlig träning.', '0525-667 89', 'traning@halsosdiotanum.se', 'www.halsosdiotanum.se', 'Södervägen 9, Tanumshede', 'HT', false, false, 4.6, 38),
  ('Salong Ingela', 'skonhet', 'Välkommen till en klassisk damfrisör med moderna tekniker.', '0525-778 90', 'boka@salongingela.se', null, 'Storgatan 14, Tanumshede', 'SI', true, false, 4.9, 72),
  ('Kusthälsan Massage', 'skonhet', 'Medicinsk massage, zonterapi och akupunktur.', '0525-889 01', 'tid@kusthalsam.se', 'www.kusthalsam.se', 'Hälsovägen 2, Grebbestad', 'KH', false, false, 4.8, 29),
  ('Bohushandel', 'butiker', 'Välsorterad järnhandel och byggvarubutik.', '0525-990 12', 'info@bohushandel.se', null, 'Industrivägen 1, Tanumshede', 'BH', false, false, 4.4, 61),
  ('Kustboden', 'butiker', 'Inredning, presenter och lokala hantverk.', '0525-101 23', 'hej@kustboden.se', 'www.kustboden.se', 'Kajen 5, Fjällbacka', 'KB', false, false, 4.8, 34),
  ('Tanum Sport & Fritid', 'butiker', 'Sportbutik med allt för friluftsliv, havet och vintern.', '0525-213 45', 'sport@tanumsport.se', null, 'Storgatan 8, Tanumshede', 'TS', false, false, 4.5, 27),
  ('Bohus Transport', 'transport', 'Lokal åkeri med containertransport och budservice.', '0525-324 56', 'jobb@bohustransport.se', null, 'Hamnvägen 11, Hamburgsund', 'BT', false, false, 4.6, 19),
  ('Kusttaxi Tanum', 'transport', 'Taxi och skärgårdsresor dygnet runt.', '0525-435 67', 'boka@kusttaxi.se', 'www.kusttaxi.se', 'Centralgatan 3, Tanumshede', 'KT', false, false, 4.7, 44),
  ('Västkusten Web', 'it', 'Webbyrå specialiserad på lokala företag.', '0525-546 78', 'projekt@vastkustenweb.se', 'www.vastkustenweb.se', 'Teknikvägen 6, Tanumshede', 'VW', true, false, 4.9, 23),
  ('Tanum IT-Support', 'it', 'PC-support, nätverkslösningar och IT-säkerhet.', '0525-657 89', 'support@tanumit.se', null, 'Storgatan 22, Tanumshede', 'TI', false, false, 4.5, 31),
  ('Kustmäklaren', 'fastighet', 'Fastighetsmäklare med djup lokalkännedom om Bohuskusten.', '0525-768 90', 'info@kustmaklaren.se', 'www.kustmaklaren.se', 'Strandvägen 1, Grebbestad', 'KM', false, false, 4.8, 52),
  ('Tanum Förvaltning', 'fastighet', 'Fastighetsförvaltning och teknisk förvaltning.', '0525-879 01', 'kontakt@tanumforvaltning.se', null, 'Centralgatan 7, Tanumshede', 'TF', false, false, 4.4, 16),
  ('Bohusleden Äventyr', 'turism', 'Guidade kajakturerna, klättring och vandring längs Bohusleden.', '0525-980 23', 'boka@bohusledenventyr.se', 'www.bohusledeventyr.se', 'Naturvägen 1, Fjällbacka', 'BÄ', true, false, 5.0, 67),
  ('Kosterfjordens Båtcharter', 'turism', 'Hyr vår 32-fots segelbåt med eller utan skipper.', '0525-091 34', 'charter@kosterfjorden.se', null, 'Gästhamnen, Hamburgsund', 'KB', false, false, 4.9, 41),
  ('Tanums Vandrarhem', 'turism', 'Välkomnande vandrarhem mitt i Tanumshede. Nära hällristningarna.', '0525-102 45', 'bokning@tanumsvandrarhem.se', 'www.tanumsvandrarhem.se', 'Hällristningsvägen 3, Tanumshede', 'TV', false, false, 4.6, 88);
