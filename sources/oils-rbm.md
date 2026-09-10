# The RBM oil catalogue

**Sources:**
<https://www.rbm-wellness.de/Naturreine-atherische-Ole-c134687002> and the
price list *Preisliste ab 01.08.2026* (PDF, handed over by the owner as
`2026_08_01PLRBMKd001.08.2026.pdf`)
**Fetched:** 10 September 2026
**Result:** `src/data/oils-rbm.js` — 81 oils

RBM Natur Sauna & Wellness is the second range this sauna buys from. Their oils
sit next to Aromen's in one list; which one an oil is from is on the oil, and
nothing in the app treats one range differently from the other. Both ranges
sell a Zitrone, a Zirbelkiefer, an Amyris. That is two bottles, not a duplicate.

## What was fetched, and why it took two things

**The price list** is the definitive list of what is actually orderable, with
the article numbers. It has six categories; five of them are single oils —
Hölzer 19, Kräuter 25, Zitrus 16, Gewürze 11, Blumen 10, **81 in total** — and
the sixth, *Mix*, is 23 blends. Then a page of hardware: Fächer, Wedeltücher,
Sauna-Aroma-Kugeln, Schulungen.

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
the one in `url`. The article-number range in `code` (e.g. `04 - 07`) covers
all four sizes and is copied off the price list verbatim, hyphens, slashes and
all.

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

## The notes

RBM names the note on 80 of the 81 pages, in the same shapes Aromen uses:

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

## Names: the price list and the shop disagree in nine places

The shop's name is what is in `de`, because it is the name on the page `url`
points at. Where the price list writes it differently, that is here:

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

## What is *not* in the data

- **The 23 Mischungen** — 1001 Nacht, Advent Mix, Big Cinnamon, Blue Ice,
  Erkältung Mix, Frische Brise, Frischer Wald Mix, Gewürzzauber Mix, Harmony,
  Heublume Mix, Jasmin Mix, Kola-Nuss-Orange, Lotus Mix, Nautilust "MED",
  Neroli Mix, Orange Sprizz, Orientalischer Traum, Rose Mix, Sommernachtstraum,
  Summermix, Veilchen Mix, Wintermärchen Mix, and a second listing of
  Kola-Nuss-Orange. Every entry in this catalogue is one species in one bottle;
  a blend under a single botanical name and a single note would be an invented
  fact of exactly the kind `sources/` exists to rule out. The same reasoning
  kept Purelia's Tigerminze out (see `open-questions.md`). Öle → **+** is the
  honest way to get a blend into a journal.
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
pages through the storefront endpoint, and reports single oils that have
appeared or gone — and, because the note and the botanical name are read out of
the description, any oil whose `Botanischer Name` line no longer says what
`src/data/oils-rbm.js` says.
