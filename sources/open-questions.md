# What could not be settled

Written down because the alternative is quietly filling a field with something
plausible, which is the one thing this repository is not allowed to do.

## The Kaifubad plan is one day

<https://www.baederland.de/media/kaifu-bad_aufgussplan_web.pdf> is a single
poster covering **Dienstag, Frauensauna**, seven slots. Bäderland publishes one
PDF per house and none of the eight carries a week. The brief says the Aufgüsse
run every full hour, which that plan does not show, so either the published
plan is a sample or the real timetable lives somewhere that is not on the
website.

**What would settle it:** a photo of the plan on the wall, or the weekly
schedule in whatever form the house uses. `src/data/themes.js` is a plain
table; adding the other six days is a paste, not a rewrite.

## Eight oils have no note from Aromen

Cédrat · Daidai · Menthol-Kristalle · Muskatnuss · Japanese 'Sansho' Pepper ·
Jasmin mix · Wacholdernadel · Hinoki, leaves.

Their descriptions on aromen.be are either empty or written in an older style
that does not name a note. The app estimates from the scent family and marks
each one. **What would settle it:** the note printed on the bottle, or Aromen
answering. Fixing one is a two-word edit in `src/data/oils.js` plus dropping
its `noteEstimated`.

## Aromen split Krauseminze in two, and both are Spearmint

Until 10 September 2026 Aromen sold one article, `M4` *Krauseminze / Grüne
Minze*. It is now two: `M4` **Grüne Minze** (BIO, India) and a new `M5`
**Krauseminze** (not BIO, China). The M4 11 ml page keeps article 4490, so this
is a rename plus a new neighbour rather than two new products.

Both English pages call it *Spearmint*, both are Fresh and a Kopfnote, and the
two German descriptions differ only in the country. So both carry *Mentha
spicata* — two articles of one species, like their Blood orange and Sweet
orange. Nothing here decides whether the oils actually smell different; the
shop says the country and the certification differ, and that is all it says.

The rename moved M4's id, because an id is the supplier's slug. `wasId` keeps
the old one on the oil so an Aufguss written before the rename still finds it —
see `CLAUDE.md` §4.

**What would settle it:** nothing outstanding. It is written down here because
"two oils, one Latin name" is the sort of thing that looks like a bug later.

## RBM's Bergamottminze has neither a note nor a botanical name

<https://www.rbm-wellness.de/Bergamottminze-p473058551> is the one RBM product
page out of 81 with no `Duftnote:` and no `Botanischer Name:` line. Its whole
description is *"Mentha-Citrataöl / Charakter: frisch, spritzig, minzig,
süßlich / Harmonie: Zitrone, Limette, Kamille, Ylang Ylang, Cedernholz,
Edeltannennadel"*.

The note is estimated from the family and marked, the same way Aromen's eight
are. The botanical name is left **empty** rather than read out of
"Mentha-Citrataöl": that word is a trade name in the position where the other
80 pages put a labelled botanical name, and turning it into a binomial would be
a guess wearing a reading's clothes. It is the only oil in the app with no
Latin name at all, and `tools/smoke.mjs` pins that at exactly one so it cannot
quietly become two.

**What would settle it:** the label on the bottle, or RBM filling the two lines
in.

## Ten of RBM's botanical names are shared by two or three of their oils

Read off their product pages on 10 September 2026, verbatim:

| botanical name on their pages | oils carrying it |
|---|---|
| *Cedrus atlantica* | Cedernholz amerikanisch, Cedernholz atlas, Cedernholz Virginia |
| *Citrus reticulata* | Mandarine grün italienisch, Mandarine rot italienisch, Tangerine |
| *Boswellia carteri* | Cedernholz chinesisch, Weihrauch |
| *Cinnamomum camphora* | Hobaum, Kampfer |
| *Mentha arvensis* | Minze chinesisch, Minze indisch |
| *Citrus sinensis* | Blutorange, Orange süß italienisch |
| *Citrus aurantifolia* | Limette destilliert, Limette gepresst |
| *Citrus aurantium* | Orange bitter italienisch, Petitgrain südamerikanisch |
| *Anthemis nobilis* | Kamille blau, Kamille petitgrain römisch |
| *Lavandula angustifolia* | Lavendel bulgarisch, Lavendel moldawisch |

Some of these are obviously one species distilled two ways or grown in two
places — the two Limetten, the two Lavendel, the two Minzen — and some are
harder to read that way: one bottle called *Cedernholz chinesisch* and another
called *Weihrauch* sharing a name, or three cedars from three continents all
being *Cedrus atlantica*.

Nothing here decides which. They are copied as RBM writes them, because the
alternative is replacing what the supplier says with what somebody else
believes, and this repository does not do that. Their spelling is kept for the
same reason (`Albies alba`, `Uniperus communis`, `Illicum verum`).

**What would settle it:** the labels, or their batch documentation.

## RBM's Ringelblume is on the price list and nowhere else

Article 352 - 355, category *Mix*, four sizes and four prices on the
*Preisliste ab 01.08.2026*. Their shop does not have it: nothing under that
name in `sitemap.xml`, nothing in the Mischungen category, no product id to
ask the storefront endpoint about. Two of their own oils name it, though —
Eukalyptus chinesisch and Eukalyptus staigeriana both list *"Ringelblume MIX"*
under Harmonie — so it is a real product of theirs, not a stale row.

It is in `src/data/oils-rbm.js` with its name, its article number and nothing
else: no Zusammensetzung, no description, and `url: null`. It is the only RBM
entry whose id is not a product slug, and one of only two entries in the whole
app with no page to check it against. `tools/smoke.mjs` pins that at two so a
third cannot appear quietly, and `tools/check-sources.mjs` says so if
Ringelblume ever turns up in the shop.

**What would settle it:** RBM listing it, or the label off the bottle.

## ~~Aromen's Orangeöl süß has no product URL~~ — settled 10 September 2026

`c11-bio-orangeol-suß` was the only one of the 133 Aromen oils with
`url: null`; its slug has a **ß** in it, which is almost certainly what broke
the scrape that collected the other 132. The page was re-read by hand and says
exactly what the entry already said, so only the URL changed:
<https://www.aromen.be/de/shop/atherische-ole-einzelole-26/c11-bio-orangeol-suß-11ml-bio-4746>.

Ringelblume is now the only entry in the app with no URL, and `tools/smoke.mjs`
pins that at one.

## No Mischung has a note, and none is going to get one

RBM's 23 Mischungen have no `Duftnote:` line, because a blend does not have one
note — it has whatever its ingredients do, in whatever proportion the blender
chose, and RBM does not publish the proportion. Five of the 22 published
composition lines end in "uvm.", so they do not even claim to name every
ingredient.

Estimating a note here would be easy and it would be wrong: unlike the nine
single oils whose note is estimated, there is no sourced rule to estimate
*from* — the family/note association at maitreya-natura maps a scent family
onto a note, and a Mischung has no scent family either.

So they carry `notes: []`, and the app reports that rather than hiding it: a
Mischung is poured last, shows as *ohne Note* beside the balance bar, gets no
family score, and its own page says in so many words that nothing is being
guessed. `tools/smoke.mjs` pins that no Mischung has a note, an estimated note,
a botanical name or a Charakter.

**What would settle it:** RBM publishing a Duftnote for them. Nothing else
would, and a note typed in from experience belongs in your own note on the oil,
which every oil has.

## Kola-Nuss-Orange is listed twice in RBM's shop

*Kolanuss-Orange* carries only the 1000 ml page; *Kola-Nuss-Orange* carries the
20, 100 and 250 ml pages. Same Zusammensetzung word for word, and the price list
has one row (451 - 454). Read as one product listed twice, and kept as one
entry. It is a reading, not a fact RBM states, which is why it is written down
here; `tools/check-sources.mjs` names the second listing explicitly so it is not
reported as a new blend on every run.

**What would settle it:** RBM merging the two listings, or saying they are two
different blends.

## RBM has no group for conifers, Aromen does

Aromen sorts oils into ten scent groups and one of them is *Conifers*. RBM
sorts into five and puts every needle and every wood in *Hölzer*. So the app
holds Fichtennadel twice: Aromen's as Conifers/Nadelholz, RBM's as
Woody/Hölzer. Both are their own supplier's word, verbatim, which is the rule
this repository runs on — but it does mean the family filter and the harmony
table treat the same tree differently depending on which bottle is in hand.

Nothing was invented to smooth that over. Reclassifying RBM's needles as
Conifers would be the app deciding something neither supplier said.

**What would settle it:** nothing, really — it is two shops with two taxonomies
and both are published. Worth knowing when reading a remark about Duftgruppen.

## Four botanical names stop at the genus

*Cymbopogon* (Zitronegras) · *Monarda* · *Tilia* (Lindenblüte) · *Thuja*.

Aromen does not publish botanical names at all, and for these four the common
name does not narrow to one species. Thuja is the interesting one: their text
says "Chinese storied Thuja trees", and the tree usually meant by that is
*Platycladus orientalis*, which is not a *Thuja*. **What would settle it:** the
label, or the batch documentation.

## Which species Aromen actually distils

Every Latin name in this app is "the species that oil is normally made from",
taken from Wikidata — not "the species in this bottle". For most oils there is
no difference. For sandalwood there could have been, and Aromen's own
description saved it by naming New Caledonia. Where a supplier switches origin,
the species can change under an unchanged product name.

## Whether the ratios mean anything

30·50·20, 3·5·2, 5·2·3, 3·2·1 — four sources, four answers, no measurement
behind any of them that could be found. They are perfumery convention applied
to a ladle of water on hot stones, where the top note is gone in one Guss and
the "8 hours" of a base note is longer than the sauna is open. **This is the
weakest thing in the app.** It is presented as four options with the source
named on each, and the journal is the thing that could eventually contradict
them.

## Whether the family table means anything

Floria publishes it as a table and does not say where it comes from. It is not
symmetric as published, which the app handles by treating a pair as harmonious
if either side lists the other — a decision, not a source. Gourmand and Earthy
appear in nobody's table and are left out rather than guessed at, so Vanille,
Kaffee, Patchouli, Vetiver and Wacholder-Teer get no family score at all.

## The suggestion weights

`W` in `src/core/suggest.js` is a judgement: filling a missing note is worth 40,
family harmony 22, and pouring two oils together once is worth 9 up to a cap of
36. Those numbers say "after four Aufgüsse together, your own habit outweighs
the table", which is a defensible thing to believe and not a measured one. They
are in one object at the top of the file so they can be argued with.

## Kampfer, Tigerminze, Polarminze — not in Aromen's range

Asked for on 8 September 2026, the same day the catalogue was fetched, so this
is a same-day re-check rather than a stale one:

- **Kampfer.** An article code `E6` exists in Aromen's numbering (`E1`–`E11`
  skips only `E6` and `E9` in the current 133), and a search engine still
  turns up old product pages —
  <https://www.aromen.be/shop/e6-camphor-100ml-4312> and `…-50ml-4311` — but
  both now answer 404, and Aromen's own site search finds nothing for
  "kampfer" or "camphor", inside the single-oils category or across the whole
  shop. It looks discontinued rather than merely unlisted from this category.
- **Tigerminze** and **Polarminze.** No hit anywhere on aromen.be, in German
  or English, in or out of the single-oils category. Whatever these are —
  house names, another supplier's range — they are not something Aromen
  currently sells under that name.

None of the three went into `src/data/oils.js`, because there is nothing at a
URL to put next to them.

**Kampfer is settled twice over, as of 10 September 2026.** RBM sells it
(<https://www.rbm-wellness.de/Kampfer-p472801955>, article 106 - 109,
*Cinnamomum camphora*, Herznote) and it is in `src/data/oils-rbm.js`. And
Aromen have relisted their own: `tools/check-sources.mjs` found `e6-kampfer`
back in the category listing, with an 11 ml page that did not exist on
8 September
(<https://www.aromen.be/de/shop/atherische-ole-einzelole-26/e6-kampfer-11ml-5811>).
That page was read the same way as the original 133 — Fresh, Kopfnote, China,
not BIO — and it is in `src/data/oils.js`. Both are in the app under their own
supplier, and the two disagree about the note, which is the two shops
disagreeing and not an error here.

Tigerminze and Polarminze are still nowhere: not at Aromen, not at Purelia, and
not in RBM's range either, single or blended. **What would settle those two:** a
source naming a supplier and a product page, or the label off the bottle. **What would settle it:** Aromen relisting Kampfer,
or a source for Tigerminze/Polarminze naming a supplier and a product page. In
the meantime the app already has the right door for this: Öle → **+** adds an
oil under your own name, with whatever family and note you give it, and nothing
here has to wait on a source for that.

### Checked Purelia on 9 September 2026, at the owner's word they're from there

Purelia's real shop is <https://purelia.eu>, not `.de`. Its "Ätherische Öle"
category (<https://purelia.eu/produkt-kategorie/aetherische-oele/>) lists 16
single oils — Eukalyptus, Fichtennadel, Kiefernnadel, Lavendel, Lemongras,
Limette, Melisse, Orange, Bergamotte, Grapefruit, Pfefferminz, Zedernholz,
Zirbelkiefer, Rosmarin, Sternanis, Zitrone — and Kampfer, Tigerminze and
Polarminze are not among them.

- **Tigerminze** exists, but as a *Saunaaufguss-Konzentrat*
  (<https://purelia.eu/produkt/saunaaufguss-konzentrat-tigerminze/>), not a
  single oil: its own ingredient list reads "Äthylalkohol Bio, Eukalyptus
  Globulus Oil, Menthol, Mentha Arvensis Oil, Citrus Limonum Oil" — a
  four-oil blend in an alcohol base. That is a different kind of thing from
  everything else in this catalogue, which is one species per entry; folding
  a blend in under one botanical name would be the invented fact the whole
  point of `sources/` is to rule out.
- **Kampfer** and **Polarminze** are not on purelia.eu at all — not as an
  oil, not as a concentrate. `saunaaufguss-konzentrat-kampfer` and
  `saunaaufguss-konzentrat-polarminze` both 404, and neither name turns up
  in the concentrate category either (which does have an "Eisminze" —
  ice-mint — that is close in spirit to Polarminze but not the same name).

So this doesn't resolve to "add three Purelia oils" — the site doesn't carry
them under these names, single or blended. **What would settle it:** the
actual label off the bottle (name, and whether it says *ätherisches Öl* or
*Aufgusskonzentrat*), or a photo of it. Until then, Öle → **+** stays the
honest way to get these three into a journal — each with whatever the label
in hand actually says, which is worth more than a guess at a matching URL.

## What "intensity" means for a scent

Bäderland's three levels describe the **Aufguss** — how hot, how much steam, how
long — not the oils. Nothing was found that maps a scent onto them, and the app
does not pretend one: the intensity is recorded next to the oils and never used
to filter them. If a pattern exists it will show up in the journal first.

## Which part of an oil's name is the variant

The oil search now groups two bottles of the same plant together and offers the
difference between them as a chip — *Minze* with *chinesisch*, *indisch*,
*japanisch* next to it; *Zitrone* with *Aromen* and *RBM*. Every word on a chip
is lifted verbatim out of the oil's own German name or its `supplier` field, so
nothing is invented. But **which** word is the plant and which is the variant is
read off the string, not off a source: the first word is the plant, except after
*Grüne*, *Grüner*, *Frischer* and *Ylang*, where it is the first two. Neither
supplier publishes a separate field saying so.

That rule is right for the current 239 entries — it was checked against all of
them — and it will be wrong for something eventually. It reads *Petitgrain,
Mandarine* as Petitgrain in the Mandarine variant, which is what Aromen's own
name says and probably what a nose would say too, but it is a reading. It cuts
*kalt gepresst* into two words, so *kalt* and *gepresst* are separate chips. And
it keeps Aromen's *Cederholz* apart from RBM's *Cedernholz*, because §9 says the
two ranges are not spell-checked against each other.

Nothing downstream depends on the grouping: it narrows a list of search results
and nothing else. No oil is merged, renamed, hidden or given a property it did
not have, and an Aufguss still records the exact bottle by its own id.

**What would settle it:** a field from either supplier naming the variant
separately from the plant. Neither of the two field lists written down in
`sources/oils.md` and `sources/oils-rbm.md` has one — Aromen publishes a name, a
Duftgruppe and Gut-Für tags, RBM six labelled lines — so as far as this
repository has looked, the variant only ever exists inside the name. Failing
such a field, the list of exceptions grows by hand as new suppliers arrive, and
this paragraph grows with it.

## Grouping bottles into a plant

`src/core/catalog.js` builds a second layer on top of the grouping above: two
or more bottles that declare the same `plant` slug become one `art:` entry —
"Mandarine" once instead of eight bottles that each say Mandarine somewhere in
their name. **This is a reading of what the shops already wrote, not a claim
that two bottles are the same oil.** Nothing about a scent is asserted by it:
the plant carries a field only where its bottles that state one all state the
same, and says nothing where they don't, which is the same rule as everywhere
else here — a guess is worse than admitting there isn't one.

Until 0.8.0 the key was derived: split the German name at the spaces and take
the first word. That could never see that Aromen's *Grüne Mandarine*,
*Mandarine, gelb* and *Rote Mandarine*, RBM's *Mandarine grün italienisch* and
Purelia's three Mandarinen are one plant — the first words are "Grüne", "Rote"
and "Mandarine". So the key is now **declared**: every supplier bottle in
`src/data/` carries `plant`, one line next to the name it re-reads, and each
line can be checked on its own. The derivation is gone; the reading is written
down instead.

Checked against the current catalogue: **63 plants, built from 202 of the 286
bottles.** Of those 63, **26 disagree on which note they lead with, 21 on scent
family, and 31 on botanical name.** A disagreement is shown, not resolved — the
plant's `notes`, `family`/`familyDe` or `latin` comes back empty and a `split`
records what each bottle said, so the app prints "Aromen sagt Kopfnote, RBM
sagt Herznote" rather than picking a winner. Mehr → **Daten prüfen** lists all
of them in one place and writes out a text to take to the shops' own pages.

**Silence is not disagreement.** Purelia publishes no note, no scent group and
no botanical name for anything in its Professional line. A Purelia bottle
joining a plant therefore has no opinion to be at odds with, and agreement is
counted only over the bottles that actually state a value — otherwise adding a
range that says nothing would have quietly emptied every field RBM does fill
in. A bottle that says nothing still gets a row in the `split`, marked as
saying nothing, because "Purelia sagt nichts dazu" and "Purelia sagt Herznote"
are different facts.

A Mischung never joins a plant, however close its name sits to one. A Mischung
is an entry, not an oil (§4 of `CLAUDE.md`): it has no note, no botanical name
and no scent family to begin with, so it has nothing to agree or disagree with
a plant about.

### The calls that were close

- **Krauseminze.** Aromen's *Grüne Minze* is filed under `krauseminze`, not
  under `minze`. Its botanical name is *Mentha spicata*, the same as both
  Krauseminzen; and Aromen's own `wasId` records that this article used to be
  called *Krauseminze / Grüne Minze* before they renamed it on 10 September
  2026. **What would settle it:** Aromen saying whether M4 is still the same
  oil it sold under the old name.
- **Zedernholz** gathers eight bottles across three spellings — *Cederholz*,
  *Cedernholz*, *Zeder*, *Zederholz* — and their botanical names do not agree
  at all: *Cedrus deodara*, *Cedrus atlantica*, *Juniperus virginiana*, and on
  RBM's *Cedernholz chinesisch* a *Boswellia carteri*, which is frankincense
  and looks like an error on their page rather than a cedar. They are grouped
  because they are one shelf commercially; the `latin` disagreement is recorded
  rather than cleaned up, and it is one of the rows Daten prüfen lists.
  **What would settle it:** RBM correcting or confirming that line.
- **Cajeput** is *Melaleuca cajuputi* at Aromen and *Melaleuca leucadendra* at
  RBM; **Pfefferminze amerikanisch** is *Pycnanthemum pilosum* at RBM and
  *Mentha ×piperita* everywhere else; **Kamille blau** is *Anthemis nobilis* at
  RBM where Aromen's Kamille is *Chamaemelum nobile*. Each is grouped by the
  name the shop sells it under, with the botanical disagreement recorded.
- **Schwarz Fichte** (*Picea mariana*), **Aleppo-Kiefer**, **Maritime Kiefer**,
  **Latschenkiefer**, **Zirbelkiefer** and **Wacholder-Teer** are each kept out
  of the obvious larger group, because their botanical names say they are
  different species and their names say so too.
- **Krauseminze, Pfefferminze, Bergamottminze** are each their own plant,
  separate from **Minze**. Compounds are not stemmed together.

### The variety, cut out of the name

`variety` holds what a shop printed after the plant's name — `colour`,
`origin`, `method`, `kind`, `part` — and every value is a word that shop
already used. Three readings sit inside that and are worth naming:

- **Adjectives are put back into their base form** so three shops' inflections
  compare: Aromen's "Grüne" and Purelia's "grün" are both `colour: "grün"`;
  "Indische" and "indisch" are both `origin: "indisch"`. The name in `de` is
  untouched — it still says exactly what the label says.
- **Two misspellings of one Latin epithet are spelled once**: RBM's
  *Eukalyptus citrodora* carries `kind: "citriodora"`, and its *Melisse
  indikum* carries `kind: "indicum"`, so each sits on the same chip as the
  other shops' bottle rather than next to it. Aromen's French *Virginie* is
  **not** folded into RBM's *Virginia*: that would be a translation, and this
  repository does not translate a supplier's word.
- **`plantDe` names a plant where counting the spellings picks badly.** Aromen
  writes *Steranis* twice and RBM and Purelia write *Sternanis* once each, so
  the count ties and the shorter word — the typo — would have won. Twelve
  bottles carry the override, one for each plant that needed it, and the rest
  of the catalogue is named by counting. It names the plant; it never corrects
  what a shop printed.

**What would settle all of this:** a supplier field naming the plant and the
variant separately. Neither `sources/oils.md`, `sources/oils-rbm.md` nor
`sources/oils-purelia.md` lists one among the fields any of the three shops
publishes, so the grouping above is read off the names and nothing else, and
stays exactly as re-checkable, and exactly as fallible, as that reading is.
