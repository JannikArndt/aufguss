# The Latin names

**Sources:** the English Wikipedia API and Wikidata
**Fetched:** 8 September 2026
**Result:** the `latin` field of every oil in `src/data/oils.js` — 133 of 133 filled

## Why they are not from Aromen

Aromen's product pages carry a name, a scent group, effect tags, a description
and a price. They do **not** carry a botanical name. Since the brief asks to be
able to search in Latin, the names had to come from somewhere else, and that
somewhere is not the supplier — so a Latin name in this app says "this is the
plant that oil is normally made from", not "this is the plant Aromen distilled".

## How

For each oil, the English product name was reduced to a plant term (dropping
`CO2-extract`, `cold pressed`, `absolute`, chemotypes, `III`, and anything in
brackets), looked up on English Wikipedia, followed through redirects, and the
article's Wikidata item read for **P225, "taxon name"**. Nothing was accepted
that did not have a P225.

- **75 resolved straight**: `Peppermint` → *Mentha ×piperita*,
  `Norway spruce` → *Picea abies*, `Eucalyptus dives` → *Eucalyptus dives*.
- **32 landed on a page that is not a taxon** — `Cinnamon`, `Sage`, `Lime`,
  `Mandarin` and the like are about a spice or a fruit, not a species. For those
  the species used for the oil was named explicitly and then verified to have a
  P225 of its own. These are the judgement calls and they are listed below.
- **7 landed on a genus** where a species was wanted (`Geranium` → the genus
  *Geranium*, when geranium oil is a *Pelargonium*).
- **6 had no English article** at all and were found by Wikidata search.

## The 32 judgement calls

Read this as "the species the oil trade means by that name", checked against
Wikipedia but chosen here:

| oil | species | why |
|---|---|---|
| Sandalwood | *Santalum austrocaledonicum* | **Aromen's own description says New Caledonia**, which is that species and not Indian *S. album* |
| Curcuma CO2 | *Curcuma longa* | their description says "derived from turmeric" |
| Bergamot | *Citrus ×bergamia* | |
| Sweet orange, Blood orange | *Citrus ×sinensis* | the same species; the app shows both oils separately, as Aromen sells them |
| Lime | *Citrus ×aurantiifolia* | |
| Mandarin (yellow, red, green) | *Citrus reticulata* | |
| Petitgrain, Orangenblüte | *Citrus × aurantium* | petitgrain is the leaf and neroli the blossom of the bitter orange |
| Cinnamon CO2 | *Cinnamomum verum* | |
| Cardamom | *Elettaria cardamomum* | |
| Nutmeg | *Myristica fragrans* | |
| Clove | *Syzygium aromaticum* | |
| Pink pepper | *Schinus terebinthifolia* | |
| Sage | *Salvia officinalis* | |
| Thyme, Thyme CO2 | *Thymus vulgaris* | Aromen names the chemotype (ct thymol), not the species |
| Chamomile, roman | *Chamaemelum nobile* | |
| Immortelle | *Helichrysum italicum* | |
| Jasmin absolut | *Jasminum grandiflorum* | |
| Laurel | *Laurus nobilis* | |
| Juniper berry, Juniper needle | *Juniperus communis* | |
| Juniper tar | *Juniperus oxycedrus* | cade oil |
| Cypress | *Cupressus sempervirens* | |
| Tea tree | *Melaleuca alternifolia* | |
| Cajeput | *Melaleuca cajuputi* | |
| Myrrh | *Commiphora myrrha* | |
| Frankincense Carterii, Hojari | *Boswellia sacra* | the two are different grades of the same species' resin |
| Copal | *Protium copal* | |
| Galbanum | *Ferula gummosa* | |
| Benzoin | *Styrax tonkinensis* | Siam benzoin |
| Peru balsam | *Myroxylon balsamum* | |
| Rosewood | *Aniba rosaeodora* | |
| Coffee CO2 | *Coffea arabica* | |
| Wintergreen | *Gaultheria procumbens* | |
| Wild mint, Menthol crystals | *Mentha arvensis* | |

## The seven refined from a genus

*Pelargonium graveolens* (Geranium) · *Curcuma longa* · *Larix decidua* (Larch,
Italy) · *Lavandula angustifolia* (Lavender CO2) · *Litsea cubeba* ·
*Magnolia salicifolia* (Nioikobushi) · *Rhododendron anthopogon* (Nepal).

## The six found on Wikidata directly

*Amyris balsamifera* · *Thujopsis dolabrata* (Hiba) ·
*Lavandula ×intermedia* (Lavandin 'Super') · *Fokienia hodginsii* (Siam wood) ·
*Lindera umbellata* (Kuromoji) · *Myrothamnus flabellifolius* (Resurrection Bush).

## Where a genus is still all the app claims

Four oils keep a genus, because nothing that was found settles the species:

- **Zitronegras** — *Cymbopogon*. Either *C. flexuosus* or *C. citratus*; Aromen
  says only "native to tropical regions".
- **Monarda** — *Monarda*. From France, which does not narrow it to one species.
- **Lindenblüte Absolute** — *Tilia*.
- **Thuja** — *Thuja*. Aromen says "Chinese storied Thuja trees", and the tree
  usually meant by that is *Platycladus orientalis*, which is not a *Thuja* at
  all. Naming a species here would be guessing at which of two things they mean.

The app shows the genus; it does not invent a species to fill the field.

## Two that were wrong on the first pass, and are fixed

`Petitgrain, Mandarine` and `Petitgrain, Zitrone` first came out as
*Citrus × aurantium*, because the term reducer strips everything after the comma
and every petitgrain then looked like the bitter-orange one. Petitgrain is the
leaf of whichever citrus is named, so they are *Citrus reticulata* and
*Citrus × limon*; only `Petitgrain, orange` is *Citrus × aurantium*.
