# RBM's safety data sheets

Read 12 September 2026, from a list of 101 links the owner supplied. What came
out of them is in `src/data/oils-rbm.js` as four fields: `cas`, `colour`,
`main` and `sdb`.

## Why bother with a safety data sheet

Because it is the one document a shop has to get right.

A product page is marketing; a Sicherheitsdatenblatt is filed under REACH and
CLP, and it carries three things the product page does not:

- **A CAS number.** Which is what actually identifies an oil. Two shops' German
  names never will — *Cedernholz*, *Cederholz*, *Zederholz* and *Zeder* are one
  shelf and five species, and only the CAS tells them apart.
- **A colour.** ABSCHNITT 9.1, one word, theirs.
- **What is in the bottle.** ABSCHNITT 3 lists the constituents that trigger a
  classification, with a percentage band each: *Estragol 75 – 90 %*,
  *Menthol 25 – 50 %*. That is what a nose meets, and it is the one place a
  fertige Mischung says anything about itself beyond its name.

## Method

1. The links are signed CloudFront URLs with an expiry, so they are not stored
   anywhere in this repository. Unescape the `&amp;` in them first or the
   signature is wrong and every fetch 403s.
2. Fetch each PDF, extract the text, then **cut each dump to ABSCHNITT 1, 3 and
   9** plus the "Überarbeitet am" line. A full sheet is 20-odd pages of hazard
   statements, first aid and transport, none of which is wanted, and all of
   which buries the four lines that are.
3. De-hyphenate across line breaks before matching a label — the layout breaks
   words ("Ver-\nbraucher") and splits a label from its value.
4. Read the labelled lines. `.claude/agents/sdb-extract.md` is the agent that
   does this and is the specification: copy verbatim, never compose, a missing
   field is `null`.
5. Match each sheet to an entry by name. This is the fiddly part — the sheets
   use the long trade name where the shop uses the short one, and thirteen had
   to be paired by hand:

   | entry | sheet |
   |---|---|
   | Sternanis | Anisöl/Sternanisöl |
   | Ylang Ylang Cananga | Canangaöl |
   | Hobaum | Ho-Öl (Ho-Scho-Öl) |
   | Kamille petitgrain römisch | Kamillenöl römisch italienisch |
   | Lavandin super | Lavandinöl französisch super |
   | Lemonmyrthe | Lemonmyrtenöl |
   | Weihrauch | Olibanumöl indisch |
   | Kola-Nuss-Orange | Parfümöl Kolanuss nat |
   | Harmony | Parfümöl nat. Blutorange & Minze … - 33 206 - |
   | Summermix | Parfümöl natural Typ : Mint / Berry Lime Var. II - 32 959 - |
   | Pfefferminze indisch | Peppermint Oil |
   | Tangerine | Tangarinenöl |
   | Heiliger Basilikum | Tulsiöl |

   `sdb` on each entry records which sheet it came from and when that sheet was
   revised, so a pairing can be checked rather than trusted.

## What was found

- **100 of RBM's 104 entries have a sheet.** The four without are *1001 Nacht*,
  *Beifuß*, *Blue Ice* and *Orange Sprizz*.
- **Every sheet lists constituents**, the Mischungen included — which is the
  first thing any of them has said about itself beyond a Zusammensetzung line.
  Only the bands at 1 % or more are kept; below that it is a list of trace
  allergens, not a description.
- **No sheet prints a botanical name**, with one exception: the Bergamottminze
  sheet is headed *"Bergamottminze - Mentha-Citrataöl"*. That was the one single
  oil in either range with no botanical name at all, and RBM's own document
  closed it. `latin` there is theirs, not this repository's.
- **Ringelblume has a sheet**, which is more than its product page has — it is
  on the price list and not in the shop at all.

## What the sheets leave open

- **Thymian.** RBM's product page says *Thymus vulgaris*. Their safety data
  sheet is headed *"Thymianöl (ex Thymus serpyllum)"*, which is a different
  species — Quendel, wild thyme. Nothing has been changed on the strength of
  it: the two documents are both theirs and they disagree. **What would settle
  it:** RBM saying which one the current batch is.
- **Origins the sheets know and the shop does not.** *Teebaumöl chinesisch*,
  *Ingweröl CHINA*, *Rosmarinöl tunesisch*, *Salbeiöl dalmat.*, *Wintergrünöl
  chinesisch*, *Basilikumöl indisch* — six origins printed on a sheet where the
  product name carries none. They are not in `variety` yet, because a variety
  chip changes how a plant groups and that is worth doing deliberately rather
  than as a side effect of reading a PDF.
- **A CAS number is not a species.** It narrows an oil a great deal and it is
  worth having, but resolving one to a plant is a lookup this repository has not
  done. The corrections in [`corrections.md`](corrections.md) were made on the
  botanical names themselves, not on these numbers.
