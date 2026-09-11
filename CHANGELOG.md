# Changelog

Every entry here matches `RELEASES[0].v` in `src/release.js`, and both move
together with `VERSION` in `sw.js` — see `CLAUDE.md` §6 for why, and §8 for
what a version bump means to a phone that already has the app installed:
cache-first, so the change lands on the next cold start, unless it is taken
early from Mehr → **Update jetzt laden**. Mehr also shows the last few
entries below this list in short; this file is the whole history.

## 0.6.0 — 2026-09-11

Typing an oil name left about two suggestions visible. The field sat in the
middle of the screen, the keyboard took the bottom half, and the Fertig button
held a strip in between that the list could not use.

- **Fertig steps out of the way while you type.** It only ever closed the
  screen, and the header's Zurück does the same thing, so it is not worth the
  strip it stood on. It comes back the moment no field has focus.
- **The search field goes to the top, not the middle.** Everything below it is
  then list. The list also measures the space it actually has rather than
  taking 46 % of the window height, which is a number iOS stops telling the
  truth about the moment the keyboard is up.
- **Twelve hits instead of eight**, now that there is somewhere to put them.
- **Chips for the choice, where there is one.** Search for *Minze* and
  *chinesisch*, *indisch*, *japanisch* sit above the list; search for *Zitrone*
  and *Aromen* and *RBM* do. A tap narrows, another tap gives it back, and not
  tapping shows everything — nobody is made to pick a variant to find an oil.
  Every word on a chip is lifted out of the oil's own name or its supplier
  field; `nameParts()` in `src/core/catalog.js` is the whole of the rule, and
  which part of a name it reads as the plant is written down in
  `sources/open-questions.md`, because that part is a reading rather than a
  source.

## 0.5.1 — 2026-09-10

Aromen's range had moved since it was read on 8 September.
`tools/check-sources.mjs` said so while the RBM range was being added, and all
four pages below were re-read the same way as the original 133 — German page
and English page, `Duftgruppe`, `Gut Für`, and the note out of the description.
239 entries now.

- **Kampfer is back at Aromen.** `E6` was a hole in their numbering on
  8 September and its old URLs answered 404; there is an 11 ml page again.
  Fresh, Kopfnote, from China. The app now has two Kampfer, one per supplier,
  and they disagree about the note — Aromen says Kopf, RBM says Herz. Both say
  what their own shop says.
- **Krauseminze was split in two.** What was one article, *Krauseminze / Grüne
  Minze*, is now `M4` **Grüne Minze** (BIO, India) and a new `M5`
  **Krauseminze** (China). Both are Spearmint in English, both *Mentha
  spicata*, both Fresh and a Kopfnote; the shop separates them by country and
  certification.
- **An Aufguss written before that rename still shows its oil.** The rename
  moved M4's id, because an id is the supplier's slug — so the oil now carries
  the id it used to have, and looking one up falls back to it. Without that,
  the oil would have quietly disappeared out of an Aufguss that was correct
  when it was written.
- **Orangeöl süß has its link back.** It was the one oil with no product URL;
  its slug has a ß in it, which is almost certainly what dropped it out of the
  first scrape. The page still says exactly what the entry said, so only the
  link changed. RBM's Ringelblume is now the only entry in the app with no page
  to check it against.
- Corrected the effect-tag counts in `sources/oils.md`: five of the seven rows
  had been two to four too high since the file was written. A slip in the
  documentation, not in the data — the tags on the oils were right all along,
  and the numbers are now read off `src/data/oils.js`.

## 0.5.0 — 2026-09-10

- Added RBM's **23 fertige Mischungen** — 1001 Nacht, Blue Ice, Heublume,
  Nautilust "MED", Wintermärchen and the rest — so the catalogue is 237. Each
  carries the Zusammensetzung line RBM publishes, verbatim and unparsed,
  because half of them are a list ending in "uvm." and the rest are a sentence
  ("Gletschereis plus grüne Zitrone mit Mandarine").
- **A Mischung has no note, and none was invented.** RBM publishes no Duftnote
  for them, and there is nothing to estimate from — the family/note rule the
  nine estimated single-oil notes lean on needs a scent family, which a
  Mischung has not got either. So they carry no note, no botanical name and no
  Duftgruppe, and the app says so on the oil instead of filling anything in.
- The app already knew what to do with a note-less oil, and now shows it: a
  Mischung is poured last, appears as **ohne Note** in the balance-bar key
  rather than leaving the bar mysteriously short, and scores nothing in the
  harmony table. It only ever turns up in a suggestion because your own journal
  put it next to something.
- Fixed a sentence that could read "Alles null": the remark about a one-note
  set took its wording from the first oil in the set, which since custom oils
  existed could be one with no note at all. It now reads the note off the count.
  The estimated-note remark said "nicht von Aromen angegeben" and now says
  "nicht vom Anbieter angegeben", which has been true since 0.4.0.
- `tools/check-sources.mjs` re-reads the Mischungen too and reports any whose
  Zusammensetzung has been edited.
- Two entries in the app now have no URL to check them against, both written
  down in `sources/open-questions.md`: RBM's **Ringelblume**, which is on their
  price list and has no product page at all, and Aromen's **Orangeöl süß**,
  whose slug has a ß in it — that one predates the RBM range and was only
  noticed because the count got pinned.

## 0.4.0 — 2026-09-10

- Added the RBM range: **81 single oils** from RBM Natur Sauna & Wellness, so
  the catalogue is now 214. Read off their own product pages and their price
  list on 10 September 2026 — botanical name, Pflanzenfamilie, Duftnote,
  Charakter, Herstellung and the Harmonie line, all in their words.
  `sources/oils-rbm.md` has the method, including how a JavaScript-only shop
  gets read at all.
- Every oil now carries a `supplier`, shown under its name in every list and as
  a pill on the oil sheet. Both ranges sell a Zitrone, a Zirbelkiefer and an
  Amyris; those are two bottles each, not duplicates, and the app says which.
- Öle gained a filter chip per range, next to the Duftgruppen. Typing `rbm`
  works too, as does searching by how an oil smells — `rauchig` finds
  Birkenteer.
- An RBM oil's sheet also shows its Pflanzenfamilie, its Charakter and what RBM
  says it harmonises with. That last list names other oils, so it is
  deliberately not searchable: a query for Zitrone should not return the twelve
  oils whose Harmonie line mentions it.
- RBM does not publish effect tags or English names, so those stay empty rather
  than getting invented. One oil — Bergamottminze — has neither a note nor a
  botanical name on their page: its note is estimated from the family and
  marked as such, its botanical name is left empty, and both are written down
  in `sources/open-questions.md`.
- `tools/check-sources.mjs` now re-reads the RBM range too, through the
  storefront endpoint their site uses, and reports oils that have appeared or
  gone as well as descriptions whose botanical name has been edited.

## 0.3.1 — 2026-09-10

- Replaced the Kopf/Herz/Basis glyphs (▲ ● ■) with proper icons: a head
  silhouette for Kopf, a heart for Herz; Basis keeps its square, now drawn
  the same way as the other two for a consistent set.
- Redrew the Kellen ladle icon — the wave-into-an-ellipse from 0.3.0 didn't
  read as a ladle at all; it's now a bowl with a handle.

## 0.3.0 — 2026-09-09

- Removed the ml field from a set row entirely; the row now shows the note
  as a small coloured shape (▲ Kopf, ● Herz, ■ Basis) instead of the word,
  so four oils fit a phone screen without scrolling.
- The divider now sits between Kugeln, not between two oils sharing one.
- "Öl hinzufügen" replaces the longer "Noch ein Öl für diese Kugel …".
- "Passt dazu" is gated behind a "Passende Öle vorschlagen" button instead
  of always showing — it stays open for the rest of that Aufguss once asked
  for.
- "Beim letzten Mal" is gone entirely when there is no previous entry under
  the theme, instead of saying so. When there is, it lists up to five past
  Aufgüsse with a "Mehr …" for further ones, each with its oils grouped by
  the round (Kugel) they were combined on, and each tappable to take those
  oils again.
- Removed the Mischen tab and everything behind it (`src/ui/mix.js`, the
  unused `setsFromFavourites`/`favouritePairs` in `suggest.js`) — nothing
  else linked into it, and it never earned the tab.
- Replaced the spoon emoji for Kellen with a small inline SVG ladle icon,
  in the spirit of the coloured icons on Bäderland's own Aufgusspläne.
- The changelog now shows more than the latest entry in Mehr, and this file
  now has a full history rather than just the newest note.
- Narrowed the iOS keyboard gap further and fixed a new gap that had opened
  below the tab bar (both from the same `position: fixed` experiment in
  0.2.0, now reverted in favour of `overflow: hidden` on `html` as well as
  `body`, an extra `visualViewport` `scroll` listener, and a focus handler
  that nudges the field into view once the keyboard has settled).

## 0.2.1 — 2026-09-09

- Added a manual "Update jetzt laden" control on the Mehr screen for when a
  new version has finished downloading in the background and you would
  rather not wait for the next cold start. `sw.js`'s `install` handler still
  never calls `skipWaiting()` on its own — this only reacts to that one
  explicit tap, via a `message` the page sends once someone asks for it.
- Added this file.

## 0.2.0 — 2026-09-08

- Renamed the Journal tab and screen to Aufgüsse, with matching copy
  elsewhere ("Zurück zu den Aufgüssen", "In deinen Aufgüssen").
- Oils go on ice balls now: each Aufguss holds one or more rounds (Kugeln),
  each with its own oils and its own search field, defaulting to three
  rounds of one oil, with "Weitere Kugel" to add more.
- Stärke is shown as Kellen (spoon icons, 1–3) instead of the German words,
  both on the entry screen and in the journal list.
- The oils screen wraps its family filters onto their own lines instead of
  scrolling them out of sight; the notes/favourites row still scrolls.
- Fixed the app body to the viewport so focusing a field near the foot no
  longer leaves a gap between it and the keyboard.
- Returning to a list (journal, oils) no longer resets its scroll position;
  opening a specific Aufguss or oil still starts at the top.
- Removed the dosage/citation paragraph from the oil detail screen.

## 0.1.0 — 2026-09-08

First release. Journal, 133 oils from Aromen with scent group, note and
description, 62 Aufguss themes from Bäderland's own plans, and suggestions
built from note, scent-group harmony and your own journal.
