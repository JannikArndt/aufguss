# Notes, ratios, order, and which families go together

**Result:** `src/data/blending.js`
**Fetched:** 8 September 2026

Everything the app suggests about *combining* oils comes from four pages. None
of them is a standard; three are aromatherapy retailers and one is a sauna shop.
They agree about the shape of the thing — three notes, heaviest first, citrus
goes with everything — and disagree about the numbers, which is why the app
offers four ratios instead of one and calls them suggestions.

## 1. The order to mix in

**<https://www.aroma1x1.com/aetherische-oele-mischen/>**

> Beginne beim Mischen mit den Düften der **Basisnote**. Sie duften oft am
> intensivsten, und hier solltest du eher sparsam dosieren.
> Füge dann Düfte der **Herznote** bei.
> Füge schließlich Düfte der **Kopfnote** hinzu.

Base → heart → top. That is the order the app prints on a set, and the only
reason it prints an order at all.

The same page gives the **30-50-20 rule**: 30 % top, 50 % heart, 20 % base, with
the worked example "20 Tropfen Gesamtmischung / 30 % Kopfnote = 6 Tropfen /
50 % Herznote = 10 Tropfen / 20 % Basisnote = 4 Tropfen".

It also says citrus oils "mischen sich zum Beispiel mit fast allen Ölen gut",
that citrus with needle oils gives a fresh, uplifting blend, that citrus with
geranium, rose or ylang ylang is harmonising, and that a floral over a heavy
wood — rose with sandalwood — is the calming pairing.

## 2. The ratios, and the family table

**<https://www.floria-natural.com/blogs/wissen/atherische-ole-mischen>**

Note lifetimes in a blend: top "leicht, frisch und erheiternd", about 20 minutes;
heart, the core, about 4 hours; base "erdig, schwer, harzig, warm oder süß",
about 8 hours. Those are the three `lasts` strings in `blending.js`.

Three ratios, written top : heart : base —

| | | |
|---|---|---|
| **3-5-2** | 3 top, 5 heart, 2 base | harmonising and sensual |
| **5-2-3** | 5 top, 2 heart, 3 base | when the base should carry |
| **3-2-1** | 3 top, 2 heart, 1 base | light and cheerful |

and the reason: top notes are dosed "großzügiger" because they go first, base
notes "etwas sparsamer" because they are more intense.

The family table, which is the whole of `HARMONY` in `blending.js`:

| family | goes with |
|---|---|
| citrus | spice, herbal, woody |
| floral | citrus, herbal, spice |
| herbal | floral, citrus |
| woody | spice, citrus |

Widened by the aroma1x1 sentences above — citrus also with conifers and florals,
woody also with florals and resins. **Gourmand and Earthy are in neither table**
and are left out of `HARMONY` rather than guessed at: an oil in those two
families scores nothing on family, and its note still counts.

## 3. Dosage at the ladle, and four combinations

**<https://saunawelt-oso.de/2025/03/05/mischen-von-saunaaufguessen/>**

> Pro Liter Wasser reichen 3 bis 5 Tropfen ätherisches Öl.

with the warning that more irritates airways and gives headaches, and the
practical bit the app repeats: **oil into the ladle first, water on top of it**,
so it spreads over the stones instead of sitting in one place. It says to use
100 % naturreine oils and never to put them undiluted on hot stones.

Its four named combinations are `CLASSICS` in `blending.js`, kept as a starting
point and labelled as someone else's:

- Sommerfrische — 2 Minze, 2 Zitrone, 1 Eukalyptus
- Abendruhe — 3 Lavendel, 2 Bergamotte
- Waldgang — 3 Fichtennadel, 2 Zeder
- Fruchtlaune — 3 Orange, 2 Grapefruit

This page does **not** use the note system at all. Worth knowing: the layering
theory and the practice of the ladle are two different conversations.

## 4. Which note a family belongs to

**<https://www.maitreya-natura.com/de/aetherische-oele-duftnoten.html>**

Top: citrus oils — bergamot, mandarin, lemon — and herbs like peppermint,
eucalyptus, rosemary. Heart: florals and aromatics — lavender, rose, jasmine,
ylang-ylang, neroli. Base: woods and resins — cedar, frankincense, sandalwood,
patchouli, myrrh. The page dates the three-note idea to an 18th-century French
perfumer.

This is used for exactly one thing: the eight oils whose Aromen description does
not name a note (see [`oils.md`](oils.md)). Those are marked `noteEstimated` and
the app says so on the oil.

## What the app does with all this

`src/core/suggest.js` scores a candidate oil against a set you have already
started, out of three things, and shows *which* of the three it scored on:

1. **the note gap** — the ratio you picked says how many top, heart and base a
   set of this size wants; an oil that fills a missing note scores highest;
2. **family harmony** — the table above, in both directions;
3. **your own history** — how often you have poured that oil with these ones
   before, which is the only part of this that is about you and, after a few
   dozen Aufgüsse, the part worth trusting most.

The weights are in that file and are a judgement, not a source. **None of this
overrides you**: the suggestions sit next to the search field and every one of
them is a shortcut to the same list you can scroll yourself.

## The honest caveat

Two of these four pages sell essential oils and one sells sauna supplies. They
are the level of source that exists for this: perfumery's note system is
convention, blending ratios are rules of thumb that vary by who is writing them,
and which scents "go together" is taste. The app is a journal first — **what you
actually poured, and what you thought of it, is better evidence than any of the
above**, and it is the only thing here that gets better the more you use it.
