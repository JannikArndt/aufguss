# CLAUDE.md

Operating notes for anyone — person or agent — changing **aufguss**. Read this
before editing. `README.md` says what the app is; this file is the contract.

---

## 0. What the app is for

**Quickly writing down what you did in which Aufguss.** That is the whole job.

Finding patterns in the journal, being offered a scent that would go with the
two you have, reading what a supplier says about an oil — all of it is nice to
have, and none of it may ever get in the way of writing an Aufguss down.

Two things follow, and they settle most arguments about scope:

- **An accurate representation of one supplier's product range is not the
  goal.** Which shelf a bottle came from, what its article number is, whether
  it is still stocked — none of that is the point. The plant is the point; the
  shop is a chip you may tap. Ranges are there so the same plant can be found
  under whatever name it has this week, not so the app can be a catalogue.
- **The Bäderland connection is incidental.** The Aufgusspläne are a
  convenience — one plan per day, an asterisk for the ones that only run at
  weekends, roughly hourly in winter and roughly two-hourly in summer, none of
  it strict. A theme off the plan may prefill a time and an intensity. It must
  never restrict what can be written down.

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
  `noteEstimated: true` and the app says so on the oil. RBM's 23 Mischungen and Purelia's 7 have no note, no
  botanical name and no scent family; and Purelia's whole Professional line has
  none of those and no description either, because the only page that lists it
  prints names and nothing else. Nobody publishes any of it and nobody here is
  going to supply it. Any future guess gets the same treatment or does not
  ship.
- **A judgement is written down.** `sources/open-questions.md` holds everything
  that could not be settled and what would settle it. Add to it rather than
  resolving something quietly.
- **The sources are re-checkable.** `node tools/check-sources.mjs` goes back and
  looks. It is not run by CI — it would fail on a bad day at Bäderland rather
  than a bad commit — but it is the thing to run before trusting the data.
- **Restructuring is not inventing.** The rule bans new oils, new effects and
  new claims. It does not ban carefully re-cutting what a supplier already
  wrote: reading "Minze" out of "Minze chinesisch" so the three mints can be
  found together invents no word, asserts nothing about the oil, and changes no
  entry — the id an Aufguss recorded still names the same bottle. Do it where
  it makes the app easier to use, keep the supplier's own spelling, and write
  the reading down in `sources/open-questions.md` the way `nameParts()` is,
  because a reading can be wrong even when every word in it is sourced.

Two files sit outside that rule on purpose, and both say so at the top of
themselves:

- **`src/data/names.js`** holds the other names a plant answers to — Spearmint,
  Krauseminze, *Mentha spicata*, Ährige Minze. No shop publishes a synonym
  list, so these come from general knowledge. They are a **search index and
  never a claim**: only names, only for a plant the catalogue has, never a
  note, a group, an effect or a dose. `sources/names.md` says how to check one.
  A wrong synonym costs a search hit; a wrong note costs an Aufguss.
- **`latinFixed: true`** marks a botanical name this repository supplies because
  the shop's is wrong on its face — RBM filed its Chinese cedarwood under
  *Boswellia carteri*, which is frankincense. A correction is never silent: the
  oil's page prints *(korrigiert)*, and `sources/corrections.md` lists what was
  there and why it changed. Only for an error anybody can check; a genuine
  judgement call between two plausible species is still left alone and still
  shows both sides.

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
| A field a shop leaves empty stays empty | Three ranges describe overlapping plants. What one shop does not publish is never filled in from what another says about the same plant, and never from the code's own reading. Mehr → Daten prüfen counts every such gap; it does not close any. |
| System fonts only | No webfont fetch. |

## 3. The map

The section numbers at the top of each file are how comments refer to each
other; they survived being split into files and should stay.

| file | contents |
|---|---|
| `src/data/names.js` | the other names a plant answers to — search only |
| `src/core/util.js` | 0. `$`, `el`, `clear`, `fold`, dates, `notice` |
| `src/core/store.js` | 1. the journal, custom oils, favourites, prefs, export/import |
| `src/core/catalog.js` | 2. the merged catalogue, the plant layer and the search |
| `src/core/blend.js` | 3. pour order, balance, remarks — applying the sourced rules |
| `src/core/suggest.js` | 4. what would go with this, and why |
| `src/ui/parts.js` | 5. note chip, oil row, balance bar, autocomplete |
| `src/ui/entry.js` | 6. one Aufguss — the screen the app exists for |
| `src/ui/journal.js` | 7. the journal list |
| `src/ui/oils.js` | 8. the catalogue, and one oil |
| `src/ui/more.js` | 10. settings, backup, sources |
| `src/main.js` | 11. routing, tabs, viewport height, service worker |
| `src/ui/check.js` | 12. where the three ranges contradict each other |

The dependency graph is a DAG and stays one. Everything imports `util`;
`catalog` imports `store` and `data/`; `blend` imports `catalog`; `suggest`
imports both; the `ui/` files import the core; `main` imports the `ui/` files.

**Nothing imports `main.js`.** That is the only reason `tools/smoke.mjs` can
load the core in Node, and `tools/smoke.mjs` checks it.

`src/data/*.js` imports nothing at all. It is data, generated by reading a
source, and it is the file to change when a source changes — never the UI.
One data file per supplier: `oils.js` is Aromen's range, `oils-rbm.js` is
RBM's, `oils-purelia.js` is Purelia's, and `catalog.js` is the only place that
knows there are three.

## 4. Data invariants

- **A field the app reads is a field every oil has.** `id`, `de` and
  `supplier`. `tools/smoke.mjs` walks every bottle and fails on the first gap.
  Three more are on that list with sourced exceptions, and every exception is
  pinned to exactly the entries that earn it so it cannot spread: `family` and
  `familyDe`, and at least one `notes` entry, on everything except a Mischung
  (nobody publishes either for one) and everything except Purelia (which
  publishes neither for anything in its Professional line); and `latin` on
  every Aromen and RBM single oil — the last gap, RBM's Bergamottminze, was
  closed by their own safety data sheet — and on nothing of Purelia's.
- **A supplier bottle declares which plant it is.** `plant` is a folded slug
  (`"mandarine"`), and it is what the catalogue groups on — not a rule applied
  to the name. A Mischung carries none, because a Mischung is an entry and not
  an oil. `variety` holds what the supplier printed *after* the plant's name,
  cut into `colour`, `origin`, `method`, `kind` and `part`, all optional, any
  of them a single value or a list where one article answers to two words
  (Purelia's Zitrone is italienisch **and** spanisch), plus `quality`, which is
  the one read off the id rather than the name: Aromen's own slug says `-bio-`
  on seventy articles. All of it is a *reading* of what a shop already wrote —
  never a new word, never a translation — and `sources/open-questions.md`
  records them as readings.
- **A plant's `aka` is its other names, and only a search index.** It comes
  from `src/data/names.js`, keyed by the plant slug, and it is the one thing in
  `src/data/` no supplier published — see §1. It is folded into the search at
  the same weight as the shop's own name and shown on the oil's page under
  *Heißt auch*; nothing else in the app reads it.
- **An oil's `family` is its own supplier's scent group**, verbatim in
  `familyDe`, and `family` is the English label the app already uses for that
  group — a translation and nothing more. The suppliers do not agree with each
  other: Aromen has ten groups and a separate one for conifers, RBM has five
  and puts needles in Hölzer, and Purelia sorts nothing at all. None is
  corrected to match another, and the union is still exactly ten `family`
  values plus the empty one Purelia contributes.
- **An oil says who sells it.** `supplier` is `"Aromen"`, `"RBM"` or
  `"Purelia"`, empty on your own oils. It is a fact about where to buy a
  bottle, never about how it smells: nothing in the app scores, filters or
  ranks on it except the filter chip that exists to say "only the shelf I am
  standing at". All three ranges have a Zitrone and that is three bottles of
  one plant, not a duplicate to clean up.
- **An RBM entry may carry what its safety data sheet says.** `cas`, `colour`,
  `main` (the constituents at 1 % or more, with the band as printed) and `sdb`
  (which sheet, revised when). 100 of the 104 have one. It is supplier data
  like any other and follows §1: `sources/oils-rbm-sdb.md` has the method and
  the four entries with no sheet. `main` and `colour` are searchable at the
  weakest weight — "menthol" is a real question in front of a shelf, but half
  the catalogue contains a little limonene.
- **RBM's `goesWith` and `parts` stay out of the search index.** Both name
  other oils, so indexing either would return every oil whose Harmonie line
  mentions Zitrone, and every Mischung containing some, for a query of
  `zitrone`. Both are in `about`, which is scored last and weakest, so the
  question is still answerable — it just never outranks the oil itself.
  `tools/smoke.mjs` checks.
- **A Mischung is an entry, not an oil.** `blend: true`, `familyDe:
  "Mischungen"`, `family: "Blend"` — which is deliberately absent from
  `HARMONY`, like Gourmand and Earthy — `parts` holding their Zusammensetzung
  line **verbatim and unparsed**, and `notes: []`. Never derive a note from a
  Zusammensetzung: five of the 22 published lines end in "uvm.", and a note is
  about what the room smells first, which no ingredient list answers. The app
  already handles a note-less oil — poured last, counted as *ohne Note*, no
  family score — so nothing needs bending to make one fit.
- **Nothing scores a set.** There were four published ratios of Kopf to Herz to
  Basis, a balance bar and a card of remarks. Four pages recommended four
  different ratios, picking between them never once helped anybody write an
  Aufguss down, and the app is not a grader (§0, §9). What is left is the pour
  order, which note the set does not have yet, and whether the families are
  ones a source pairs. Do not put a ratio back.
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
- **The thing you pick is the plant; the bottle is a detail.** `catalog.js`
  groups the bottles by the `plant` slug they declare, wherever two or more
  share one. `all()` and `search()` walk entries; `bottles()` is still every
  flask. A Mischung and a custom oil never join a plant — a Mischung is an
  entry and not an oil, and it has no note, family or botanical name to agree
  about. A plant entry carries `isPlant: true` **and** the same `plant` slug
  its bottles carry: two keys, because a bottle's `plant` is a truthy string
  and one key doing both jobs made every bottle look like a plant.
  `tools/smoke.mjs` pins every one of those counts, because the grouping is a
  *reading* rather than something any shop publishes:
  `sources/open-questions.md` says so and says what would settle it.
- **A plant says only what its bottles agree on — and silence is not
  disagreement.** Agreement is counted over only the bottles that state a
  value. Nobody states one → the field is simply empty. They all agree → that
  is the plant's value. Two state different ones → the field comes back empty
  and a `split` records every bottle's answer, the silent ones included and
  marked as silent. Aromen calls Kampfer a Kopfnote and RBM calls it Herz, so
  `art:kampfer` has no note at all until a chip resolves it, and lands where a
  note-less oil already lands: poured last, counted as *ohne Note*. Never
  average, never take a majority, never let the longer range win, and never let
  a range that says nothing erase what another range does say. In a `split` row
  `value` is the id the code reasons with and `label` is the word that supplier
  actually printed — `label` is the one that goes on a screen.
- **Every contradiction and every gap is countable.** `inconsistencies()` in
  `catalog.js` returns them, and Mehr → Daten prüfen lists them and writes a
  block of text to paste wherever the answer will be looked for. It resolves
  nothing and writes nothing back: an answer comes off a supplier's page and
  lands in `src/data/` with its `sources/` line.
- **An Aufguss records `oilId` and an optional `bottleId`.** `oilId` is the
  plant; `bottleId` is empty until a chip narrows it. Entries written before
  the plant layer hold a bottle id in `oilId` and are migrated on the first
  edit, never on merely opening one — reading is not editing. `byId()` still
  resolves a bottle id to that bottle, which is what stops an oil vanishing out
  of an Aufguss that was written correctly at the time.
- **A custom oil's id starts `own:`, an RBM one `rbm:`, a Purelia one `pur:`.**
  A plant's starts `art:`. Those prefixes are the only thing separating the
  five kinds of entry anywhere in the app, and they are what makes regenerating
  any one data file safe.
- **Ids are the supplier's slugs.** They are also the last part of the product
  URL, which is what makes `check-sources.mjs` able to compare. Do not
  normalise them — `c11-bio-orangeol-suß` has a ß in it because the shop does.
- **A renamed product carries the id it used to have.** When a supplier renames
  an article its slug moves and so does its id, but every Aufguss already
  written down points at the old one. `wasId` holds the previous id and
  `byId()` falls back to it after an exact match fails. One oil has it so far —
  Aromen's `M4`, renamed from *Krauseminze / Grüne Minze* to *Grüne Minze* on
  10 September 2026. Never change a catalogue id without leaving a `wasId`
  behind: an oil that quietly vanishes out of a saved Aufguss is the same
  failure as losing the Aufguss.

## 5. Regenerating the data

The scripts that read the sources are not in the repository; the *method* is, in
`sources/`, in enough detail to redo it. In short:

- **Oils, Aromen** — scrape `/de/shop/category/atherische-ole-einzelole-26`
  (19 pages, `?ppg=` is capped at 20), take one product URL per article code,
  fetch the German and English page of each, read `Duftgruppe`, `Gut Für`, and
  the note out of the description text.
- **Oils, Purelia** — there is nothing to scrape. The sauna buys the *Purelia
  Professional* line, which the manufacturer does not list; the only published
  list of it is the dealer's portfolio page,
  `schrader24.eu/portfolio/aetherische-oele/`, which prints the range as two
  runs of names and nothing else — no scent group, no note, no botanical name,
  no description, no per-product page. Read the two lists, drop the `-öl`
  ending, split each name into the oil and its `variety`, and leave every other
  field empty. `sources/oils-purelia.md` has the list as the page prints it,
  every re-cut spelled out one line at a time, and the spelling slips on the
  page that were corrected — with the page's own spelling kept next to each.
- **Oils, RBM, the safety data sheets** — RBM publishes a
  Sicherheitsdatenblatt next to the shop for 100 of its 104 entries, and those
  PDFs say things the product pages do not: a CAS number, a colour, and an
  ABSCHNITT 3 list of what is in the bottle with percentage bands. Fetch the
  PDFs, cut each to ABSCHNITT 1, 3 and 9, and read the labelled lines off them
  — `.claude/agents/sdb-extract.md` is the agent that does it and is the
  specification for what to take and what to leave. `sources/oils-rbm-sdb.md`
  has the method, what was found and the four entries with no sheet.
- **Oils, RBM** — their shop renders in JavaScript and a fetched product URL
  returns a 404 shell, so there is nothing to scrape. Read `sitemap.xml` for
  the product ids, POST them 25 at a time to the storefront's own
  `catalog/products` endpoint, and read the six labelled lines out of the
  description each page renders — a Mischung has none of the six and carries
  only a Zusammensetzung line. Strip the tags **after** turning `<br>` and
  `</p>` into newlines: their fields are one per line, and flattening first
  runs two of them together. Article numbers come off the price-list PDF, which
  is the only place they exist, and so is Ringelblume. `sources/oils-rbm.md` has the endpoint,
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
`tools/smoke.mjs` pins the counts on purpose — 135 Aromen oils, 104 RBM entries
of which 23 are Mischungen, 47 Purelia entries of which 7 are, ten scent
families plus Mischungen plus the gap Purelia leaves, eight estimated Aromen
notes, one estimated RBM note, no Aromen-or-RBM single oil without a botanical
name and all 40 of Purelia's, one entry with no URL, 63 plants over 202 of the
286 bottles, and 25 corrected botanical names — so a regeneration that moves
any of them fails until the source file is brought along.

## 6. Testing

```bash
node tools/smoke.mjs
```

200 checks. It loads the whole app — `src/main.js` and everything under it —
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
- Reconcile the three suppliers' scent groups, botanical names or spellings
  with each other, or with what you believe to be correct. Each range says what
  its own shop says.
- Fill in a field a supplier leaves empty from what another supplier says about
  the same plant. Silence is not disagreement and it is not an invitation.
- Resolve anything on the Daten prüfen screen. It counts and reports; the
  answer comes off a supplier's page and lands in `src/data/` and `sources/`.
- Fold RBM's `goesWith` or `parts` into the search index.
- Give a Mischung a note, a botanical name or a scent family, however obvious
  its Zusammensetzung makes one look.
- Add a dependency, a build step, or a request to another origin.
- Add a Save button, or anything else that lets a written Aufguss be lost by
  locking the phone. The editor saves on every change and that is the point.
- Let a storage failure interrupt anything. `Store` degrades to unavailable and
  reports on the Mehr screen; it never throws mid-Aufguss.
- Add scores, streaks, badges or grading. The journal reports what happened.
- Put the ratios back, or anything else that asks you to configure a preference
  before an Aufguss can be written down (§0).
- Let a theme off an Aufgussplan restrict what can be saved. It may prefill; it
  may never refuse.
- Put anything but names in `src/data/names.js`, or a correction in
  `src/data/` without `latinFixed` and a row in `sources/corrections.md`.
- Call `skipWaiting()` in the worker's `install`, or make the fetch handler
  network-first. Both look like improvements and both break the guarantee that
  the page and the modules under it come from the same version.
- Read a theme's name as a hint about which oils belong in it.
- Fill in `HARMONY.Gourmand` or `HARMONY.Earthy` to make the table symmetric.
- Reach into `src/main.js` from another module.
