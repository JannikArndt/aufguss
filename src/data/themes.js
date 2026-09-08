/* The Aufguss themes, read off Bäderland's own published Aufgusspläne on
   8 September 2026 — see sources/aufgussplan.md.

   Kaifubad comes first because that is where these Aufgüsse happen; the other
   houses are here because a theme is a good name for a scent whichever sauna
   thought of it, and having sixty of them beats typing one every time.

   intensity is the coloured icon on the plan, not an opinion: yellow "Sanfter
   Aufguss", orange "Mittlerer", red "Starker". time is where the theme sat on
   that day's plan — a default, nothing more; the app lets any full hour stand.
   families is only filled where the plan says the family out loud (Blankenese
   labels its slots HOLZAROMEN, FRUCHTAROMEN, KRÄUTERAROMEN, MINZAROMEN).

   A theme you invent is stored with your journal, not here. */

export const THEMES = [
  { name: "Auffrischende Brise", kind: "ÄTHERISCHE ÖLE", time: "12:00", intensity: "mittel", venue: "Kaifubad", room: "Sauna 90 °C", day: "Dienstag", families: [] },
  { name: "Aufkommende Winde", kind: "ÄTHERISCHE ÖLE", time: "14:00", intensity: "mittel", venue: "Kaifubad", room: "Sauna 90 °C", day: "Dienstag", families: [] },
  { name: "Fruchtbasar", kind: "ÄTHERISCHE ÖLE", time: "16:00", intensity: "mittel", venue: "Kaifubad", room: "Sauna 90 °C", day: "Dienstag", families: [] },
  { name: "Aroma", kind: "INHALATION", time: "18:00", intensity: "sanft", venue: "Kaifubad", room: "Sauna 90 °C", day: "Dienstag", families: [] },
  { name: "Waldfunkeln", kind: "INTENSIV HEISSER AUFGUSS", time: "19:00", intensity: "stark", venue: "Kaifubad", room: "Sauna 90 °C", day: "Dienstag", families: [] },
  { name: "Plauderwind", kind: "KLÖNSCHNACK-AUFGUSS", time: "20:00", intensity: "mittel", venue: "Kaifubad", room: "Sauna 90 °C", day: "Dienstag", families: [] },
  { name: "Minz-Sprint", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "11:30", intensity: "sanft", venue: "Alsterschwimmhalle", room: "Sauna 90 °C", day: null, families: [] },
  { name: "Kräuter-Flow", kind: "ÄTHERISCHE ÖLE", time: "12:30", intensity: "mittel", venue: "Alsterschwimmhalle", room: "Sauna 90 °C", day: null, families: [] },
  { name: "Zitrus", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "16:30", intensity: "mittel", venue: "Alsterschwimmhalle", room: "Sauna 90 °C", day: null, families: [] },
  { name: "Unikat", kind: "ÄTHERISCHES ÖL KREATION ALSTERSCHWIMMHALLE", time: "17:30", intensity: "mittel", venue: "Alsterschwimmhalle", room: "Sauna 90 °C", day: null, families: [] },
  { name: "Silence", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "19:30", intensity: "mittel", venue: "Alsterschwimmhalle", room: "Sauna 90 °C", day: null, families: [] },
  { name: "Heat", kind: "INTENSIV HEISSER AUFGUSS", time: "20:30", intensity: "stark", venue: "Alsterschwimmhalle", room: "Sauna 90 °C", day: null, families: [] },
  { name: "Relax", kind: "INHALATION", time: "21:30", intensity: "sanft", venue: "Alsterschwimmhalle", room: "Sauna 90 °C", day: null, families: [] },
  { name: "Sommerhauch", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "11:00", intensity: "sanft", venue: "Bartholomäustherme", room: "Sauna 90 °C", day: "Donnerstag", families: [] },
  { name: "Wasserklang", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "12:00", intensity: "mittel", venue: "Bartholomäustherme", room: "Sauna 90 °C", day: "Donnerstag", families: [] },
  { name: "Blütenzauber", kind: "NATURSUDE", time: "13:00", intensity: "mittel", venue: "Bartholomäustherme", room: "Sauna 90 °C", day: "Donnerstag", families: [] },
  { name: "Windspiel", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "15:00", intensity: "sanft", venue: "Bartholomäustherme", room: "Sauna 90 °C", day: "Donnerstag", families: [] },
  { name: "Seeufer", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "17:00", intensity: "mittel", venue: "Bartholomäustherme", room: "Sauna 90 °C", day: "Donnerstag", families: [] },
  { name: "Blätterrauschen", kind: "NATURSUDE", time: "19:00", intensity: "mittel", venue: "Bartholomäustherme", room: "Sauna 90 °C", day: "Donnerstag", families: [] },
  { name: "Abendglut", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "20:00", intensity: "stark", venue: "Bartholomäustherme", room: "Sauna 90 °C", day: "Donnerstag", families: [] },
  { name: "Zeit der Entspannung", kind: "MEDITATIVER SOUNDMIX", time: "21:00", intensity: null, venue: "Bartholomäustherme", room: "Sauna 90 °C", day: "Donnerstag", families: [] },
  { name: "Erwachen", kind: "ÄTHERISCHE ÖLE", time: "12:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Sonnenschein", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "13:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Leichtigkeit", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "14:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Abtauchen", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "16:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Fr.–So.: Lichtblick", kind: "INHALATION", time: "17:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Lebensfreude", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "18:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Durchatmen", kind: "ÄTHERISCHE ÖLE", time: "19:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Sommerparty", kind: "EVENTAUFGUSS", time: "20:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Reflexion", kind: "ÄTHERISCHE ÖLE", time: "21:00", intensity: "mittel", venue: "Billebad", room: "Mediensauna 80 °C", day: "Donnerstag", families: [] },
  { name: "Guten Morgen, Blankenese!", kind: "ÄTHERISCHE ÖLE", time: "12:00", intensity: "mittel", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Klangduft", kind: "KLANGAUFGUSS", time: "13:00", intensity: "sanft", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Waldspaziergang", kind: "HOLZAROMEN", time: "15:00", intensity: "mittel", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: ["Woody", "Conifers"] },
  { name: "Obstmarkt", kind: "FRUCHTAROMEN", time: "16:00", intensity: "mittel", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: ["Citrus"] },
  { name: "Frische Brise", kind: "MINZAROMEN", time: "17:00", intensity: "sanft", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: ["Fresh"] },
  { name: "Waldlauf", kind: "ÄTHERISCHE ÖLE", time: "18:00", intensity: "mittel", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Kräutergarten", kind: "KRÄUTERAROMEN", time: "19:00", intensity: "mittel", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: ["Herbal"] },
  { name: "Duftreise", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "20:00", intensity: "mittel", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Sommerabend", kind: "FRUCHT- ODER KRÄUTERAROMEN", time: "21:00", intensity: "mittel", venue: "Blankenese", room: "Vulcano-Sauna 95 °C", day: "Donnerstag", families: ["Citrus", "Herbal"] },
  { name: "Bara-Sinfonie", kind: "ÄTHERISCHE ÖLE", time: "11:00", intensity: "sanft", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Suikomo", kind: "INHALATION", time: "12:00", intensity: "sanft", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Yuzu", kind: "ÄTHERISCHE ÖLE", time: "13:00", intensity: "mittel", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Yukari", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "14:00", intensity: "mittel", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Shiso", kind: "INTENSIV HEISSER AUFGUSS", time: "16:00", intensity: "stark", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Mikan", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "18:00", intensity: "mittel", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Yin und Yang", kind: "ÄTHERISCHE ÖLE", time: "19:00", intensity: "mittel", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Samurai", kind: "INTENSIV HEISSER AUFGUSS", time: "20:00", intensity: "stark", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Hana", kind: "ÄTHERISCHE ÖLE", time: "21:00", intensity: "sanft", venue: "Bondenwald", room: "Senpu 95 °C / Syasin 85 °C", day: "Donnerstag", families: [] },
  { name: "Citrus Mint Fizz", kind: "ÄTHERISCHE ÖLE", time: "11:00", intensity: "sanft", venue: "Festland", room: "Sauna 95 °C", day: "Montag", families: [] },
  { name: "Basil Fresh", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "14:00", intensity: "mittel", venue: "Festland", room: "Sauna 95 °C", day: "Montag", families: [] },
  { name: "Frosty Mint", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "15:00", intensity: "mittel", venue: "Festland", room: "Sauna 95 °C", day: "Montag", families: [] },
  { name: "Herbalist", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "16:00", intensity: "mittel", venue: "Festland", room: "Sauna 95 °C", day: "Montag", families: [] },
  { name: "Green Breeze", kind: "INTENSIV HEISSER AUFGUSS", time: "17:00", intensity: "stark", venue: "Festland", room: "Sauna 95 °C", day: "Montag", families: [] },
  { name: "Virgin Mojito", kind: "ÄTHERISCHE ÖLE", time: "19:00", intensity: "mittel", venue: "Festland", room: "Sauna 95 °C", day: "Montag", families: [] },
  { name: "Summer Heat", kind: "INTENSIV HEISSER AUFGUSS", time: "20:00", intensity: "stark", venue: "Festland", room: "Sauna 95 °C", day: "Montag", families: [] },
  { name: "Lavender Fields", kind: "ÄTHERISCHE ÖLE", time: "20:30", intensity: "sanft", venue: "Festland", room: "Sauna 95 °C", day: "Montag", families: [] },
  { name: "¡Buenos días!", kind: "VARIIERENDE AROMEN", time: "11:00", intensity: "sanft", venue: "Parkbad", room: "Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Mięta", kind: "DUFTREISE MIT ÄTHERISCHEN ÖLEN", time: "13:00", intensity: "mittel", venue: "Parkbad", room: "Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Berk", kind: "NATURSUD BIRKE", time: "15:00", intensity: "stark", venue: "Parkbad", room: "Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Frukt", kind: "ÄTHERISCHE ÖLE", time: "16:00", intensity: "mittel", venue: "Parkbad", room: "Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Esfoliazione", kind: "AUFGUSS-PEELING-KOMBINATION", time: "19:00", intensity: "mittel", venue: "Parkbad", room: "Sauna 95 °C", day: "Donnerstag", families: [] },
  { name: "Farvel", kind: "VARIIERENDE AROMEN", time: "21:00", intensity: "sanft", venue: "Parkbad", room: "Sauna 95 °C", day: "Donnerstag", families: [] },
];

export const INTENSITIES = [
  { id: 'sanft',  de: 'Sanfter Aufguss',   short: 'sanft'  },
  { id: 'mittel', de: 'Mittlerer Aufguss', short: 'mittel' },
  { id: 'stark',  de: 'Starker Aufguss',   short: 'stark'  },
];
