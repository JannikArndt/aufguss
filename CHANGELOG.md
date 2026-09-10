# Changelog

Every entry here matches `RELEASES[0].v` in `src/release.js`, and both move
together with `VERSION` in `sw.js` — see `CLAUDE.md` §6 for why, and §8 for
what a version bump means to a phone that already has the app installed:
cache-first, so the change lands on the next cold start, unless it is taken
early from Mehr → **Update jetzt laden**. Mehr also shows the last few
entries below this list in short; this file is the whole history.

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
