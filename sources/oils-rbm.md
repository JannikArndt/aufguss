# The RBM oil catalogue

**Sources:**
<https://www.rbm-wellness.de/Naturreine-atherische-Ole-c134687002> and the
price list *Preisliste ab 01.08.2026* (PDF, handed over by the owner as
`2026_08_01PLRBMKd001.08.2026.pdf`)
**Fetched:** 10 September 2026
**Result:** `src/data/oils-rbm.js` — 104 entries: 81 single oils and 23 Mischungen

Every count in this file is what **the shop** publishes. The data file now holds
105, because a second Thymian turned up that the shop has no page for and only a
safety data sheet describes — that one is [`oils-rbm-sdb.md`](oils-rbm-sdb.md)'s,
not this file's, and it carries `sdbOnly: true` so the two can never be confused.

RBM Natur Sauna & Wellness is the second range this sauna buys from. Their oils
sit next to Aromen's in one list; which one an oil is from is on the oil, and
nothing in the app treats one range differently from the other. Both ranges
sell a Zitrone, a Zirbelkiefer, an Amyris. That is two bottles, not a duplicate.

## What was fetched, and why it took two things

**The price list** is the definitive list of what is actually orderable, with
the article numbers. It has six categories; five of them are single oils —
Hölzer 19, Kräuter 25, Zitrus 16, Gewürze 11, Blumen 10, **81 in total** — and
the sixth, *Mix*, is **23 fertige Mischungen**. All 104 are in the app. Then a
page of hardware: Fächer, Wedeltücher, Sauna-Aroma-Kugeln, Schulungen, which is
not.

It carries no botanical name, no note, no description. Those are on the shop.

**The shop** is an Ecwid storefront rendered entirely in JavaScript. Fetching
a product URL returns the site builder's 404 shell — the product is not in the
HTML at all — so the usual "fetch the page, read the description" does not work
here. Two things do:

- `https://www.rbm-wellness.de/sitemap.xml` is plain XML and lists every
  product page, 432 of them. The number after the final `-p` is the product id.
- The storefront's own product endpoint takes those ids and answers with the
  description each page renders:

```
POST https://eu-fra4-storefront-api.ecwid.com/storefront/api/v1/75784548/catalog/products
Content-Type: application/json

{ "lang": "de", "productIds": [472071540, 472086438, …] }
```

25 ids at a time. The store id `75784548` is in the storefront loader the site
includes (`https://app.multiscreenstore.com/script.js?75784548`); the endpoint
path is in its bundle. `tools/check-sources.mjs` does exactly this, so the
method stays runnable rather than just described.

432 product pages reduce to 128 products: **each oil is sold in 20, 100, 250
and 1000 ml, and each size is its own product page with its own id.** The
20 ml page is taken as canonical, the way the 11 ml page is for Aromen — it is
the one in `url`. Two Mischungen have no 20 ml page (Frische Brise starts at
100 ml, Orange Sprizz at 250 ml) and use the smallest there is. The
article-number range in `code` (e.g. `04 - 07`) covers all four sizes and is
copied off the price list verbatim, hyphens, slashes and all.

Of those 128 products, 103 are in the app: 81 single oils and 22 Mischungen.
The rest are the Sortimentskoffer, the Fächer, the Wedeltücher, the
Sauna-Aroma-Kugeln and the Schulungen.

## What a product page carries

All of it in one description field, as their own labelled lines. From
Birkenteer (<https://www.rbm-wellness.de/Birkenteer-p798732701>):

```
Botanischer Name: Betula verrucosa
Pflanzenfamilie: Betulaceae
Duftnote: Basisnote
Charakter: würzig, kräftig, rauchig, Teer, Leder
Herstellung: Aus Rinde und Zweigen hergestellt. Die Gewinnung erfolgt durch
             eine Trockendestillation
Harmonie: Cypresse, Minze, würzigen Düften
Der "Urduft" der Sauna!
```

Six labelled fields and sometimes a closing line, and every one of them is
RBM's own words:

| their line | in the data |
|---|---|
| Botanischer Name | `latin` |
| Pflanzenfamilie | `plantFamily` |
| Duftnote | `notes` |
| Charakter | `character`, and the first sentence of `about` |
| Herstellung | the rest of `about` |
| Harmonie | `goesWith` |

A Mischung's page carries none of these — see below.

`good` and `goodDe` are empty for every RBM oil: they publish no effect tags,
and inventing some from the Charakter words would be exactly the guess this
folder exists to prevent. `en` is empty for the same reason — RBM publishes in
German only.

`goesWith` is shown on the oil and deliberately kept **out of the search
index**. It is a list of other oils' names, so indexing it would put all twelve
oils whose Harmonie line mentions Zitrone into the results for `zitrone`.

## The families

RBM sorts its oils into five groups and the app keeps them, `familyDe`
verbatim. `family` is the English label the app already uses for the same
group, so that one oil's family always means the same thing as another's:

| RBM (their word) | in the app | oils |
|---|---|---|
| Kräuter | Herbal | 25 |
| Hölzer | Woody | 19 |
| Citrus | Citrus | 16 |
| Gewürze | Spicy | 11 |
| Blumen | Floral | 10 |

That mapping is a translation and nothing more. It does have one consequence
worth being awake to: **RBM has no separate group for conifers.** Fichtennadel,
Kiefernnadel, Zirbelkiefer and Latschenkiefer are *Hölzer* to them, so they are
Woody here, while the same trees in Aromen's range are Conifers. Both are their
own supplier's classification, verbatim. See `open-questions.md`.

## The notes of the single oils

RBM names the note on 80 of the 81 single-oil pages, in the same shapes Aromen
uses. Their Mischungen have no note at all — see below.

```
Duftnote: Basisnote           →  base          16 oils
Duftnote: Herznote            →  heart         30 oils
Duftnote: Kopfnote            →  top           19 oils
Duftnote: Kopf-, Herznote     →  top + heart   12 oils
Duftnote: Kopf- , Basisnote   →  top + base     2 oils
Duftnote: Herz-, Basisnote    →  heart + base   2 oils
```

Spacing and capitalisation vary on their pages (`Kopf- , Herznote`,
`Kopf-,Herznote`, `Kopf-, herznote`); the reading does not.

**One does not:** **Bergamottminze**. Its page carries no `Duftnote:` line and
no `Botanischer Name:` line either — the whole description is *"Mentha-Citrataöl
/ Charakter: frisch, spritzig, minzig, süßlich / Harmonie: …"*. Its note is
estimated from the family the same way Aromen's eight are, following
<https://www.maitreya-natura.com/de/aetherische-oele-duftnoten.html> (citrus is
a top note), it carries `noteEstimated: true`, and the app says so on the oil.
Its `latin` is left **empty** rather than read out of "Mentha-Citrataöl", which
would be a guess dressed as a reading. See `open-questions.md`.

## Names: the price list and the shop disagree in 22 places

The shop's name is what is in `de`, because it is the name on the page `url`
points at. Where the price list writes it differently, that is here — nine
single oils, and thirteen Mischungen where it is mostly `MIX` against `Mix`:

| price list | product page |
|---|---|
| Amyris (Westindisches Sandelholz) | Amyris |
| Bergamotteminze | Bergamottminze |
| Citronella java | Citronella Java |
| Cedernholz himalaya | Cedernholz Himalaya |
| Eukalyptus citriodora | Eukalyptus citrodora |
| Heiliger Basilikum (Tulsi) | Heiliger Basilikum |
| Latschenkiefer tirol | Latschenkiefer Tirol |
| Lavendel Bulgarisch | Lavendel bulgarisch |
| Lemonmyrte | Lemonmyrthe |
| Advent MIX | Advent Mix |
| Erkältung | Erkältung Mix |
| Frischer Wald | Frischer Wald Mix |
| Gewürzzauber MIX | Gewürzzauber Mix |
| Heublume MIX | Heublume Mix |
| Jasmin MIX | Jasmin Mix |
| Kola-nuss-Orange | Kola-Nuss-Orange |
| Lotus MIX | Lotus Mix |
| Neroli MIX | Neroli Mix |
| rbm Nautilust Med | Nautilust "MED" |
| Rose MIX | Rose Mix |
| Veilchen MIX | Veilchen Mix |
| Wintermärchen MIX | Wintermärchen Mix |

Ringelblume has no product page, so its `de` is the price-list name.

## The 23 Mischungen

RBM blends their own, and the price list has 23 of them. Their product pages
carry **none** of the six labelled fields the single oils carry. The whole
description is two lines:

```
Eine Hauseigene, 100% naturreine ätherische Ölmischung
Zusammensetzung: Blutorange, Ylang Ylang, Zitrone, Elemi, Geranium, Limette, uvm.
```

So a Mischung in the data carries `blend: true`, its `code`, its `url`, that
description in `about`, the composition line in `parts` — and **no note, no
botanical name, no Pflanzenfamilie, no Charakter, no Harmonie and no scent
family**. `familyDe` is their own category word, *Mischungen*, and `family` is
`Blend`, which is deliberately not in the `HARMONY` table, the same way
Gourmand and Earthy are not: an absent family scores nothing, which is the
honest answer.

Deriving a Duftnote from a composition line is the one thing that must not
happen here. Five of the 22 published lines end in "uvm.", so they do not even
say what is in the bottle, let alone in what proportion; and a note is about
which ingredient the room smells first, which no ingredient list answers.
`tools/smoke.mjs` pins that no Mischung carries a note, an estimated note, a
botanical name or a Charakter, so nobody can fill one in later without the
test asking why.

The app is built for a note-less oil and did not need bending: it is poured
last, counted as *ohne Note* next to the balance bar, scores nothing in the
harmony table, and only ever appears in a suggestion because your own journal
put it next to something.

`parts` is **one string, not a list**, and unparsed. Splitting it would be
inventing a structure their page does not have: half the lines are a list with
"uvm." on the end, and the rest are a sentence —

```
Blue Ice     Gletschereis plus grüne Zitrone mit Mandarine
Harmony      Blutorange und Minze, mit frischen grünen Blätter des Winters
Summermix    Mint, Berry und Lime
```

Like `goesWith`, `parts` names other oils, so it is not in the search index
either. It is in `about`, which is scored last and weakest, so typing
`patchouli` gives you the Patchouli bottles first and then the two Mischungen
that contain some.

Two of the 23 are not a clean row on both sides:

- **Kola-Nuss-Orange** is listed twice in their shop. *Kolanuss-Orange* carries
  only the 1000 ml page, *Kola-Nuss-Orange* the other three, both with the same
  Zusammensetzung, and the price list has one row for them. They are one entry
  here, and `tools/check-sources.mjs` names the second listing so it is not
  reported as new every run.
- **Ringelblume** (article 352 - 355) is on the price list and **has no product
  page at all** — nothing in the sitemap, nothing in the shop, though two oils'
  Harmonie lines name "Ringelblume MIX". It is in the data with its name, its
  article number and `url: null`, and nothing else, because nothing else was
  published. It is the only RBM entry whose id is not a product slug. See
  `open-questions.md`.

## What is *not* in the data

- **The hardware and the Schulungen.** Not oils.
- **The prices.** They change, they are net, and this is a journal, not a
  shopping list.

## Botanical names

Unlike Aromen, RBM publishes botanical names, so these are **RBM's**, copied
verbatim — not looked up on Wikidata the way `botanical-names.md` describes for
the Aromen range. Their spelling is kept as written (`Albies alba`, `Uniperus
communis`, `Illicum verum`, `cinnamomum aromaticum nees`): normalising them
would be quietly replacing what the supplier says with what someone else
thinks. Ten names are shared by two or three of their products; that is listed
in `open-questions.md`, because it is the sort of thing that is either
deliberate or a copy-paste, and there is no way to tell from here.

## Re-checking

`node tools/check-sources.mjs` walks the sitemap, re-reads all 432 product
pages through the storefront endpoint, and reports oils and Mischungen that
have appeared or gone. Because everything the app says is read out of those
descriptions, it also reports any single oil whose `Botanischer Name` line, or
any Mischung whose `Zusammensetzung` line, no longer says what
`src/data/oils-rbm.js` says — and it says so if Ringelblume turns up in the
shop, which would let it stop being the one entry without a URL.
