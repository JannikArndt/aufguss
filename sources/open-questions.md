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

**Kampfer is settled, as of 10 September 2026:** RBM sells it
(<https://www.rbm-wellness.de/Kampfer-p472801955>, article 106 - 109,
*Cinnamomum camphora*, Herznote), and it is in `src/data/oils-rbm.js`. On the
same day `tools/check-sources.mjs` also reported `e6-kampfer` back in Aromen's
own listing — that has **not** been added, because adding it means reading its
product page the way the other 133 were read, and that is a regeneration of
`src/data/oils.js`, not a line. Tigerminze and Polarminze are still nowhere:
not in RBM's range either, single or blended. **What would settle it:** Aromen relisting Kampfer,
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
