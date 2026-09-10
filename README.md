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

**Find an oil however you happen to think of it.** 214 single oils from two
ranges — 133 from
[Aromen](https://www.aromen.be/de/shop/category/atherische-ole-einzelole-26)
and 81 from
[RBM](https://www.rbm-wellness.de/Naturreine-atherische-Ole-c134687002) —
searchable by the German name, the English name, the botanical name, the scent
family, the note, the effect tags, how the supplier says it smells, the
supplier itself, or the article code. `santalum`, `sandalwood`, `Sandelholz`
and `w8` all find the same bottle. Both ranges sell a Zitrone; the app shows
whose each one is rather than picking for you.

**See what the set adds up to.** Kopf, Herz and Basis as a bar; the order to
pour them in, heaviest first; what your chosen ratio would have wanted; whether
the scent families are ones the sources pair. All of it reported, none of it
enforced — it will never stop you saving something.

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
| 133 oils, families, notes, effect tags, descriptions | aromen.be, one product page each | [`sources/oils.md`](sources/oils.md) |
| 81 oils, families, notes, characters, descriptions | rbm-wellness.de, one product page each, plus their price list | [`sources/oils-rbm.md`](sources/oils-rbm.md) |
| the botanical names of the Aromen oils | Wikipedia + Wikidata `P225` | [`sources/botanical-names.md`](sources/botanical-names.md) |
| 62 themes, their times and intensities | Bäderland's eight Aufgusspläne | [`sources/aufgussplan.md`](sources/aufgussplan.md) |
| notes, mixing order, ratios, which families pair | four named pages | [`sources/blending.md`](sources/blending.md) |
| what could not be settled | — | [`sources/open-questions.md`](sources/open-questions.md) |

Three things are worth knowing before trusting a screen:

- **205 of the 214 notes are the supplier's own words** — Aromen's description
  says "Diese luxuriöse Basisnote", RBM's says "Duftnote: Basisnote". The other
  **nine are estimated from the scent family**, and the app says so on the oil
  rather than pretending. One oil, RBM's Bergamottminze, has no botanical name
  at all, because RBM publishes none for it.
- **The two suppliers do not classify alike, and neither was corrected.**
  Aromen has ten scent groups including a separate one for conifers; RBM has
  five and calls every needle a Holz. Each oil carries its own shop's word.
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
node tools/smoke.mjs             # the whole app, in Node, 127 checks
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
src/data/oils.js      the 133 Aromen oils
src/data/oils-rbm.js  the 81 RBM oils
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
