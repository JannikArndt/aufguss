# The Purelia oil catalogue

**Source:** <https://schrader24.eu/portfolio/aetherische-oele/>
**Fetched and verified:** 11 September 2026
**Brand, as the page prints it:** PURELIA professional (by WAPRO GmbH)
**Sizes:** 100 ml / 500 ml / 1 l
**Result:** `src/data/oils-purelia.js` — 47 entries: 40 single oils and 7
Ölmischungen

Purelia is the third range this sauna buys from, alongside Aromen and RBM.
Nothing here is scraped in the way Aromen or RBM's ranges are: there is one
portfolio page, it lists every article by name and nothing else, and there is
no per-product page to fetch a description from. So every field this app
would normally read off a supplier — scent group, note, botanical name,
description — is empty for all 47 entries. See "What is not published" below.

## The range, verbatim from the page

**100% Reine Öle** (40 articles):

```
Basilikumöl | Blutorangenöl | Bergamotteöl italienisch | Cassiaöl chinesisch |
Dillkrautöl | Edeltannenöl | Eukalyptusöl chinesisch | Fenchelöl |
Fichtennadelöl sibirisch | Grapeftruitöl Florida | Ho-Blätteröl |
Ingweröl chinesisch | Kampferöl hell | Kiefernnadelöl | Krauseminzöl |
Latschenkieferöl Tirol | Lavandinöl Abrialis | Lemongrasöl indisch |
Limettenöl | Litsea Cubea | Mandarinenöl grün italienisch |
Mandarinenöl orange italienisch | Mandarinenöl rot italienisch |
Melissenöl indicum | Nelkenöl | Orangenöl süß brasilianisch | Patchouliöl |
Pfefferöl schwarz indisch | Pfefferminzöl indisch | Rosenholzöl rekon. |
Rosmarinöl | Salbeiöl spanisch | Sternanisöl | Teebaumöl australisch |
Thymianöl | Vetiveröl Java | Zederholzöl Texas | Zirbelkieferöl |
Zitronenöl italienisch/spanisch | Zypressenöl
```

**100% Reine Ölmischung** (7 articles):

```
Orange-Citrus | Euka-Pfefferminze | Eukalyptus-Menthol | Tigerminzöl |
Minz-Citrus | Minz-Orange | Polarminze
```

Counted by hand: 40 single-oil page names (Mandarine already prints as three
separate lines — grün/orange/rot, all italienisch — so it is three records
sharing one `plant`; Zitrone prints as a single line, one article sold as
"italienisch/spanisch", so it is one record) plus 7 Mischungen. **47 records
in total, matching `OILS_PURELIA.length`.**

## How the range is re-cut

The instruction, carried over from `CLAUDE.md` §1 ("reading a name is not
inventing a fact"): drop the "-öl" ending, restore the letter that German
regularly elides when a noun ending in *e* takes that ending (Zitrone + öl →
Zitronenöl, so reading "Zitrone" back out invents nothing), fix the page's own
spelling slips, and split what is left into the plant name (`de`) and the
qualifier Purelia already printed after it (`variety`). Nothing in a `de` or
`variety` value is a word Purelia did not print somewhere in that line.

Every re-cut, one row per article:

| page name | `de` | `variety` | note |
|---|---|---|---|
| Basilikumöl | Basilikum | — | |
| Blutorangenöl | Blutorange | — | "Blutorange" is Purelia's own single word, not "Orange" with a colour — kept as its own plant, not folded into Orange |
| Bergamotteöl italienisch | Bergamotte | `{ origin: "italienisch" }` | |
| Cassiaöl chinesisch | Cassia | `{ origin: "chinesisch" }` | |
| Dillkrautöl | Dill | `{ part: "Kraut" }` | "Kraut" is the herb part they sell, same idea as Kiefernnadel's "Nadel" |
| Edeltannenöl | Edeltanne | — | "Edeltanne" (noble fir) is the species name itself, not "Tanne" with a qualifier |
| Eukalyptusöl chinesisch | Eukalyptus | `{ origin: "chinesisch" }` | |
| Fenchelöl | Fenchel | — | |
| Fichtennadelöl sibirisch | Fichte | `{ part: "Nadel", origin: "sibirisch" }` | |
| Grapeftruitöl Florida | Grapefruit | `{ origin: "Florida" }` | **typo fix** — the page prints "Grapeftruit", corrected to "Grapefruit" in `de`; the id keeps the page's own misspelling (`pur:grapeftruitoel-florida`) because the id names what was actually printed, not the correction |
| Ho-Blätteröl | Ho-Blätter | — | left as one compound, not split into "Ho" + part "Blätter" — "Ho" alone names nothing on its own, and the compound is what is being sold |
| Ingweröl chinesisch | Ingwer | `{ origin: "chinesisch" }` | |
| Kampferöl hell | Kampfer | `{ kind: "hell" }` | |
| Kiefernnadelöl | Kiefer | `{ part: "Nadel" }` | |
| Krauseminzöl | Krauseminze | — | its own plant, not stemmed into "Minze" |
| Latschenkieferöl Tirol | Latschenkiefer | `{ origin: "Tirol" }` | "Latschenkiefer" (mountain pine, *Pinus mugo*) is its own species, kept as one compound rather than "Kiefer" with a qualifier |
| Lavandinöl Abrialis | Lavandin | `{ kind: "Abrialis" }` | |
| Lemongrasöl indisch | Lemongras | `{ origin: "indisch" }` | |
| Limettenöl | Limette | — | |
| Litsea Cubea | Litsea Cubea | — | kept exactly as Purelia spells it — see "Litsea Cubea" below |
| Mandarinenöl grün italienisch | Mandarine | `{ colour: "grün", origin: "italienisch" }` | |
| Mandarinenöl orange italienisch | Mandarine | `{ colour: "orange", origin: "italienisch" }` | |
| Mandarinenöl rot italienisch | Mandarine | `{ colour: "rot", origin: "italienisch" }` | |
| Melissenöl indicum | Melisse | `{ kind: "indicum" }` | |
| Nelkenöl | Nelke | — | |
| Orangenöl süß brasilianisch | Orange | `{ origin: "brasilianisch", kind: "süß" }` | "süß" is a grade of orange (as against a bitter orange), so `kind` rather than `colour` |
| Patchouliöl | Patchouli | — | |
| Pfefferöl schwarz indisch | Pfeffer | `{ colour: "schwarz", origin: "indisch" }` | judgement call — "schwarz" reads equally well as a `kind` of pepper, but `colour` is used so this bottle merges with Aromen's "Pfeffer schwarz" and RBM's "schwarzer Pfeffer" under the same key |
| Pfefferminzöl indisch | Pfefferminze | `{ origin: "indisch" }` | its own plant, not stemmed into "Minze" |
| Rosenholzöl rekon. | Rosenholz | `{ method: "rekon." }` | |
| Rosmarinöl | Rosmarin | — | |
| Salbeiöl spanisch | Salbei | `{ origin: "spanisch" }` | |
| Sternanisöl | Sternanis | — | |
| Teebaumöl australisch | Teebaum | `{ origin: "australisch" }` | |
| Thymianöl | Thymian | — | |
| Vetiveröl Java | Vetiver | `{ origin: "Java" }` | |
| Zederholzöl Texas | Zederholz | `{ origin: "Texas" }` | |
| Zirbelkieferöl | Zirbelkiefer | — | "Zirbelkiefer" (Swiss stone pine, *Pinus cembra*) is its own species, kept as one compound |
| Zitronenöl italienisch/spanisch | Zitrone | `{ origin: ["italienisch", "spanisch"] }` | **see "Zitrone" below** — one article, both origins kept as a list |
| Zypressenöl | Zypresse | — | |

The 7 Ölmischungen, `de` with the "-öl" ending dropped where the page has one,
otherwise printed as-is:

| page name | `de` |
|---|---|
| Orange-Citrus | Orange-Citrus |
| Euka-Pfefferminze | Euka-Pfefferminze |
| Eukalyptus-Menthol | Eukalyptus-Menthol |
| Tigerminzöl | Tigerminze |
| Minz-Citrus | Minz-Citrus |
| Minz-Orange | Minz-Orange |
| Polarminze | Polarminze |

Each Mischung carries `blend: true`, `family: "Blend"`,
`familyDe: "Mischungen"`, `notes: []`, no `latin`, no `plant`, no `variety`,
and `parts: ""` — Purelia prints no Zusammensetzung line for any of its seven
blends, so nothing is derived from the name the way `parts` is read off RBM's
pages. Guessing a composition from "Euka-Pfefferminze" or "Tigerminzöl" would
be exactly the invented fact this repository exists to avoid.

## Spelling slips corrected

The page has exactly one misspelling worth recording:

- **"Grapeftruitöl"** is a typo for **Grapefruit**. `de` carries the corrected
  spelling; the id keeps the page's own spelling verbatim
  (`pur:grapeftruitoel-florida`), because an id names what was actually
  printed, not the correction made on top of it.

Nothing else on the page reads as a typo — the rest is deliberate supplier
spelling and is kept exactly as printed.

## Litsea Cubea

The page prints **"Litsea Cubea"**. The species most references call *Litsea
cubeba* — Purelia's own spelling drops the final "b". This is not corrected:
`de` is "Litsea Cubea", capitalisation and spelling exactly as the page has
it, the same way Aromen and RBM's own spellings are kept elsewhere in this
app (CLAUDE.md §9). No `latin` is recorded for it or for any other Purelia
oil, so the discrepancy never surfaces as a fact the app asserts — it is
written down here, once, so a reader who notices it does not wonder whether it
was missed.

## Zitrone: one article, two origins printed together

The page's single line for this article is **"Zitronenöl italienisch/spanisch"**
— one article, sold from either origin, with no way to tell from the page
which bottle a given order actually contains. A `variety.origin` of
"italienisch/spanisch" would not merge with any other supplier's Zitrone
bottle, because a slash is not a value anyone else's `origin` field uses and
not something a variety chip could ever render as one tap.

The resolution taken here: **one record**, and `variety.origin` holding **both**
words as a list — `{ origin: ["italienisch", "spanisch"] }`. A variety value
may be a list precisely for this: one article that answers to two words. The
record stays one record, because the page sells one article and a second one
would be a SKU Purelia does not have; both origins stay readable and both
become their own chip, because dropping "spanisch" would have thrown away half
of what the page actually prints. The slash is the only thing that is gone,
and a slash is punctuation, not an origin.

**What would settle it:** Purelia saying which origin a given bottle actually
ships from, or splitting the article on their own site the way they did for
Mandarine.

## What Purelia publishes nothing about, for this line

Four things, for every one of the 47 entries:

- **Scent group** — no Duftgruppe, no category, anywhere on the page.
- **Note** — no Kopf-/Herz-/Basisnote, stated or implied.
- **Botanical name** — no *Botanischer Name*, no Latin anywhere.
- **Description** — no text about how any oil smells, what it goes with, or
  what it is good for.

So `family: ""`, `familyDe: ""`, `notes: []`, `noteEstimated: false`,
`latin: ""`, `en: ""`, `good: []`, `goodDe: []`, `about: ""`, `code: ""` for
every single Purelia record, single oils and Mischungen alike. Nothing is
estimated to fill any of them — that is what `noteEstimated: false` on every
row (rather than the `true` this app uses for the small number of guessed
Aromen and RBM notes) is there to say: this is not a guess, it is an absence.

## Re-checking

There is no endpoint to script against here the way `tools/check-sources.mjs`
does for Aromen and RBM — one static page, no API, no per-product URLs. Redo
this by hand: open the URL above, read the two lists, and compare them against
the table above line by line.
