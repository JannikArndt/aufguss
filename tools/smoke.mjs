/* The whole app, in Node, against the stub DOM in tools/stub/.

   Run it after any change:  node tools/smoke.mjs

   Two kinds of check and both matter. The behavioural ones drive the app the
   way a finger does: open a new Aufguss, pick a theme, type three oil names,
   read what the screen says back. The structural ones hold the no-build-step
   arrangement together — that sw.js's VERSION matches src/release.js, that its
   SHELL lists exactly the files on disk, that no colour is written down
   anywhere but :root, and that every fact in src/data/ has the shape the app
   assumes.

   It is not a browser. Layout and real Safari are only checkable on a phone. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { install } from './stub/dom.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
const failures = [];

function ok(name, cond, detail) {
  if (cond) { passed++; return true; }
  failures.push(name + (detail ? ' — ' + detail : ''));
  return false;
}
function eq(name, got, want) {
  return ok(name, got === want, 'got ' + JSON.stringify(got) + ', wanted ' + JSON.stringify(want));
}
function read(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }

/* ── 1. The data ─────────────────────────────────────────────────────────── */
const { OILS } = await import('../src/data/oils.js');
const { OILS_RBM } = await import('../src/data/oils-rbm.js');
const { OILS_PURELIA } = await import('../src/data/oils-purelia.js');
const { THEMES, INTENSITIES } = await import('../src/data/themes.js');
const { NOTES, HARMONY, MIX_ORDER, DOSAGE, CLASSICS } = await import('../src/data/blending.js');

/* Three ranges, one catalogue. Counts are pinned per range on purpose: a
   regeneration that moves any of them has to bring its own sources/ file
   along. */
const ALL_OILS = OILS.concat(OILS_RBM).concat(OILS_PURELIA);
const HOST = {
  Aromen: 'https://www.aromen.be/',
  RBM: 'https://www.rbm-wellness.de/',
  Purelia: 'https://schrader24.eu/',
};

eq('oils: the Aromen range arrived', OILS.length, 135);
eq('oils: and the RBM range, singles and Mischungen', OILS_RBM.length, 104);
eq('oils: and Purelia\'s, singles and Ölmischungen', OILS_PURELIA.length, 47);
eq('oils: 23 of RBM\'s entries are Mischungen', OILS_RBM.filter((o) => o.blend).length, 23);
eq('oils: 7 of Purelia\'s are', OILS_PURELIA.filter((o) => o.blend).length, 7);
ok('oils: no Aromen entry claims to be a Mischung', !OILS.some((o) => o.blend));
{
  const ids = new Set(), noteIds = new Set(NOTES.map((n) => n.id));
  const fams = new Set(ALL_OILS.map((o) => o.family));
  let bad = [];
  for (const o of ALL_OILS) {
    if (ids.has(o.id)) bad.push('duplicate id ' + o.id);
    ids.add(o.id);
    if (!o.de) bad.push('no German name: ' + o.id);
    if (!o.supplier) bad.push('no supplier: ' + o.de);
    /* Two fields the app reads are allowed to be empty, and only where the
       shop publishes nothing: a Mischung has no note or scent family because
       nobody states one for it, and Purelia's Professional line states neither
       for anything at all. Both exceptions are pinned to exactly those
       entries below, so neither can quietly spread to a range that does
       publish. */
    const mayBeSilent = o.blend || o.supplier === 'Purelia';
    if (!mayBeSilent && !o.family) bad.push('no family: ' + o.de);
    if (!mayBeSilent && !o.familyDe) bad.push('no German family: ' + o.de);
    if (!mayBeSilent && !o.notes.length) bad.push('no note: ' + o.de);
    if (o.blend && o.notes.length) bad.push('a Mischung with a note: ' + o.de);
    if (o.supplier === 'Purelia' && !o.blend && (o.notes.length || o.family || o.latin || o.about)) {
      bad.push('Purelia publishes none of this: ' + o.de);
    }
    /* A supplier bottle declares which plant it is; a Mischung is an entry and
       not an oil, so it declares none. That declaration is what the catalogue
       groups on — a bottle without one silently stops grouping. */
    if (!o.blend && !o.plant) bad.push('no plant: ' + o.de);
    if (o.blend && o.plant) bad.push('a Mischung with a plant: ' + o.de);
    for (const n of o.notes) if (!noteIds.has(n)) bad.push('unknown note ' + n + ' on ' + o.de);
    if (o.url && !o.url.startsWith(HOST[o.supplier])) bad.push('odd url on ' + o.de);
  }
  ok('oils: every field the app reads is filled', !bad.length, bad.slice(0, 4).join('; '));
  /* Purelia sorts nothing into scent groups, so it contributes the empty
     string and nothing else — the ten real families plus Blend plus that gap,
     and Blend is deliberately absent from HARMONY. */
  ok('oils: ten scent families, and Mischungen is not one of them',
    fams.size === 12 && fams.has('Blend') && fams.has('') && !HARMONY.Blend, [...fams].join(','));
  ok('oils: a range\'s ids cannot collide with another range\'s',
    OILS_RBM.every((o) => o.id.startsWith('rbm:')) &&
    OILS_PURELIA.every((o) => o.id.startsWith('pur:')));
}
{
  /* Every oil whose note is not the supplier's own must say so. Eight of those
     are Aromen's (sources/oils.md) and one is RBM's Bergamottminze
     (sources/oils-rbm.md). If either number moves, the data was regenerated
     and the source file needs the same edit. Nothing is ever estimated for a
     Mischung: guessing a note off a Zusammensetzung is the thing this app does
     not do. */
  eq('oils: eight Aromen notes are estimated, and marked',
    OILS.filter((o) => o.noteEstimated).length, 8);
  eq('oils: one RBM note is estimated, and marked',
    OILS_RBM.filter((o) => o.noteEstimated).length, 1);
  ok('oils: and no Mischung has a guessed anything',
    !OILS_RBM.some((o) => o.blend && (o.noteEstimated || o.latin || o.character)));
  /* Aromen publishes no botanical names, so all of them got one from Wikidata.
     RBM publishes its own — and the one single oil it left blank, its
     Bergamottminze, turned out to be named on its own safety data sheet
     ("Mentha-Citrataöl"), so there is no gap left in either range. Purelia
     publishes none at all, for anything. */
  eq('oils: every Aromen and RBM single oil has a botanical name',
    OILS.concat(OILS_RBM).filter((o) => !o.blend && !o.latin).length, 0);
  eq('oils: and Purelia has no botanical name for any of its 40',
    OILS_PURELIA.filter((o) => !o.blend && !o.latin).length, 40);
  /* One entry has no page to link to — RBM's Ringelblume, which is on their
     price list and not in their shop (sources/open-questions.md). Everything
     else is checkable against a URL, and that is the point of pinning this. */
  eq('oils: exactly one entry has no URL to check it against',
    ALL_OILS.filter((o) => !o.url).length, 1);
  /* Purelia has no per-product page at all: one portfolio page lists the whole
     line, so all 47 point at the same link and that is the honest answer. */
  eq('oils: Purelia points all 47 at the one page there is',
    new Set(OILS_PURELIA.map((o) => o.url)).size, 1);

}
ok('oils: the Kaifubad range is searchable in Latin',
  OILS.some((o) => o.latin === 'Santalum austrocaledonicum'));
{
  /* RBM names other oils in its Harmonie line. That list is shown but must
     never reach the search index — see the comment on haystack(). */
  const src = read('src/core/catalog.js');
  ok('oils: what an RBM oil harmonises with is not searchable',
    !/goesWith/.test(src.split('function haystack')[1].split('}')[0]));
}

ok('themes: the Kaifubad plan is in there', THEMES.filter((t) => t.venue === 'Kaifubad').length === 6);
{
  const kaifu = THEMES.filter((t) => t.venue === 'Kaifubad');
  const wald = kaifu.find((t) => t.name === 'Waldfunkeln');
  eq('themes: Waldfunkeln is the strong one at 19:00', wald && wald.intensity + ' ' + wald.time, 'stark 19:00');
  const levels = new Set(INTENSITIES.map((i) => i.id));
  ok('themes: every intensity is one of the three on the plan',
    THEMES.every((t) => t.intensity === null || levels.has(t.intensity)));
  ok('themes: a theme names its own families only where the plan does',
    THEMES.filter((t) => t.families.length).length === 5);
}

{
  const fams = new Set(ALL_OILS.map((o) => o.family));
  const bad = [];
  for (const k of Object.keys(HARMONY)) {
    if (!fams.has(k)) bad.push('harmony key is not a family: ' + k);
    for (const v of HARMONY[k]) if (!fams.has(v)) bad.push('harmony value is not a family: ' + v);
  }
  ok('blending: the harmony table only names real families', !bad.length, bad.join('; '));
  ok('blending: Gourmand and Earthy are deliberately absent',
    !HARMONY.Gourmand && !HARMONY.Earthy);
  /* The four published ratios are gone on purpose: four pages recommended four
     different ones, picking between them helped nobody write an Aufguss down,
     and nothing in the app may ask you to. */
  ok('blending: no ratio survived anywhere',
    !/RATIOS|ratioById/.test(read('src/data/blending.js') + read('src/core/blend.js') +
      read('src/core/suggest.js') + read('src/ui/entry.js') + read('src/ui/more.js') +
      read('src/core/store.js')));
  eq('blending: base first, then heart, then top', MIX_ORDER.join('>'), 'base>heart>top');
  ok('blending: the dosage figures are a range', DOSAGE.dropsPerLitre.length === 2 && CLASSICS.length === 4);
}

/* ── 2. The pure logic ───────────────────────────────────────────────────── */
install(path.join(ROOT, 'index.html'));
const util = await import('../src/core/util.js');
const { Store } = await import('../src/core/store.js');
const cat = await import('../src/core/catalog.js');
const blend = await import('../src/core/blend.js');
const sug = await import('../src/core/suggest.js');

eq('util: folding survives an umlaut', util.fold('Süß-Öl'), 'suess oel');
eq('util: folding survives a hybrid sign', util.fold('Citrus ×bergamia'), 'citrus bergamia');
eq('util: a date is read in local time, not UTC', util.longDate('2026-09-08'), 'Dienstag, 8. September 2026');
eq('util: 15:52 is getting ready for 16:00', util.nearestHour(new Date(2026, 8, 8, 15, 52)), '16:00');
eq('util: 15:10 is still 15:00', util.nearestHour(new Date(2026, 8, 8, 15, 10)), '15:00');
eq('util: yesterday says so', util.agoText('2026-09-07', '2026-09-08'), 'gestern');

eq('search: the German name wins', cat.search('zitrone', { limit: 1 })[0].de, 'Zitrone');
eq('search: the botanical name finds it', cat.search('santalum', { limit: 1 })[0].de, 'Sandelholz');
eq('search: the English name finds it', cat.search('peppermint', { limit: 1 })[0].de, 'Pfefferminze');
eq('search: the article code finds it', cat.search('w8', { limit: 1 })[0].de, 'Sandelholz');
ok('search: a note name filters', cat.search('basisnote').length > 15);
/* Fewer than the bottles Aromen files under Nadelholz, and that is right: a
   plant whose shops disagree about the group has no group of its own to be
   found under, and says so on its own page instead. */
eq('search: a family name filters', cat.search('nadelholz').length, 13);
ok('search: every word has to hit', cat.search('zitrone kiefer').length === 0);
ok('search: nothing matches nonsense', cat.search('qqqzzz').length === 0);
ok('search: an empty query is the whole catalogue', cat.search('').length === cat.all().length);
{
  /* The range is still a search term, but it now answers with entries rather
     than bottles: a plant is on RBM's shelf if any of its bottles is. The
     same goes for the filter, which is what keeps "only what I can buy here"
     honest for a Zitrone both ranges sell. */
  const hits = cat.search('rbm');
  {
  /* A plant answers to every name it is known by, not only the one a shop
     printed. src/data/names.js is search-only and says so. */
  const first = (q) => (cat.search(q, { limit: 1 })[0] || {}).de;
  eq('names: an English name finds the German plant', first('spearmint'), 'Krauseminze');
  eq('names: so does a botanical synonym', first('mentha spicata'), 'Krauseminze');
  eq('names: and an old spelling', first('campher'), 'Kampfer');
  eq('names: cornmint is the third mint, not the first two', first('cornmint'), 'Minze');
  eq('names: and Tulsi finds the basil it belongs to', first('tulsi'), 'Heiliger Basilikum');
  /* Every entry is a list of strings and nothing else: no note, no family, no
     field the app would read as a fact about a scent. */
  const NAMES = (await import('../src/data/names.js')).PLANT_NAMES;
  ok('names: every entry is a plain list of names and nothing else',
    Object.values(NAMES).every((v) => Array.isArray(v) && v.every((x) => typeof x === 'string')));
  ok('names: and every key is a plant the catalogue actually has',
    Object.keys(NAMES).every((k) => !!cat.byId('art:' + k)),
    Object.keys(NAMES).filter((k) => !cat.byId('art:' + k)).join(', '));
}
ok('search: the range itself is a search term',
    hits.length > 80 && hits.every((o) => cat.suppliersOf(o).includes('RBM')));
  const filtered = cat.search('', { suppliers: ['RBM'] });
  ok('search: and a filter',
    filtered.length === hits.length &&
    filtered.every((o) => cat.suppliersOf(o).includes('RBM')));
}

/* ── The plant layer ──────────────────────────────────────────────────────
   The thing you pick is the plant; the bottle is a detail you may add. Every
   count here is pinned because the grouping is a *reading* of the suppliers'
   own names (sources/open-questions.md) — if one of these moves, the reading
   moved with it and the note in sources/ has to move too. */
{
  eq('plants: the catalogue is entries, not bottles', cat.all().length, 147);
  eq('plants: and every bottle is still reachable', cat.bottles().length, 286);
  const plants = cat.all().filter((o) => o.isPlant);
  eq('plants: sixty-three names gather more than one bottle', plants.length, 63);
  eq('plants: built out of this many bottles',
    plants.reduce((n, p) => n + p.bottles.length, 0), 202);
  ok('plants: no Mischung was ever folded into one',
    !plants.some((p) => p.bottles.some((b) => b.blend)));
  /* The grouping is declared in the data, not read off the name. Every bottle
     in a plant carries that plant's own slug, and a plant's id is that slug —
     which is what makes a group checkable one line at a time. */
  ok('plants: every bottle declares the plant it was grouped into',
    plants.every((p) => p.bottles.every((b) => 'art:' + b.plant === p.id)));

  /* Where the two shops disagree the plant says nothing and records both
     sides. This is the whole point of the layer: no averaging, no majority,
     no quiet winner. */
  const split = (k) => plants.filter((p) => p.split && p.split[k]).length;
  eq('plants: twenty-six disagree about the note', split('note'), 26);
  eq('plants: twenty-one about the scent family', split('family'), 21);
  eq('plants: twenty-one about the botanical name', split('latin'), 21);

  /* Twenty-five botanical names this repository supplies rather than the shop:
     RBM filed its Chinese cedarwood under Boswellia carteri, which is
     frankincense, and its American peppermint under a mountain mint. Each is
     marked `latinFixed` and listed in sources/corrections.md with the reason,
     so a correction can never be mistaken for something a shop published. */
  eq('data: the corrected botanical names are marked as corrected',
    ALL_OILS.filter((o) => o.latinFixed).length, 25);
  eq('data: RBM\'s Chinese cedarwood is no longer frankincense',
    cat.byId('rbm:Cedernholz-chinesisch').latin, 'Cupressus funebris');

  /* RBM publishes a Sicherheitsdatenblatt next to the shop for 100 of its 104
     entries, and those sheets say things the product page does not: the CAS
     number that actually identifies an oil, the colour, and what is in the
     bottle at one per cent or more. Four entries have no sheet. */
  eq('data: a hundred RBM entries carry their safety sheet',
    OILS_RBM.filter((o) => o.sdb).length, 100);
  ok('data: and a Mischung finally says what is in it',
    (cat.byId('rbm:Advent-Mix').main || []).some((x) => /Zimtaldehyd/.test(x)));
  ok('data: the sheet named the species the product page left blank',
    cat.byId('rbm:Bergamottminze').latin === 'Mentha citrata');
  eq('search: and what is in the bottle is searchable',
    cat.search('zimtaldehyd').length > 0, true);

  /* The three mints are three species, and the botanical name is what splits
     them — not the word on the label. Each is one plant and they never merge. */
  const mints = ['art:pfefferminze', 'art:krauseminze', 'art:minze'].map((id) => cat.byId(id));
  eq('plants: the three mints each agree on one species',
    mints.map((m) => m.latin).join(' | '),
    'Mentha × piperita | Mentha spicata | Mentha arvensis');
  ok('plants: a disagreement leaves the field empty rather than guessed',
    plants.every((p) => (!p.split || !p.split.note || !p.notes.length) &&
                        (!p.split || !p.split.family || !p.family) &&
                        (!p.split || !p.split.latin || !p.latin)));
  const kampfer = cat.byId('art:kampfer');
  eq('plants: Kampfer has no note of its own', kampfer.notes.length, 0);
  eq('plants: because Aromen says one thing, RBM another, Purelia nothing',
    kampfer.split.note.map((r) => r.supplier + ':' + r.value).sort().join(' '),
    'Aromen:top Purelia:null RBM:heart');

  /* Silence is not disagreement. Purelia publishes no note and no scent group
     for anything, and joining a plant must not be able to wipe out what a shop
     that does publish said about it. */
  const zitrone = cat.byId('art:zitrone');
  ok('plants: a shop that says nothing does not erase what the others said',
    zitrone.bottles.some((b) => b.supplier === 'Purelia' && !b.notes.length) &&
    zitrone.notes.length === 1 && !!zitrone.familyDe, JSON.stringify(zitrone.notes));
  ok('plants: and a real contradiction still empties the field',
    !zitrone.latin && !!zitrone.split.latin);

  /* One article sold under two words keeps both. Purelia's Zitrone is
     "italienisch/spanisch", one bottle from either country. */
  eq('plants: an article that answers to two words offers both',
    zitrone.variants.filter((v) => v.kind === 'origin').map((v) => v.label).join('/'),
    'italienisch/spanisch');
  /* Bio is read off Aromen's own slug, which says -bio- on seventy articles —
     the shop saying it, not the app deciding it. */
  ok('plants: and Bio is a variety like any other',
    zitrone.variants.some((v) => v.kind === 'quality' && v.label === 'Bio'));

  /* A variety is declared, never read out of the leftover words of a name —
     otherwise Aromen's own misspelling ("Steranis") would sit on a chip next
     to a plant called Sternanis. */
  eq('plants: a shop\'s misspelling is not offered as a variety',
    cat.byId('art:sternanis').variants.map((v) => v.label).join(', '), 'CO2, Bio');

  /* An Aufguss written before any of this still points at the bottle it
     recorded. Losing that is the same failure as losing the Aufguss. */
  const bottle = cat.byId('rbm:Minze-chinesisch');
  eq('plants: an old entry still finds its exact bottle', bottle.de, 'Minze chinesisch');
  eq('plants: and knows which plant it belongs to', cat.plantOf(bottle).id, 'art:minze');
  eq('plants: a plant offers its varieties',
    cat.byId('art:minze').variants.map((v) => v.label).sort().join(', '),
    'Bio, Tokyo, chinesisch, indisch, japanisch');
  /* Five bottles from three shops under one name, which is the whole point. */
  const mandarine = cat.byId('art:mandarine');
  eq('plants: Mandarine is one row over eight bottles', mandarine.bottles.length, 8);
  eq('plants: and the colours come before the countries',
    mandarine.variants.map((v) => v.label).join(' '), 'grün orange rot gelb italienisch Bio');
}
eq('search: how an oil smells finds it', cat.search('rauchig', { limit: 1 })[0].de, 'Birkenteer');
/* A renamed product keeps a way back to the id it had, or every Aufguss
   written before the rename quietly loses that oil. */
eq('catalogue: the one renamed product still answers to its old id',
  cat.byId('m4-bio-krauseminze-grune-minze').de, 'Grüne Minze');
eq('catalogue: and the exact id still wins', cat.byId('m4-bio-grune-minze').code, 'M4');
{
  /* What a Mischung is made of is readable and searchable, but only through
     `about`, which is scored last — so the oil itself always comes first. */
  const hits = cat.search('patchouli');
  eq('search: an oil outranks the Mischungen that contain it', hits[0].de, 'Patchouli');
  ok('search: and those Mischungen are still in the list',
    hits.some((o) => o.de === '1001 Nacht') && hits.some((o) => o.de === 'Orientalischer Traum'));
}

{
  /* nameParts re-cuts a name the supplier already wrote — it must never say a
     word the oil's own `de` (or, for a supplier chip, its own `supplier`)
     does not already say. */
  const bad = [];
  for (const o of ALL_OILS) {
    const np = cat.nameParts(o);
    if (!o.de.includes(np.base)) bad.push('base not in de: ' + np.base + ' / ' + o.de);
    for (const w of np.words) if (!o.de.includes(w)) bad.push('word not in de: ' + w + ' / ' + o.de);
  }
  ok('catalogue: nameParts invents no word — base and words come straight off the name',
    !bad.length, bad.slice(0, 5).join('; '));
  eq('catalogue: "Minze chinesisch" splits into a shared base and its variant',
    JSON.stringify(cat.nameParts({ de: 'Minze chinesisch' })), JSON.stringify({ base: 'Minze', key: 'minze', words: ['chinesisch'] }));
  eq('catalogue: "Grüne Minze" keeps its two-word base, so it does not collide with Grüne Mandarine',
    cat.nameParts({ de: 'Grüne Minze' }).base, 'Grüne Minze');
}

{
  const set = ['Zitrone', 'Belgian lavender', 'Sandelholz'].map((n) => cat.search(n, { limit: 1 })[0]);
  eq('blend: poured base first', blend.pourOrder(set).map((o) => o.de).join(' '),
    'Sandelholz Lavendel Zitrone');
  const b = blend.balance(set);
  ok('blend: one of each note', b.have.top === 1 && b.have.heart === 1 && b.have.base === 1);
  eq('blend: nothing is missing from a set that has all three',
    blend.missingNote(set), null);
}
{
  const twoTops = ['Zitrone', 'Grapefruit'].map((n) => cat.search(n, { limit: 1 })[0]);
  /* Heaviest first, so two Kopfnoten are offered a Basis before a Herz. */
  eq('blend: with two top notes the base is what is missing',
    blend.missingNote(twoTops), 'base');
}
{
  const lemon = cat.search('Zitrone', { limit: 1 })[0];
  const empty = { pair: {}, used: {}, last: {}, entries: 0, together: () => 0 };
  const picks = sug.suggest([lemon], { history: empty, limit: 5 });
  ok('suggest: something is suggested for one oil', picks.length === 5);
  ok('suggest: it fills the note that is missing',
    picks.every((p) => p.oil.notes[0] === 'base'));
  ok('suggest: every suggestion says why', picks.every((p) => p.reasons.length));
  ok('suggest: it never suggests what is already chosen',
    !picks.some((p) => p.oil.id === lemon.id));
}

/* ── 3. The app, driven ──────────────────────────────────────────────────── */
const main = await import('../src/main.js');
const $ = (id) => document.getElementById(id);
const text = (id) => $(id).textContent;
const visible = (id) => !$(id).hidden;

ok('app: it opens on the journal', visible('scJournal'));
ok('app: the journal starts empty and says so', !$('journalEmpty').hidden);
eq('app: four tabs', $('tabsJournal').childNodes.length, 4);

/* Type into a field the way a finger does: set the value, then say so. */
function type(node, value) { node.value = value; node.dispatch('input'); }
function change(node, value) { node.value = value; node.dispatch('change'); }
function tapTab(barId, label) {
  for (const b of $(barId).childNodes) if (b.textContent.includes(label)) { b.click(); return true; }
  throw new Error('no tab ' + label);
}
function find(sel, root) { return (root || document.body).querySelector(sel); }
function findAll(sel, root) { return (root || document.body).querySelectorAll(sel); }

tapTab('tabsJournal', 'Neu');
ok('new: the editor opened', visible('scEntry'));

const themeInput = findAll('input', $('entryBody')).find((n) => (n.placeholder || '').startsWith('Thema'));
ok('new: there is a theme field', !!themeInput);
type(themeInput, 'Waldf');
{
  const rows = findAll('.ac-item', $('entryBody'));
  ok('new: the theme autocompletes off the plan', rows.length >= 1);
  ok('new: and it is the Kaifubad one', rows[0].textContent.includes('Waldfunkeln'));
  rows[0].click();
}
eq('new: picking a theme names the screen', text('entryTitle'), 'Waldfunkeln');
{
  const chips = findAll('.chip', $('entryBody')).filter((c) => c.className.includes('on'));
  ok('new: and takes the intensity off the plan too, as three Kellen',
    chips.some((c) => c.title === 'Starker Aufguss' && c.className.includes('stark') &&
      c.querySelectorAll('svg').length === 3));
}

/* Three oils, by three different kinds of name. */
function addOilByTyping(query) {
  const inputs = findAll('input', $('entryBody')).filter((n) => n.type === 'search');
  const box = inputs[inputs.length - 1];
  type(box, query);
  const rows = findAll('.ac-item', $('entryBody'));
  if (!rows.length) throw new Error('nothing offered for ' + query);
  rows[0].click();
}
addOilByTyping('zitrone');
addOilByTyping('lavandula angusti');
addOilByTyping('sandalwood');
{
  const rows = findAll('.setrow', $('entryBody'));
  eq('new: three oils in the set', rows.length, 3);
  const names = findAll('.setrow .name', $('entryBody')).map((n) => n.textContent);
  eq('new: shown in pouring order, base first', names.join(' | '),
    'Sandelholz | Lavendel | Zitrone');
  ok('new: each row says its note, as an icon with a title',
    findAll('.setrow .step', $('entryBody'))
      .every((s) => /Kopfnote|Herznote|Basisnote/.test(s.title)));
  ok('new: no millilitre field cluttering the row',
    findAll('.setrow input', $('entryBody')).length === 0);
}
/* The Mischung card is gone on purpose: the owner reads the notes off the
   rows, and a second opinion about the set was one card too many on a screen
   that is trying to fit three Kugeln. What replaced it is nothing. */
ok('new: no mixture card, and nothing telling anyone to fill a Kelle',
  !$('setCard') && !/in die Kelle/.test($('entryBody').textContent));
ok('new: suggestions start gated behind a button',
  !$('entryBody').textContent.includes('Passt dazu') &&
  $('entryBody').textContent.includes('Passende Öle vorschlagen'));
findAll('button', $('entryBody')).find((b) => b.textContent === 'Passende Öle vorschlagen').click();
ok('new: and tapping it shows something to go with it',
  $('entryBody').textContent.includes('Passt dazu'));

{
  const ta = find('textarea', $('entryBody'));
  type(ta, 'Ging gut, Gäste zufrieden.');
}
$('entryFoot').childNodes[0].click();
ok('done: back on the journal', visible('scJournal'));
eq('done: one Aufguss written down', findAll('#journalList .item').length, 1);
ok('done: the row names the theme and the oils',
  findAll('#journalList .item')[0].textContent.includes('Waldfunkeln') &&
  findAll('#journalList .item')[0].textContent.includes('Sandelholz'));

/* It saved as it went, which is the whole promise of having no Save button. */
{
  const saved = Store.entries();
  eq('store: one entry', saved.length, 1);
  eq('store: with its three oils', saved[0].oils.length, 3);
  eq('store: and the note', saved[0].notes, 'Ging gut, Gäste zufrieden.');
  eq('store: and the intensity off the plan', saved[0].intensity, 'stark');
}

/* Reopening it shows what was written, and "beim letzten Mal" now has
   something to say. */
{
  findAll('#journalList .item')[0].click();
  ok('open: the editor came back', visible('scEntry'));
  eq('open: with its three oils', findAll('.setrow', $('entryBody')).length, 3);
  ok('open: and Delete is now offered', !$('entryDelete').hidden);
  main.go('#/');
}
{
  main.go('#/neu');
  const t = findAll('input', $('entryBody')).find((n) => (n.placeholder || '').startsWith('Thema'));
  type(t, 'Waldf');
  findAll('.ac-item', $('entryBody'))[0].click();
  ok('last time: it remembers the previous Waldfunkeln, oils grouped by round',
    $('lastTime').textContent.includes('Sandelholz'));
  const btn = findAll('#lastTime button')[0];
  ok('last time: and it is tappable to take those oils', !!btn);
  btn.click();
  eq('last time: taking them fills the set', findAll('.setrow', $('entryBody')).length, 3);
  main.go('#/');
}
{
  /* No previous entry under a theme means no card at all — not one saying so. */
  main.go('#/neu');
  const t = findAll('input', $('entryBody')).find((n) => (n.placeholder || '').startsWith('Thema'));
  type(t, 'Auffrischende');
  findAll('.ac-item', $('entryBody'))[0].click();
  ok('last time: nothing shown when there is no last time', $('lastTime').childNodes.length === 0);
  main.go('#/');
}

/* Picking an oil is two steps now, and the second one is optional. Step one
   is the plant — "Minze" is enough. Step two, if you care, is a variety and a
   supplier as chips under the oil in its Kugel; tapping an active chip puts it
   back to just the plant. Nobody is ever made to choose a bottle.

   The chips are one unlabelled row: varieties first, then a thin rule, then
   the ranges. No headings over them, because which oil it is matters and where
   it was bought mostly does not. */
function chipRows() {
  const box = findAll('.setchips', $('entryBody'))[0];
  return box ? [...box.childNodes].filter((n) => (n.className || '').includes('chiprow')) : [];
}
const varietyChips = () => { const r = chipRows(); return r[0] ? [...r[0].childNodes] : []; };
const supplierChips = () => { const r = chipRows(); return r[1] ? [...r[1].childNodes] : []; };
{
  main.go('#/neu');
  const box = findAll('input', $('entryBody')).filter((n) => n.type === 'search').pop();
  type(box, 'minze');
  const offered = findAll('.ac-item', $('entryBody')).map((r) => r.textContent);
  ok('pick: the mints are offered once, as the plant',
    offered.some((t) => t.startsWith('Minze')) &&
    !offered.some((t) => t.includes('Minze chinesisch')));
  ok('pick: and the row says what the varieties are, under the name',
    findAll('.ac-item .s', $('entryBody'))[0].textContent.includes('Indisch | Japanisch | Chinesisch'));
  findAll('.ac-item', $('entryBody'))[0].click();

  eq('pick: one oil is in the Kugel', findAll('.setrow', $('entryBody')).length, 1);

  const variants = varietyChips();
  eq('pick: its varieties sit under it, not in its name', variants.length, 5);
  ok('pick: with no heading over them, and the ranges beside them',
    !$('entryBody').textContent.includes('Variante') && supplierChips().length === 2);
  ok('pick: and no bottle was chosen for you',
    findAll('.setrow', $('entryBody'))[0].textContent.includes('Minze'));

  const chinese = varietyChips().find((c) => c.textContent === 'Chinesisch');
  chinese.click();
  {
    const rows = findAll('.setrow', $('entryBody'));
    ok('pick: tapping a variety narrows it to that bottle',
      rows[0].textContent.includes('Chinesisch'));
    const on = varietyChips().filter((c) => c.className.includes('on'));
    eq('pick: and only that chip is active', on.length, 1);
  }
  varietyChips().find((c) => c.textContent === 'Chinesisch').click();
  {
    const on = varietyChips().filter((c) => c.className.includes('on'));
    eq('pick: tapping it again goes back to just the plant', on.length, 0);
  }
  main.go('#/');
}

/* An Aufguss written before any of this recorded a bottle id. Opening it must
   still show that exact bottle — losing the oil out of a saved Aufguss is the
   same failure as losing the Aufguss, and it is the whole reason bottleId
   exists rather than the plant simply swallowing the id. */
{
  const old = {
    id: 'smoke-old-entry', date: '2026-09-01', time: '15:00',
    theme: 'Altes Thema', themeKind: '', intensity: '', sauna: '',
    oils: [{ oilId: 'rbm:Minze-chinesisch', ml: 3, round: 1 }],
    rounds: 3, ratio: 'classic', notes: '', rating: 0,
    written: '2026-09-01T15:00:00.000Z',
  };
  Store.putEntry(old);
  main.go('#/e/smoke-old-entry');
  ok('old entry: it still names the exact bottle it recorded',
    findAll('.setrow', $('entryBody'))[0].textContent.includes('Chinesisch'));
  ok('old entry: and the variety chip reads as chosen',
    varietyChips().some((c) => c.textContent === 'Chinesisch' && c.className.includes('on')));
  /* Opening one does not rewrite it — reading is not editing. The new shape is
     written the first time something actually changes, and the bottle is kept
     beside the plant rather than replaced by it. */
  eq('old entry: reading it leaves the file alone',
    Store.entries().find((e) => e.id === 'smoke-old-entry').oils[0].oilId,
    'rbm:Minze-chinesisch');
  type(find('textarea', $('entryBody')), 'Nachtrag.');
  const now = Store.entries().find((e) => e.id === 'smoke-old-entry').oils[0];
  eq('old entry: an edit files it under its plant', now.oilId, 'art:minze');
  eq('old entry: and keeps the exact bottle alongside', now.bottleId, 'rbm:Minze-chinesisch');
  Store.removeEntry('smoke-old-entry');
  main.go('#/');
}

/* The catalogue. */
main.go('#/oele');
eq('oils: the whole catalogue is listed', findAll('#oilList .item').length, cat.all().length);
type($('oilSearch'), 'basisnote');
ok('oils: a note filters the list', findAll('#oilList .item').length > 15 &&
  findAll('#oilList .item').length < ALL_OILS.length);
type($('oilSearch'), '');
{
  const rows = findAll('#oilList .item');
  ok('oils: the ones you used are counted', rows.some((r) => r.textContent.includes('2×')) ||
    rows.some((r) => r.textContent.includes('1×')));
  ok('oils: both ranges are in the one list',
    rows.some((r) => r.textContent.includes('Aromen')) &&
    rows.some((r) => r.textContent.includes('RBM')));
  /* By name rather than by position: the list is sorted German-style and
     "1001 Nacht" now sorts above every letter. */
  rows.find((r) => r.textContent.includes('Aleppo-Kiefer')).click();
}
ok('oil: one oil opened', visible('scOil'));
ok('oil: it shows the botanical name', text('oilBody').includes('Pinus halepensis'));
ok('oil: and how much of it', text('oilBody').includes('ml'));
ok('oil: and how it smells', text('oilBody').includes('Kiefernduft'));
eq('oil: not a favourite yet', text('oilFav'), '☆');
$('oilFav').click();
eq('oil: now it is', text('oilFav'), '★');
ok('oil: and the store agrees', Store.favourites().length === 1);
{
  const ta = find('textarea', $('oilBody'));
  type(ta, 'Sparsam, sonst kratzt es.');
  const again = Store.personalFor(Store.favourites()[0]);
  eq('oil: your own note is kept', again.note, 'Sparsam, sonst kratzt es.');
}
$('oilBack').click();
ok('oil: back goes where you came from', visible('scOils'));

/* A Mischung: no note, no botanical name, and the app saying so out loud
   rather than filling either in. */
{
  const mix = cat.search('1001 nacht', { limit: 1 })[0];
  main.go('#/oel/' + encodeURIComponent(mix.id));
  const body = text('oilBody');
  ok('mix: it lists what is in it', body.includes('Patchouli') && body.includes('Vetiver'));
  ok('mix: and says why it has no note', /keine Duftnote an/.test(body) &&
    /geraten wird hier nichts/.test(body));
  ok('mix: it is poured last and counts as no note',
    blend.leadNote(mix) === null &&
    blend.balance([mix]).unknown === 1);
  const set = [cat.search('Zitrone', { limit: 1 })[0], mix];
  eq('mix: so the pour order puts it after the oils that have one',
    blend.pourOrder(set).map((o) => o.de).join(' | '), 'Zitrone | 1001 Nacht');
  main.go('#/oele');
}

/* Your own oil. */
{
  const before = cat.all().length;
  const oil = cat.customOil('Kaifu-Hausmischung');
  Store.putCustomOil(oil); cat.invalidate();
  eq('own oil: it joins the catalogue', cat.all().length, before + 1);
  eq('own oil: and is findable', cat.search('kaifu-haus', { limit: 1 })[0].de, 'Kaifu-Hausmischung');
  ok('own oil: it is marked as yours', cat.byId(oil.id).custom === true);
  ok('own oil: its id cannot collide with a catalogue one', oil.id.startsWith('own:'));
  main.go('#/oel/' + encodeURIComponent(oil.id));
  ok('own oil: and it can be edited', text('oilBody').includes('Dein eigenes Öl'));
  Store.removeCustomOil(oil.id); cat.invalidate();
  eq('own oil: and deleted again', cat.all().length, before);
}

/* Mehr. */
main.go('#/mehr');
ok('more: it counts what you have', text('moreBody').includes('Aufgüsse'));
ok('more: it says the journal is only on this phone', text('moreBody').includes('nur auf diesem Gerät'));
ok('more: it points at the sources', text('moreBody').includes('Aromen') &&
  text('moreBody').includes('RBM') && text('moreBody').includes('Purelia'));

/* Daten prüfen: every place the three shops contradict each other and every
   field one of them leaves empty, counted in one screen. It reports and
   resolves nothing — the answer comes off a supplier's page, not from here. */
{
  const issues = cat.inconsistencies();
  ok('check: it finds the Kampfer note the shops disagree about',
    issues.some((x) => x.kind === 'note' && x.de === 'Kampfer' &&
      x.rows.some((r) => r.supplier === 'Aromen' && r.label === 'Kopfnote') &&
      x.rows.some((r) => r.supplier === 'RBM' && r.label === 'Herznote')));
  ok('check: and the fields a shop simply never published',
    issues.some((x) => x.kind === 'missing' && x.field === 'note' &&
      x.rows[0].supplier === 'Purelia'));
  ok('check: a Mischung is not listed for the note nobody publishes for it',
    !issues.some((x) => x.kind === 'missing' && x.field === 'note' &&
      cat.byId(x.rows[0].id).blend));

  main.go('#/pruefen');
  ok('check: the screen opens off Mehr', visible('scCheck'));
  ok('check: it names a disagreement in German', text('checkBody').includes('uneinheitlich'));
  const ta = find('textarea', $('checkBody'));
  ok('check: and hands over a text that asks rather than answers',
    !!ta && /nachsehen/.test(ta.value) && /Kampfer/.test(ta.value));
  ok('check: which says out loud that a gap stays a gap',
    /nichts ergänzen/.test(ta.value));
  main.go('#/mehr');
}

/* Out and back in. */
{
  const dump = Store.exportAll();
  eq('backup: the format is named', dump.format, 'aufguss-journal/1');
  eq('backup: the entries are in it', dump.entries.length, Store.entries().length);
  const before = Store.entries().length;
  const res = Store.importAll(dump);
  eq('backup: importing the same file twice changes nothing', Store.entries().length, before);
  eq('backup: and says so', res.added, 0);
  let threw = '';
  try { Store.importAll({ format: 'something-else' }); } catch (e) { threw = e.message; }
  ok('backup: a foreign file is refused, in German', /keine Aufguss/.test(threw), threw);
}

/* A phone with storage switched off must not break the app. */
{
  localStorage.blocked = true;
  Store.available = true;
  const list = Store.entries();
  ok('no storage: reading gives nothing rather than throwing', Array.isArray(list) && !list.length);
  ok('no storage: and the app knows', Store.available === false && !!Store.lastError);
  localStorage.blocked = false;
  Store.available = true;
}

/* ── 4. Structure: what holds the no-build-step arrangement together ─────── */
{
  const sw = read('sw.js');
  const rel = read('src/release.js');
  const v = /const VERSION = '([^']+)'/.exec(sw)[1];
  const r = /v: '([^']+)'/.exec(rel)[1];
  eq('shell: sw.js and release.js agree on the version', v, r);

  const listed = [...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]).filter((p) => p.includes('.'));
  const onDisk = [];
  for (const dir of ['src', 'src/core', 'src/ui', 'src/data']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (f.endsWith('.js')) onDisk.push(dir + '/' + f);
    }
  }
  const missing = onDisk.filter((f) => !listed.includes(f));
  ok('shell: sw.js precaches every module on disk', !missing.length, missing.join(', '));
  const ghosts = listed.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  ok('shell: and nothing it lists is gone', !ghosts.length, ghosts.join(', '));
  ok('shell: the worker only ever fetches this origin',
    sw.includes('url.origin !== self.location.origin'));
  {
    /* skipWaiting() itself is not banned — a person can ask for the update on
       the Mehr screen, which posts a message the worker answers to — only
       calling it from install, which would apply a new version to everyone
       mid-Aufguss without being asked. */
    const stripped = sw.replace(/\/\*[\s\S]*?\*\//g, '');
    const installIdx = stripped.indexOf("addEventListener('install'");
    const nextIdx = stripped.indexOf("addEventListener(", installIdx + 1);
    const installBody = stripped.slice(installIdx, nextIdx < 0 ? undefined : nextIdx);
    ok('shell: and never skips waiting on install', !/skipWaiting\(\)/.test(installBody));
    ok('shell: skipping waiting takes an explicit message, not an install',
      /addEventListener\('message'/.test(stripped) && /skipWaiting\(\)/.test(stripped));
  }

  /* The worker is registered by a relative path — a leading slash would put
     its scope at the domain root, where a project page cannot register it —
     and whether the context is secure enough is the browser's call, not a
     hostname check of our own. That check was wrong for 127.0.0.1. */
  const m = read('src/main.js');
  ok('shell: the worker is registered relatively', /register\('\.\/sw\.js'/.test(m));
  ok('shell: and the browser decides what is secure', /isSecureContext/.test(m) &&
    !/hostname !== 'localhost'/.test(m));
}
{
  /* Every id the app reaches for has to exist in the markup, or it throws in
     Safari exactly as it does here. */
  const html = read('index.html');
  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  const asked = new Set();
  for (const dir of ['src', 'src/core', 'src/ui']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (!f.endsWith('.js')) continue;
      const src = read(dir + '/' + f);
      for (const m of src.matchAll(/\$\('([^']+)'\)/g)) asked.add(m[1]);
      /* A card the app builds and then replaces in place carries an id it
         assigns itself; those are as real as the ones in the markup. */
      for (const m of src.matchAll(/\.id = '([^']+)'/g)) ids.add(m[1]);
    }
  }
  const gone = [...asked].filter((id) => !ids.has(id));
  ok('markup: every id the code reaches for exists', !gone.length, gone.join(', '));
}
{
  /* Colours are defined once, on :root. A hex in a rule renders correctly in
     one theme and wrong in the other. */
  const css = read('app.css');
  const rootBlocks = [...css.matchAll(/:root\s*\{[^}]*\}/g)].map((m) => m[0]).join('\n');
  const outside = css.split('').length ? css.replace(/:root\s*\{[^}]*\}/g, '') : css;
  const strays = [...outside.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
  ok('style: colours live on :root and nowhere else', !strays.length, strays.join(' '));
  ok('style: both themes are defined', /prefers-color-scheme: dark/.test(css) &&
    /--ground:/.test(rootBlocks));
  ok('style: the safe-area insets are used', /env\(safe-area-inset/.test(css));
  ok('style: reduced motion is respected', /prefers-reduced-motion/.test(css));
  ok('style: no transition shorthand on a broad selector',
    !/^\s*\*\s*\{[^}]*\btransition:/m.test(css));
}
{
  /* Nothing under src/ may import main.js — that is what keeps the core
     loadable in Node, which is what this file relies on. */
  const bad = [];
  for (const dir of ['src/core', 'src/ui', 'src/data']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (!f.endsWith('.js')) continue;
      if (/from '[^']*main\.js'/.test(read(dir + '/' + f))) bad.push(dir + '/' + f);
    }
  }
  ok('modules: nothing imports main.js', !bad.length, bad.join(', '));

  /* An import nobody uses is a module boundary that has quietly moved, and
     the reader has to prove it is dead before ignoring it. */
  const stale = [];
  for (const dir of ['src', 'src/core', 'src/ui']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (!f.endsWith('.js')) continue;
      const src = read(dir + '/' + f);
      const body = src.replace(/^import[^;]*;/gm, '');
      for (const m of src.matchAll(/import \{([^}]*)\} from/g)) {
        for (const raw of m[1].split(',')) {
          const name = raw.trim();
          if (!name || name === '$') continue;      /* \b does not bound $ */
          if (!new RegExp('\\b' + name + '\\b').test(body)) stale.push(dir + '/' + f + ': ' + name);
        }
      }
    }
  }
  ok('modules: no import goes unused', !stale.length, stale.join(', '));
}
{
  /* The one promise this app makes about privacy. */
  const bad = [];
  for (const dir of ['src', 'src/core', 'src/ui', 'src/data']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (!f.endsWith('.js')) continue;
      const src = read(dir + '/' + f).replace(/\/\*[\s\S]*?\*\//g, '');
      if (/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(src)) bad.push(dir + '/' + f);
    }
  }
  ok('privacy: nothing in src/ calls the network', !bad.length, bad.join(', '));
  ok('privacy: index.html loads nothing from another origin',
    !/(src|href)="https?:\/\//.test(read('index.html')));
}
{
  /* scrollIntoView scrolls every scrollable ancestor, the document included —
     which is exactly the bug that used to drag .top up under the notch. Only
     a field's own .body pane may ever move; util.js's bodyPane() plus a
     scrollTop nudge is what replaced it. */
  const bad = [];
  for (const dir of ['src', 'src/core', 'src/ui', 'src/data']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (!f.endsWith('.js')) continue;
      if (/scrollIntoView/.test(read(dir + '/' + f))) bad.push(dir + '/' + f);
    }
  }
  ok('scroll: nothing under src/ calls scrollIntoView', !bad.length, bad.join(', '));
}
{
  /* Every source file the docs point at is really there. */
  const missing = ['README.md', 'CHANGELOG.md', 'sources/README.md', 'sources/oils.md', 'sources/blending.md',
    'sources/aufgussplan.md', 'sources/botanical-names.md', '.nojekyll', 'manifest.webmanifest',
    'icon.svg', 'icon.png'].filter((f) => !fs.existsSync(path.join(ROOT, f)));
  ok('repo: the files the app and the docs promise exist', !missing.length, missing.join(', '));
}

/* ── done ────────────────────────────────────────────────────────────────── */
if (failures.length) {
  console.error('\n' + failures.length + ' failed:');
  for (const f of failures) console.error('  ✗ ' + f);
  console.error('\n' + passed + ' passed, ' + failures.length + ' failed.');
  process.exit(1);
}
console.log(passed + ' checks passed.');
