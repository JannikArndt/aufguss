# Other names a plant answers to

`src/data/names.js`. Read before adding to it.

## What this is

A search index. Nothing more, and deliberately nothing more.

A shop prints one name on a bottle. The person in front of the shelf has a
different one in their head: *Spearmint*, *Grüne Minze*, *Krauseminze*,
*Mentha spicata* and *Ährige Minze* are one plant, and typing any of them
should find it. So each `plant` slug may carry a list of other names, and those
names are folded into the plant's search haystack at the same weight as the
name the shop printed.

They appear on one screen — the oil's own page, under *Heißt auch* — and
nowhere else. Nothing in the app reasons with them, filters on them, groups on
them, or shows one where a supplier's own name belongs.

## Where it comes from, and why that is different

**Not from a supplier.** Neither Aromen, RBM nor Purelia publishes a synonym
list. These are the plant's common names in German and English plus its
botanical synonyms, supplied by this repository from general knowledge, at the
owner's explicit request (11 September 2026) and for search only.

That is a lower bar than [`CLAUDE.md`](../CLAUDE.md) §1 sets for anything else
in `src/data/`, and it is confined to this one file on purpose:

> a wrong synonym costs a search hit; a wrong note costs an Aufguss.

So the rule for this file is narrower rather than looser:

- **Only names.** A common name, a regional name, an English name, an old
  spelling, a botanical synonym. Never a note, a scent group, an effect, a
  dosage or anything else the app would read as a fact about how an oil smells.
- **Only for a plant the catalogue already has.** `tools/smoke.mjs` checks that
  every key resolves to an `art:` entry, so a typo cannot sit here unnoticed.
- **A name that is wrong is a bug, not a lie.** Correct it and move on. Nothing
  downstream has believed anything because of it.

## How to check one

Take the plant's botanical name out of `src/data/`, look it up on Wikispecies
or on the German and English Wikipedia, and read the synonym list and the
common names there. Where the German and English Wikipedia disagree about which
species a common name belongs to — which happens with mints, cedars and
chamomiles constantly — the botanical name in `src/data/` decides, and the
common name goes to the species that actually carries it.

## The mints, which are why this file exists

Three species, sold under a dozen names between them. The split is the
botanical name, never the word on the label:

| botanical | plant slug | answers to |
|---|---|---|
| *Mentha × piperita* | `pfefferminze` | Pfefferminze, Peppermint, Edelminze |
| *Mentha spicata* | `krauseminze` | Krauseminze, Krause Minze, Grüne Minze, Speer-Minze, Ährige Minze, Spearmint, Green mint, Garden mint, Common mint, Lamb mint, Mackerel mint, *Mentha viridis* |
| *Mentha arvensis* | `minze` | Minze, Ackerminze, Feldminze, Japanische Minze, Cornmint, Field mint, Japanese mint, *Mentha canadensis* |
| *Mentha citrata* | `bergamottminze` | Bergamottminze, Bergamotte-Minze, Zitronenminze, Bergamot mint, Eau de cologne mint |

Aromen's *Grüne Minze* is filed under `krauseminze`: its own botanical name is
*Mentha spicata*, and Aromen's `wasId` records that the article used to be
called *Krauseminze / Grüne Minze* before they renamed it.

**One open question.** Both shops file their *Indische Minze* / *Minzöl
indisch* under *Mentha arvensis*, and the Indian mint crop is overwhelmingly
cornmint, so that is where it sits. The owner remarked in passing that Indian
mint is *Mentha spicata*; Indian spearmint does exist and is also traded.
Nothing has been changed on the strength of the remark. **What would settle
it:** the shops naming the species on the product page, or a batch's own
analysis certificate.
