# The Aromen oil catalogue

**Source:** <https://www.aromen.be/de/shop/category/atherische-ole-einzelole-26>
**Fetched:** 8 September 2026
**Result:** `src/data/oils.js` — 133 oils

This is one of the two ranges the app carries. The other is RBM's, in
[`oils-rbm.md`](oils-rbm.md) and `src/data/oils-rbm.js`; the app shows both as
one list and puts the supplier on the oil.

## What was fetched

The brief named <https://www.aromen.be/de/shop/category/atherische-ole-1> —
"Ätherische Öle". That category is the whole aroma range: single oils, blends,
Personality blends, and a couple of carrying cases. The single oils live in one
subcategory of it:

```
/de/shop/category/atherische-ole-einzelole-26
```

19 pages at 20 products each; `?ppg=` is capped at 20, so all 19 were fetched.
Each oil is sold in 11 ml, 50 ml and 100 ml, which is why 139 product URLs
reduce to 133 oils: one per base article, the 11 ml page taken as canonical.
The English page of each product was fetched as well (`/en/` in place of
`/de/`), which is where the English names come from.

## What each product page carries

Two structured attributes and a description. From the sandalwood page
(<https://www.aromen.be/de/shop/atherische-ole-einzelole-26/w8-bio-sandelholz-11ml-bio-4698>):

```
Duftgruppe : Holzig
Gut Für    : Relaxing & Balancing, Meditative & Mystical

Sandelholzöl hat einen tiefen, cremigen Holzduft mit einer samtigen Fülle, die
die Seele beruhigt. Diese luxuriöse Basisnote schafft eine ruhige, meditative
Atmosphäre …
```

Three things come out of that, and all three are Aromen's own words:

- **the scent family** (`Duftgruppe` / `Scent Group`)
- **the effect tags** (`Gut Für` / `Good For`)
- **the note** — because the description names it. "Diese luxuriöse Basisnote."

## The families

Ten of them, exactly as Aromen publishes them. The German column of their own
site leaves four untranslated; the German in the app is a translation of the
English label and nothing more.

| Aromen (EN) | Aromen (DE) | in the app | oils |
|---|---|---|---|
| Citrus | Zitrus | Zitrus | 29 |
| Floral | Blumig | Blumig | 19 |
| Spicy | Scharf | Würzig | 16 |
| Herbal | Krautig | Kräuter | 15 |
| Conifers | *(not translated)* | Nadelholz | 14 |
| Woody | Holzig | Holzig | 13 |
| Fresh | *(not translated)* | Frisch | 12 |
| Resinous | Harzig | Harzig | 8 |
| Gourmand | *(not translated)* | Gourmand | 4 |
| Earthy | *(not translated)* | Erdig | 3 |

Their article codes agree with the families — `W8` sandalwood is woody, `C3`
lemon is citrus, `M6` peppermint is a mint — so the code is kept in the data as
a second handle on the same fact, and is searchable in the app.

## The effect tags

Seven, and they are the same seven in both languages on their site; the German
column of their shop machine-translates them oddly ("Fluglinien" for "Airways"),
so the app carries a hand translation instead.

| Aromen | in the app | oils |
|---|---|---|
| Relaxing & Balancing | Entspannend & ausgleichend | 70 |
| Uplifting & Joyful | Aufhellend & heiter | 57 |
| Purifying & Detoxifying | Klärend & reinigend | 54 |
| Energizing & Vitalizing | Belebend & vitalisierend | 53 |
| Airways & Breathing | Atemwege & Atmung | 53 |
| Meditative & Mystical | Meditativ & mystisch | 34 |
| Immunity | Immunsystem | 5 |

## The notes — and the eight that are estimated

125 of the 133 descriptions state the note themselves, in one of these shapes:

```
This luxurious base note …          →  base
This distinctive top note …         →  top
This ethereal top-to-heart note …   →  top + heart
```

**Eight do not**, because their description is either empty on the site or
written in an older style that does not mention a note:

Cédrat · Daidai · Menthol-Kristalle · Muskatnuss · Japanese 'Sansho' Pepper ·
Jasmin mix · Wacholdernadel · Hinoki, leaves

For those the family decides the note, following the note/family association at
<https://www.maitreya-natura.com/de/aetherische-oele-duftnoten.html> (citrus and
herbs are top notes, florals are heart notes, woods and resins are base notes).
They carry `noteEstimated: true` and **the app marks them** — the oil sheet says
"aus der Duftgruppe geschätzt" rather than pretending Aromen said it.

## What is not from Aromen

- **The botanical names.** Aromen does not publish them. See
  [`botanical-names.md`](botanical-names.md).
- **The German family and tag labels**, as above.
- **Everything about blending.** See [`blending.md`](blending.md).

## Re-checking

`node tools/check-sources.mjs` re-fetches the category listing and reports oils
that have appeared or gone since this file was written.
