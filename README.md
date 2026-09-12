# Aufguss

A journal for the oils you pour. Which theme, which three oils, what order, how
much, and what you thought of it — so that next Tuesday at 19:00 you can see
what you did last Tuesday at 19:00.

Live at **<https://jannikarndt.github.io/aufguss/>**. Add it to the Home Screen
and it opens like an app, works with no signal, and keeps everything on the
phone.

---

## What it does

**Write an Aufguss down.** Pick the theme — the sixty-two on Bäderland's own
plans autocomplete, and anything you type is a theme too. It brings the time
and the intensity off the plan with it. Then type three oil names. That is the
whole of the short path, and everything else on the screen is optional.

**Find an oil however you happen to think of it.** You search the plant, not
the bottle: „Mandarine“ stands once in the list, and the variety and the
supplier are chips you may tap afterwards or ignore. That is 147 entries over
287 bottles from three
ranges — 135 single oils from
[Aromen](https://www.aromen.be/de/shop/category/atherische-ole-einzelole-26),
from
[RBM](https://www.rbm-wellness.de/Naturreine-atherische-Ole-c134687002)
82 single oils plus their 23 fertige Mischungen, and from
[Purelia professional](https://schrader24.eu/portfolio/aetherische-oele/)
40 single oils plus 7 Ölmischungen — searchable by the German name, the English
name, the botanical name, the scent family, the note, the effect tags, how the
supplier says it smells, what a Mischung is made of, the supplier itself, or
the article code. `santalum`, `sandalwood`, `Sandelholz` and `w8` all find the
same bottle. All three ranges sell a Zitrone; that is one row, and under it
whose each bottle is.

**Find it under whatever name you have in your head.** Spearmint, Grüne Minze,
Krauseminze, *Mentha spicata* and Ährige Minze are one plant, and typing any of
them finds it. The three mints are three species and stay three rows —
*Mentha × piperita*, *Mentha spicata*, *Mentha arvensis* — because that is what
actually tells them apart, not the word on the label.

**See where the shops disagree.** Three ranges describe overlapping plants and
they do not always say the same thing: Aromen calls Kampfer a Kopfnote, RBM
calls it a Herznote, and Purelia says nothing about any of it. The app reports
that rather than picking a winner, and Mehr → Daten prüfen counts every such
case in one place, with a text to take back to the shops' own pages.

**Nothing scores what you poured.** There is no ratio to pick, no balance to
hit, no grade at the end. The app writes down what you did, puts the oils in
the order they go in, and says which note the set does not have yet if you ask
for a suggestion. That is the lot.

**Start with one scent and be offered the rest.** Type Zitrone and the app
suggests what would go with it, and says why each one: it fills the missing
note, its family pairs with what you have, or *you have poured these together
eleven times*. That third reason is the one that gets better.

**Remember.** Every Aufguss, grouped by day. What you did last time under this
theme, with a button to take the same oils again. How often you have used an
oil, when you last did, and which oils you keep pairing it with.

**Your own oils and your own notes.** Anything in neither range gets added in
two taps and lives alongside the catalogue. Every oil, theirs or yours, carries
a note that is yours.

## What it does not do

- **It never leaves the phone.** No account, no sync, no analytics, no request
  to any origin but its own. Which also means there is no copy anywhere else:
  **Mehr → Sicherung herunterladen** is the whole backup story, and it is worth
  doing now and then.
- **It does not tell you what to do.** Aufguss is a craft. Every number in it
  is somebody's rule of thumb and is labelled as such.
- **No medical claims.** Aromen's own "gut für" tags are shown as their words,
  because they are.

---

## Where the knowledge comes from

Nothing about an oil is written from memory. Every fact was read off a page —
the Aromen range on **8 September 2026**, the RBM range on **10 September
2026** — and [`sources/`](sources/) says which page, what it said, and where the
judgement calls are.

| what | from | file |
|---|---|---|
| 135 oils, families, notes, effect tags, descriptions | aromen.be, one product page each | [`sources/oils.md`](sources/oils.md) |
| 81 oils and 23 Mischungen, families, notes, characters, compositions | rbm-wellness.de, one product page each, plus their price list | [`sources/oils-rbm.md`](sources/oils-rbm.md) |
| the botanical names of the Aromen oils | Wikipedia + Wikidata `P225` | [`sources/botanical-names.md`](sources/botanical-names.md) |
| 62 themes, their times and intensities | Bäderland's eight Aufgusspläne | [`sources/aufgussplan.md`](sources/aufgussplan.md) |
| notes, mixing order, ratios, which families pair | four named pages | [`sources/blending.md`](sources/blending.md) |
| what could not be settled | — | [`sources/open-questions.md`](sources/open-questions.md) |

Three things are worth knowing before trusting a screen:

- **207 of Aromen's and RBM's 216 single-oil notes are the supplier's own
  words** — Aromen's description says "Diese luxuriöse Basisnote", RBM's says
  "Duftnote: Basisnote". The other **nine are estimated from the scent family**,
  and the app says so on the oil rather than pretending. One oil, RBM's
  Bergamottminze, has no botanical name at all, because RBM publishes none.
- **Purelia publishes no note, no scent group, no botanical name and no
  description for any of its 40 oils**, and none of the four was filled in from
  what another shop says about the same plant. The one page that lists the
  Professional line prints names and nothing else, and that is what is in here.
- **The 30 Mischungen have no note, and none was invented for them.** RBM
  publishes a Zusammensetzung and nothing else, five of those lines end in
  "uvm.", and Purelia publishes not even that. So a Mischung is poured last,
  counted as *ohne Note*, and its page says plainly that nothing is guessed.
- **The three suppliers do not classify alike, and none was corrected.**
  Aromen has ten scent groups including a separate one for conifers; RBM has
  five and calls every needle a Holz; Purelia has none. Each oil carries its
  own shop's word, and where two shops contradict each other the plant says
  nothing of its own and shows both sides.
- **The Kaifubad plan published online covers one day** — Dienstag, Frauensauna.
  There is no weekly plan to be had, so the app treats a theme as a name you
  pick and a time as any hour you like.
- **The blending rules come from two aromatherapy retailers, a sauna shop and a
  shop blog.** That is the level of source that exists for this. They agree
  about the shape and disagree about the numbers, which is why the app offers
  four ratios instead of one.

`node tools/check-sources.mjs` goes back and looks: it reports oils that have
appeared or gone from either range, RBM descriptions whose botanical name has
been edited, whether the Kaifubad PDF has changed, and whether the four
blending pages are still up.

---

## Running it

There is nothing to build. It is static files, served as committed.

```bash
python3 -m http.server 8000      # then open http://localhost:8000
node tools/smoke.mjs             # the whole app, in Node, 171 checks
node tools/check-sources.mjs     # go and look at the sources again
```

`file://` will not work — ES modules are blocked there — so it has to be served
over http.

## How it is built

Plain ES modules, one canvas-free page, no dependencies, no build step, no
framework. What GitHub Pages serves is exactly what is in the repository.

```
index.html            markup only
app.css               every style, and the only place a colour is written down
manifest.webmanifest  name, colours and icon for an installed copy
sw.js                 service worker: offline, and one version at a time
src/data/oils.js      the 135 Aromen oils
src/data/oils-rbm.js  the 81 RBM oils and their 23 Mischungen
src/data/themes.js    the 62 Aufguss themes
src/data/blending.js  the sourced rules, and only those
src/core/util.js      helpers, folding, dates
src/core/store.js     the journal, in localStorage
src/core/catalog.js   the catalogue and the search
src/core/blend.js     what can be said about a set
src/core/suggest.js   what would go with it, and why
src/ui/*.js           one file per screen
src/main.js           routing and wiring
tools/smoke.mjs       the whole app, in Node
tools/stub/dom.mjs    the DOM it runs against
tools/check-sources.mjs
sources/              where every fact came from
```

Everything in `CLAUDE.md` is the contract for changing it.

## Deploying

Settings → Pages → **Deploy from a branch** → `main`, root folder. `.nojekyll`
is committed and must stay: Jekyll ignores paths beginning with an underscore.
Every path in the app is relative, so it works at the repository root or under
`/aufguss/`.

A push is live when the version stamp under **Mehr → Diese Version** changes on
the phone. Because the service worker serves cache-first, the first load after
a push still shows the old version and takes the new one on the next cold
start — that is the design, not a failed deploy.
