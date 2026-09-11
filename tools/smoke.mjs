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
const { THEMES, INTENSITIES } = await import('../src/data/themes.js');
const { NOTES, RATIOS, HARMONY, MIX_ORDER, DOSAGE, CLASSICS } = await import('../src/data/blending.js');

/* Two ranges, one catalogue. Counts are pinned per range on purpose: a
   regeneration that moves either has to bring its own sources/ file along. */
const ALL_OILS = OILS.concat(OILS_RBM);
const HOST = { Aromen: 'https://www.aromen.be/', RBM: 'https://www.rbm-wellness.de/' };

eq('oils: the Aromen range arrived', OILS.length, 135);
eq('oils: and the RBM range, singles and Mischungen', OILS_RBM.length, 104);
eq('oils: 23 of RBM\'s entries are Mischungen', OILS_RBM.filter((o) => o.blend).length, 23);
ok('oils: no Aromen entry claims to be a Mischung', !OILS.some((o) => o.blend));
{
  const ids = new Set(), noteIds = new Set(NOTES.map((n) => n.id));
  const fams = new Set(ALL_OILS.map((o) => o.family));
  let bad = [];
  for (const o of ALL_OILS) {
    if (ids.has(o.id)) bad.push('duplicate id ' + o.id);
    ids.add(o.id);
    if (!o.de) bad.push('no German name: ' + o.id);
    if (!o.family) bad.push('no family: ' + o.de);
    if (!o.familyDe) bad.push('no German family: ' + o.de);
    if (!o.supplier) bad.push('no supplier: ' + o.de);
    /* A Mischung has no note and no botanical name because nobody publishes
       one for it. Anything that is not a Mischung must have both. */
    if (!o.blend && !o.notes.length) bad.push('no note: ' + o.de);
    if (o.blend && o.notes.length) bad.push('a Mischung with a note: ' + o.de);
    for (const n of o.notes) if (!noteIds.has(n)) bad.push('unknown note ' + n + ' on ' + o.de);
    if (o.url && !o.url.startsWith(HOST[o.supplier])) bad.push('odd url on ' + o.de);
  }
  ok('oils: every field the app reads is filled', !bad.length, bad.slice(0, 4).join('; '));
  ok('oils: ten scent families, and Mischungen is not one of them',
    fams.size === 11 && fams.has('Blend') && !HARMONY.Blend, [...fams].join(','));
  ok('oils: an RBM id cannot collide with an Aromen one',
    OILS_RBM.every((o) => o.id.startsWith('rbm:')));
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
  /* Aromen publishes no botanical names, so all 133 got one from Wikidata.
     RBM publishes its own, and for exactly one single oil it does not. */
  eq('oils: exactly one single oil has no botanical name',
    ALL_OILS.filter((o) => !o.blend && !o.latin).length, 1);
  /* One entry has no page to link to — RBM's Ringelblume, which is on their
     price list and not in their shop (sources/open-questions.md). Everything
     else is checkable against a URL, and that is the point of pinning this. */
  eq('oils: exactly one entry has no URL to check it against',
    ALL_OILS.filter((o) => !o.url).length, 1);

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
  ok('blending: four ratios, each adding up', RATIOS.length === 4 &&
    RATIOS.every((r) => r.parts.top + r.parts.heart + r.parts.base > 0));
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
ok('search: a family name filters', cat.search('nadelholz').length >= 14);
ok('search: every word has to hit', cat.search('zitrone kiefer').length === 0);
ok('search: nothing matches nonsense', cat.search('qqqzzz').length === 0);
ok('search: an empty query is the whole catalogue', cat.search('').length === ALL_OILS.length);
eq('search: the range itself is a search term', cat.search('rbm').length, OILS_RBM.length);
eq('search: and a filter', cat.search('', { suppliers: ['RBM'] }).length, OILS_RBM.length);
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
    'Sandelholz Belgian lavender Zitrone');
  const b = blend.balance(set, '30-50-20');
  ok('blend: one of each note', b.have.top === 1 && b.have.heart === 1 && b.have.base === 1);
  const d = blend.drops('30-50-20', 20);
  eq('blend: twenty drops stay twenty', d.top + d.heart + d.base, 20);
  eq('blend: 30-50-20 of twenty', [d.top, d.heart, d.base].join('-'), '6-10-4');
  const r = blend.remarks(set, '30-50-20', 6);
  ok('blend: it says all three notes are there', r.some((x) => /alle da/.test(x.text)));
  ok('blend: it never scolds', !r.some((x) => /falsch|fehler|nicht erlaubt/i.test(x.text)));
}
{
  const twoTops = ['Zitrone', 'Grapefruit'].map((n) => cat.search(n, { limit: 1 })[0]);
  eq('blend: with two top notes the heart is what is missing',
    blend.missingNote(twoTops, '30-50-20'), 'heart');
  const r = blend.remarks(twoTops, '30-50-20', 4);
  ok('blend: and it says so without telling anyone off',
    r.some((x) => /Kopfnote/.test(x.text)) && !r.some((x) => /solltest/.test(x.text)));
}
{
  const lemon = cat.search('Zitrone', { limit: 1 })[0];
  const empty = { pair: {}, used: {}, last: {}, entries: 0, together: () => 0 };
  const picks = sug.suggest([lemon], '30-50-20', { history: empty, limit: 5 });
  ok('suggest: something is suggested for one oil', picks.length === 5);
  ok('suggest: it fills the note that is missing',
    picks.every((p) => p.oil.notes[0] === 'heart'));
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
    'Sandelholz | Belgian lavender | Zitrone');
  ok('new: each row says its note, as an icon with a title',
    findAll('.setrow .step', $('entryBody'))
      .every((s) => /Kopfnote|Herznote|Basisnote/.test(s.title)));
  ok('new: no millilitre field cluttering the row',
    findAll('.setrow input', $('entryBody')).length === 0);
}
ok('new: the mixture is described', !!$('setCard'));
ok('new: and it says the notes are all there', $('setCard').textContent.includes('alle da'));
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

/* Oil search: when the hits offer a choice, two rows of chips sit above the
   list — never a requirement, since the unfiltered list is what a fresh
   search always shows first. */
function chipLabels(head, label) {
  for (const wrap of head.childNodes) {
    if (wrap.childNodes[0] && wrap.childNodes[0].textContent === label) {
      return wrap.childNodes[1].childNodes.map((c) => c.textContent);
    }
  }
  return null;
}
{
  main.go('#/neu');
  const box = findAll('input', $('entryBody')).filter((n) => n.type === 'search').pop();
  type(box, 'minze');
  const head = find('.ac-head', $('entryBody'));
  ok('search: "minze" offers a row of variants', !!head);
  const variants = head && chipLabels(head, 'Variante');
  ok('search: and its chips are chinesisch, indisch and japanisch', variants &&
    variants.slice().sort().join(', ') === 'chinesisch, indisch, japanisch');

  const before = findAll('.ac-item', $('entryBody')).length;
  const chip = findAll('.ac-head .chip', $('entryBody')).find((c) => c.textContent === 'chinesisch');
  ok('search: the variant chip is there to tap', !!chip);
  chip.click();
  const narrowed = findAll('.ac-item', $('entryBody')).length;
  ok('search: tapping it narrows the list', narrowed > 0 && narrowed < before);
  chip.click();
  eq('search: tapping it again restores the list', findAll('.ac-item', $('entryBody')).length, before);

  type(box, 'zitrone');
  const head2 = find('.ac-head', $('entryBody'));
  const suppliers = head2 && chipLabels(head2, 'Anbieter');
  ok('search: "zitrone" offers an Anbieter row with both suppliers', suppliers &&
    suppliers.includes('Aromen') && suppliers.includes('RBM'));
  main.go('#/');
}

/* The catalogue. */
main.go('#/oele');
ok('oils: the whole catalogue is listed', text('oilList').includes(String(ALL_OILS.length)));
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
    blend.balance([mix], '30-50-20').unknown === 1);
  const set = [cat.search('Zitrone', { limit: 1 })[0], mix];
  eq('mix: so the pour order puts it after the oils that have one',
    blend.pourOrder(set).map((o) => o.de).join(' | '), 'Zitrone | 1001 Nacht');
  const r = blend.remarks(set, '30-50-20', 4);
  ok('mix: and the set says so in words, without scolding',
    r.some((x) => /keine angegebene Note/.test(x.text)) &&
    !r.some((x) => /Alles null|undefined/.test(x.text)));
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
  text('moreBody').includes('RBM'));

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
