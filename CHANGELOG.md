# Changelog

Every entry here matches a `RELEASE.v` in `src/release.js`, and both move
together with `VERSION` in `sw.js` — see `CLAUDE.md` §6 for why, and §8 for
what a version bump means to a phone that already has the app installed:
cache-first, so the change lands on the next cold start, unless it is taken
early from Mehr → **Update jetzt laden**.

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
