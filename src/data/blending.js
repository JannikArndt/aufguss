/* What the app knows about putting three oils together.

   None of this is invented. Every rule below was read off a named page on
   8 September 2026 and the page is written down in sources/blending.md, with
   the sentence it came from. Where two sources disagree — and they do, about
   ratios — both are here, because that disagreement is the honest answer.

   And it is not a science. Aufguss is a craft with a lot of taste in it, so
   the app suggests and never insists: everything here is a hint next to a
   field you can overrule, never a rule that stops you saving. */

/* The three notes, and why the order matters at the ladle.

   aroma1x1.com: mix from the heaviest to the lightest — base first and
   sparingly, then heart, then top. That is the order the app prints, and the
   reason is the same one that makes a top note a top note: it is the first
   thing the room smells and the first thing gone. */
export const NOTES = [
  { id: 'top',   de: 'Kopfnote',  short: 'K',
    blurb: 'Zuerst da, zuerst weg. Zitrus, Minze, frische Kräuter.',
    lasts: 'etwa 20 Minuten in der Mischung', pourStep: 3 },
  { id: 'heart', de: 'Herznote',  short: 'H',
    blurb: 'Der Körper der Mischung. Blüten, Gewürze, Lavendel.',
    lasts: 'etwa 4 Stunden in der Mischung', pourStep: 2 },
  { id: 'base',  de: 'Basisnote', short: 'B',
    blurb: 'Trägt und bleibt. Hölzer, Harze, Erdiges.',
    lasts: 'etwa 8 Stunden in der Mischung', pourStep: 1 },
];

/* The order to combine them in, heaviest first (aroma1x1.com). */
export const MIX_ORDER = ['base', 'heart', 'top'];

/* Ratios. Four of them, because four different pages recommend four different
   things and none of them is wrong. Percentages are of the total drop count.
   `parts` reads top : heart : base, the way all four sources write it. */
export const RATIOS = [
  { id: '30-50-20', label: '30 · 50 · 20', parts: { top: 30, heart: 50, base: 20 },
    de: 'Ausgewogen, Herz betont', note: 'Die Faustregel bei aroma1x1: 30 % Kopf, 50 % Herz, 20 % Basis.' },
  { id: '3-5-2', label: '3 · 5 · 2', parts: { top: 3, heart: 5, base: 2 },
    de: 'Harmonisch, sinnlich', note: 'Bei 10 Tropfen dasselbe wie 30·50·20 — so schreibt es Floria.' },
  { id: '5-2-3', label: '5 · 2 · 3', parts: { top: 5, heart: 2, base: 3 },
    de: 'Basis betont', note: 'Floria, wenn die Basis tragen soll.' },
  { id: '3-2-1', label: '3 · 2 · 1', parts: { top: 3, heart: 2, base: 1 },
    de: 'Leicht, heiter', note: 'Floria, für eine leichte Mischung.' },
];

/* Which families sit well next to which. Floria publishes this as a table;
   aroma1x1 adds that citrus goes with nearly everything, and that floral over
   a heavy wood is the calming pairing. The keys are Aromen's own scent groups,
   so a family here always matches a family on an oil.

   Two of Aromen's groups are not in either table — Gourmand and Earthy — and
   are left out rather than guessed at. An oil in those families simply gets no
   family score; its note still counts. */
export const HARMONY = {
  Citrus:    ['Spicy', 'Herbal', 'Woody', 'Conifers', 'Floral', 'Fresh', 'Resinous'],
  Floral:    ['Citrus', 'Herbal', 'Spicy', 'Woody', 'Resinous'],
  Herbal:    ['Floral', 'Citrus', 'Fresh', 'Conifers'],
  Woody:     ['Spicy', 'Citrus', 'Floral', 'Resinous', 'Conifers'],
  Conifers:  ['Citrus', 'Herbal', 'Woody', 'Fresh'],
  Fresh:     ['Citrus', 'Herbal', 'Conifers'],
  Spicy:     ['Citrus', 'Floral', 'Woody', 'Resinous'],
  Resinous:  ['Citrus', 'Woody', 'Floral', 'Spicy'],
};

/* Dosage. Two numbers from two places, and they are answering different
   questions — drops into the ladle, versus millilitres of a made-up mixture.
   The app shows both and neither is a default: what goes on the stones is
   the Saunameister's call and the house's. */
export const DOSAGE = {
  dropsPerLitre: [3, 5],   // saunawelt-oso.de, per litre of Aufguss water
  mlPerOil: [1, 3],        // the range this journal is kept in
  hint: 'Öl zuerst in die Kelle, dann das Wasser darauf — dann verteilt es sich.',
};

/* Four combinations another sauna publishes, kept as a starting point rather
   than as advice. They are named for what they are, and the source is in
   sources/blending.md. Each is a list of family + note the app can match
   against the actual catalogue, plus the oils the source names. */
export const CLASSICS = [
  { de: 'Sommerfrische', oils: ['Minze', 'Zitrone', 'Eukalyptus'], drops: [2, 2, 1] },
  { de: 'Abendruhe',     oils: ['Lavendel', 'Bergamotte'],          drops: [3, 2] },
  { de: 'Waldgang',      oils: ['Fichtennadel', 'Zeder'],           drops: [3, 2] },
  { de: 'Fruchtlaune',   oils: ['Orange', 'Grapefruit'],            drops: [3, 2] },
];
