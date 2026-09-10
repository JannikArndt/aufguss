# CLAUDE.md

Operating notes for anyone — person or agent — changing **aufguss**. Read this
before editing. `README.md` says what the app is; this file is the contract.

---

## 1. The rule that outranks the others

**Nothing about essential oils is written from memory.**

If a fact is not in [`sources/`](sources/) with a URL and a date next to it, it
does not go in `src/data/`. Not the note an oil leads with, not which scents go
together, not a botanical name, not a dosage. This is not caution for its own
sake: the owner asked for a tool that helps them choose oils, and a tool that
invents plausible facts about them is worse than no tool.

Three things follow:

- **A guess is labelled.** Nine oils have a note the family implied rather than
  their supplier stated — eight of Aromen's, one of RBM's; they carry
  `noteEstimated: true` and the app says so on the oil. One oil has no
  botanical name at all, because RBM does not publish one for it and nobody
  here is going to supply it. Any future guess gets the same treatment or does
  not ship.
- **A judgement is written down.** `sources/open-questions.md` holds everything
  that could not be settled and what would settle it. Add to it rather than
  resolving something quietly.
- **The sources are re-checkable.** `node tools/check-sources.mjs` goes back and
  looks. It is not run by CI — it would fail on a bad day at Bäderland rather
  than a bad commit — but it is the thing to run before trusting the data.

And the second half of the same rule: **it is not a science.** Aufguss is a
craft with a lot of taste in it. The app suggests, reports and remembers; it
never refuses, never scores anyone, and never blocks a save. A set with three
base notes in it gets a remark, not an error.

## 2. Hard constraints

| Constraint | Why |
|---|---|
| Zero dependencies, no build step, static files at the repository root | What GitHub Pages serves is exactly what is committed. No npm, no bundler, no TypeScript, no CSS preprocessor, no CDN import. The cost is that `file://` does not work — ES modules are blocked there — so it must be served over http(s). |
| Everything the app is made of is listed in `sw.js`'s `SHELL`, and `VERSION` there matches `RELEASE.v` in `src/release.js` | There is no build step to generate either. A file missing from the precache list vanishes offline; a stale `VERSION` means the update never installs. `tools/smoke.mjs` asserts both. |
| No network call to any origin but this app's own | "Alles steht nur auf diesem Gerät" is on the Mehr screen, and it has to stay literally true. No fonts, no analytics, no error reporting. `sw.js` is the only file that may call `fetch()`, and only for this app's own files. `tools/smoke.mjs` greps `src/` for `fetch`, `XMLHttpRequest` and `sendBeacon`. |
| `localStorage` is the store, and every read tolerates it being gone | A journal is text; a thousand Aufgüsse is well under a megabyte, and a synchronous read that cannot fail halfway is worth more here than IndexedDB's headroom. `Store.available` goes false and every method returns empty when storage is blocked — writing an Aufguss down must never throw. |
| Export exists and is honest about why | Nothing leaves the phone, so nothing is anywhere else. Mehr → Sichern is the whole backup story and the screen says so. |
| Import merges, never replaces | An old backup must not be able to delete an Aufguss written since it was made. `Store.importAll` merges by id. |
| No medical claims | Aromen's "gut für" tags are shown as *their* words. The app describes what a scent is like, never what a body will do. |
| System fonts only | No webfont fetch. |

## 3. The map

The section numbers at the top of each file are how comments refer to each
other; they survived being split into files and should stay.

| file | contents |
|---|---|
| `src/core/util.js` | 0. `$`, `el`, `clear`, `fold`, dates, `notice` |
| `src/core/store.js` | 1. the journal, custom oils, favourites, prefs, export/import |
| `src/core/catalog.js` | 2. the merged catalogue and the search |
| `src/core/blend.js` | 3. pour order, balance, remarks — applying the sourced rules |
| `src/core/suggest.js` | 4. what would go with this, and why |
| `src/ui/parts.js` | 5. note chip, oil row, balance bar, autocomplete |
| `src/ui/entry.js` | 6. one Aufguss — the screen the app exists for |
| `src/ui/journal.js` | 7. the journal list |
| `src/ui/oils.js` | 8. the catalogue, and one oil |
| `src/ui/more.js` | 10. settings, backup, sources |
| `src/main.js` | 11. routing, tabs, viewport height, service worker |

The dependency graph is a DAG and stays one. Everything imports `util`;
`catalog` imports `store` and `data/`; `blend` imports `catalog`; `suggest`
imports both; the `ui/` files import the core; `main` imports the `ui/` files.

**Nothing imports `main.js`.** That is the only reason `tools/smoke.mjs` can
load the core in Node, and `tools/smoke.mjs` checks it.

`src/data/*.js` imports nothing at all. It is data, generated by reading a
source, and it is the file to change when a source changes — never the UI.
One data file per supplier: `oils.js` is Aromen's range, `oils-rbm.js` is
RBM's, and `catalog.js` is the only place that knows there are two.

## 4. Data invariants

- **A field the app reads is a field every oil has.** `id`, `de`, `family`,
  `familyDe`, `supplier`, and at least one `notes` entry. `tools/smoke.mjs`
  walks all 214 and fails on the first gap. `latin` is on that list too, with
  exactly one sourced exception, and the count is pinned so it stays one.
- **An oil's `family` is its own supplier's scent group**, verbatim in
  `familyDe`, and `family` is the English label the app already uses for that
  group — a translation and nothing more. The two suppliers do not agree with
  each other: Aromen has ten groups and a separate one for conifers, RBM has
  five and puts needles in Hölzer. Neither is corrected to match the other, and
  the union is still exactly ten `family` values.
- **An oil says who sells it.** `supplier` is `"Aromen"` or `"RBM"`, empty on
  your own oils. It is a fact about where to buy a bottle, never about how it
  smells: nothing in the app scores, filters or ranks on it except the filter
  chip that exists to say "only the shelf I am standing at". Both ranges have a
  Zitrone in them and that is two bottles, not a duplicate to clean up.
- **RBM's `goesWith` stays out of the search index.** It names other oils, so
  indexing it would return every oil whose Harmonie line mentions Zitrone for a
  query of `zitrone`. `tools/smoke.mjs` checks.
- **A note is `top`, `heart` or `base`.** An oil may carry two, as Aromen writes
  "top-to-heart note"; the **first** is the one that counts everywhere —
  `leadNote()` in `blend.js` is the only place that decides this. Half an oil in
  two buckets makes every count a fraction and nothing clearer.
- **`HARMONY` only names real families**, and Gourmand and Earthy are
  deliberately absent because neither source's table covers them. Do not fill
  them in to make the code tidier: an absent family scores nothing, which is the
  honest answer.
- **A theme's `families` is filled only where the plan says it out loud** —
  five of the sixty-two, all from Blankenese. `Waldfunkeln` sounds like wood and
  the plan does not say so, so the app is quiet about it. Do not read a theme's
  name as a hint.
- **A custom oil's id starts `own:`, and an RBM one `rbm:`.** Those prefixes
  are the only thing separating the three kinds of oil anywhere in the app, and
  they are what makes regenerating either data file safe.
- **Ids are the supplier's slugs.** They are also the last part of the product
  URL, which is what makes `check-sources.mjs` able to compare. Do not
  normalise them — `c11-bio-orangeol-suß` has a ß in it because the shop does.

## 5. Regenerating the data

The scripts that read the sources are not in the repository; the *method* is, in
`sources/`, in enough detail to redo it. In short:

- **Oils, Aromen** — scrape `/de/shop/category/atherische-ole-einzelole-26`
  (19 pages, `?ppg=` is capped at 20), take one product URL per article code,
  fetch the German and English page of each, read `Duftgruppe`, `Gut Für`, and
  the note out of the description text.
- **Oils, RBM** — their shop renders in JavaScript and a fetched product URL
  returns a 404 shell, so there is nothing to scrape. Read `sitemap.xml` for
  the product ids, POST them 25 at a time to the storefront's own
  `catalog/products` endpoint, and read the six labelled lines out of the
  description each page renders. Article numbers come off the price-list PDF,
  which is the only place they exist. `sources/oils-rbm.md` has the endpoint,
  the store id and where both came from; `tools/check-sources.mjs` does the
  whole thing, so the method is runnable rather than just written down.
- **Botanical names** — reduce the English product name to a plant term, look it
  up on English Wikipedia, follow redirects, read Wikidata `P225`. Anything that
  lands on a non-taxon page is a judgement call and goes in the table in
  `sources/botanical-names.md`.
- **Themes** — the intensity is a coloured icon, not text. Render the page and
  read it, then extract filled circles with their fill colours (PyMuPDF
  `get_drawings()`), match against the three legend colours, pair with the
  nearest time label. `sources/aufgussplan.md` has the colour values.

When the data changes, the matching `sources/*.md` changes in the same commit.
`tools/smoke.mjs` pins five counts on purpose — 133 Aromen oils, 81 RBM oils,
ten families across both, eight estimated Aromen notes, one estimated RBM note,
one oil with no botanical name — so a regeneration that moves any of them fails
until the source file is brought along.

## 6. Testing

```bash
node tools/smoke.mjs
```

127 checks. It loads the whole app — `src/main.js` and everything under it —
against the stub DOM in `tools/stub/`, and drives it the way a finger does: open
a new Aufguss, pick a theme off the plan, type three oil names in three
different languages, read what the screen says back, tap Fertig, reopen it,
check the store agrees.

The stub is deliberately strict and deliberately small. `getElementById` returns
`null` for an id `index.html` does not carry, so `$('gone').textContent` throws
here exactly as it would in Safari. A method the app does not call is not
implemented, on purpose: a loud failure beats a stub quietly returning the wrong
thing.

Some checks are structural rather than behavioural, and those are the ones
holding the no-build-step arrangement together: `VERSION` matching `RELEASE.v`,
`SHELL` listing exactly the modules on disk, every `$('id')` existing in the
markup, no hex colour outside `:root`, nothing under `src/` importing `main.js`,
nothing under `src/` calling the network.

**There is no browser in this loop.** The stub answers "would this run", not
"does this look right". Layout, real fonts and actual Safari behaviour are only
checkable on a phone. Before calling a change done:

1. Add an Aufguss on a real iPhone, in Safari, over https.
2. Add it to the Home Screen and open it again: it must start with no signal.
3. Rotate, and open the keyboard on the oil search: the foot must stay reachable.
4. Check both light and dark, and check the note dots are still distinguishable.
5. Push a new release, then open the installed copy: after one cold start the
   version stamp under Mehr must have changed.

## 7. House style

- Comments say **why**, not what, and read like the app does: plain, warm, no
  jargon. A constant needs a reason; `document.createElement` does not.
- UI copy is German, sentence case, second person, no exclamation marks. A
  control says what happens when it is used. Nothing congratulates anybody.
- Colours live in `:root` in `app.css` and nowhere else. A hex literal in a rule
  renders correctly in one theme and wrong in the other; `tools/smoke.mjs`
  checks.
- The note colours mean something and are the only colour that does. A coloured
  dot never appears without its word next to it — colour alone is no use to
  anyone who cannot tell the three apart.
- A screen is a head that stays, a middle that scrolls, and a foot that does not
  move. Buttons live in the foot so a small phone cannot push them off.
- Layout uses `--safe-t/-b/-l/-r` for the notch and `--app-h` for the part of the
  screen the browser is actually showing. `100vh` on iOS is a lie while
  scrolling.
- Nothing tappable is under 44 px.
- `var`, not `let`/`const`, in `src/` — and no optional chaining or nullish
  coalescing. The tools in `tools/` are modern Node and use whatever they like.

## 8. Deploying

Settings → Pages → **Deploy from a branch** → `main`, root folder. There is no
deploy workflow and there should not be one unless a build step appears.
`.github/workflows/test.yml` is not a deploy workflow: it runs
`node tools/smoke.mjs` and fails the build if a `package.json`, a lockfile or a
`node_modules` appears — the one constraint a CI job can usefully hold that a
reviewer forgets.

`.nojekyll` at the root is committed. Keep it: Jekyll ignores paths beginning
with an underscore, and that is a trap waiting for the first `_something.js`.

Every path is relative (`./sw.js`, `src/main.js`, `app.css`), so the app works
at `user.github.io` or at `user.github.io/aufguss/`. Keep them relative — a
leading slash puts the service worker's scope at the domain root, where a
project page cannot register it.

A deploy is finished when the version stamp on the phone changes. Because the
worker serves cache-first, the first load after a push still shows the old
version and takes the new one on the next cold start. That is the design.

## 9. Do not

- Write a fact about an oil that is not in `sources/` with a URL.
- Reconcile the two suppliers' scent groups, botanical names or spellings with
  each other, or with what you believe to be correct. Each range says what its
  own shop says.
- Fold RBM's `goesWith` into the search index, or into `about`.
- Add a dependency, a build step, or a request to another origin.
- Add a Save button, or anything else that lets a written Aufguss be lost by
  locking the phone. The editor saves on every change and that is the point.
- Let a storage failure interrupt anything. `Store` degrades to unavailable and
  reports on the Mehr screen; it never throws mid-Aufguss.
- Add scores, streaks, badges or grading. The journal reports what happened.
- Call `skipWaiting()` in the worker's `install`, or make the fetch handler
  network-first. Both look like improvements and both break the guarantee that
  the page and the modules under it come from the same version.
- Read a theme's name as a hint about which oils belong in it.
- Fill in `HARMONY.Gourmand` or `HARMONY.Earthy` to make the table symmetric.
- Reach into `src/main.js` from another module.
