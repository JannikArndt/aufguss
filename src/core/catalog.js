/* 2. The catalogue, and finding something in it.

   One list of oils: Aromen's range, RBM's, Purelia's, and whatever you have
   added yourself. Which supplier an oil came from is a fact about where to buy
   it, not about how it smells, so it is carried on the oil and shown where it
   helps — and nowhere else does anything in the app branch on it. All three
   ranges have a Zitrone in them; that is not a duplicate to clean up, it is
   three bottles of one plant.

   Custom oils carry a `custom: true` flag and an id that starts `own:` — that
   prefix is the only thing that distinguishes them anywhere in the app, and it
   is what makes an update of src/data/oils.js safe.

   The brief asks to search by name in three languages, by scent family, and by
   note. All three go through one index and one query, because in practice you
   type "zitr" and mean any of them. */

import { OILS } from '../data/oils.js';
import { OILS_RBM } from '../data/oils-rbm.js';
import { OILS_PURELIA } from '../data/oils-purelia.js';
import { PLANT_NAMES } from '../data/names.js';
import { NOTES } from '../data/blending.js';
import { Store } from './store.js';
import { fold } from './util.js';

var noteDe = {};
for (var i = 0; i < NOTES.length; i++) noteDe[NOTES[i].id] = NOTES[i].de;
export function noteName(id) { return noteDe[id] || id; }

/* Re-cuts a name the supplier already wrote, so two bottles of the same plant
   ("Minze chinesisch", "Minze indisch") can be found next to each other in
   the oil search. It is bookkeeping on the supplier's own string — never a
   claim that two oils are the same, and it never invents a word: base and
   words are exactly what `de` already said, just split at the spaces.

   The base is the first word, except for four first words that are only part
   of the name: "grüne", "grüner", "frischer" and "ylang" (folded — fold()
   turns "ü" into "ue", so the keys below read "gruene"/"gruener", not
   "grune"/"gruner"). Without that exception "Grüne Mandarine" and "Grüne
   Minze" would land in one nonsense "Grüne" group, and "Ylang ylang III"
   would split mid-name. Checked against the current 239: these four are the
   only collisions. */
var TWO_WORD_BASE = { gruene: true, gruener: true, frischer: true, ylang: true };
export function nameParts(oil) {
  var words = (oil.de || '').replace(/,/g, '').split(/\s+/).filter(Boolean);
  var n = TWO_WORD_BASE[fold(words[0] || '')] ? 2 : 1;
  var base = words.slice(0, n).join(' ');
  return { base: base, key: fold(base), words: words.slice(n) };
}

/* Both ranges, in one list, sorted the way a German-speaking finger scrolls.
   Sorting here rather than in either data file means neither has to know the
   other exists. */
export var CATALOGUE = OILS.concat(OILS_RBM).concat(OILS_PURELIA).sort(function (a, b) {
  return a.de.localeCompare(b.de, 'de');
});

/* The variety of one bottle: the country, the ripeness, the way it was got
   out of the plant, the cultivar. Every value is the supplier's own word, cut
   out of the name they already printed — "chinesisch" stays "chinesisch" and
   never becomes China, because translating it would be this app writing a
   fact nobody published.

   `kind` says which of the six it is, so a screen can say "aus Italien" in
   one place and "CO2" in another without either being guessed at. `quality` is
   the one that is read off the id rather than the name: Aromen's own slug says
   `-bio-` on seventy of its articles, which is the shop saying it, not this
   app deciding it. A bottle
   whose supplier gave no variety at all comes back empty, and the leftover
   words of its name stand in for it further down.

   A value may be a list, because a shop sometimes sells one article under two
   answers: Purelia's Zitrone is "italienisch/spanisch", one bottle from either
   country, and flattening that to one of them would throw away half of what
   the page says. Each value becomes its own chip. */
var VARIETY_KEYS = ['colour', 'origin', 'method', 'kind', 'part', 'quality'];
export function varietyOf(oil) {
  var out = [], v = (oil && oil.variety) || null;
  if (!v) return out;
  for (var i = 0; i < VARIETY_KEYS.length; i++) {
    var k = VARIETY_KEYS[i], val = v[k];
    if (!val) continue;
    var many = Array.isArray(val) ? val : [val];
    for (var j = 0; j < many.length; j++) {
      if (!many[j]) continue;
      out.push({ id: fold(String(many[j])), label: String(many[j]), kind: k });
    }
  }
  return out;
}

/* The bottle's name with its declared variety taken back out of it — which is
   the plant's own name, in that supplier's spelling. "Mandarine rot
   italienisch" minus rot and italienisch is "Mandarine"; so is "Grüne
   Mandarine" minus Grüne. Nothing is added and nothing is translated: this
   only removes words the data already says are a variety, and a bottle with
   no variety comes back exactly as it was printed.

   A word counts as the variety when it folds to the variety's own value, or to
   that value plus up to two letters — German inflects its adjectives, so one
   shop's "grün" is another's "Grüne", and both are the same colour. Two
   letters and no more, so "Dillkraut" never loses itself to a `part` of
   "Kraut": that is a compound, not an inflection. */
function isVarietyWord(folded, id) {
  if (folded === id) return true;
  return folded.indexOf(id) === 0 && folded.length - id.length <= 2;
}
function strippedName(oil) {
  var vs = varietyOf(oil), name = oil.de || '';
  if (!vs.length) return name;
  var words = name.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
  var keep = [];
  for (var w = 0; w < words.length; w++) {
    var folded = fold(words[w]), drop = false;
    for (var i = 0; i < vs.length; i++) if (isVarietyWord(folded, vs[i].id)) drop = true;
    if (!drop) keep.push(words[w]);
  }
  return keep.length ? keep.join(' ') : name;
}

/* Plants: the owner picks "Mandarine", not which of the five bottles that say
   Mandarine on them. What gathers them is the `plant` slug declared on each
   bottle in src/data/ — not a rule applied to the name. A declared key is the
   one thing that survives "Grüne Mandarine", "Mandarine, gelb" and "Mandarine
   rot italienisch" being the same plant under three shops' spellings, which no
   amount of splitting at the spaces ever managed; and because it sits in the
   data next to the name it re-reads, it can be checked a line at a time. It
   is a *reading* of what the suppliers wrote, and sources/open-questions.md
   says so.

   A Mischung carries no `plant` and never joins one — a Mischung is an entry,
   not an oil (§4), which is why RBM's Mischung Jasmin Mix sits beside the
   Jasmin plant rather than inside it. A custom oil is already exactly what
   someone meant to write down, so it never joins one either. A slug only one
   bottle uses is not a plant; it is that oil.

   The plant id is `art:` plus the slug — a fourth id prefix alongside `own:`,
   `rbm:` and `pur:`, and like them the only thing that ever tells the app what
   kind of entry it is looking at. */
function buildPlants() {
  var groups = {}, order = [], i, k;
  for (i = 0; i < CATALOGUE.length; i++) {
    var o = CATALOGUE[i];
    if (o.blend || !o.plant) continue;        /* a Mischung is an entry, not an oil — §4 */
    var key = o.plant;
    if (!groups[key]) { groups[key] = []; order.push(key); }
    groups[key].push(o);
  }
  var plants = [], byBottle = {};
  for (k = 0; k < order.length; k++) {
    var list = groups[order[k]];
    if (list.length < 2) continue;            /* one bottle is not a plant, it is the oil */
    var plant = buildPlant(order[k], list);
    plants.push(plant);
    for (i = 0; i < list.length; i++) byBottle[list[i].id] = plant;
  }
  return { plants: plants, byBottle: byBottle };
}

/* Agreement, counted only over the bottles that actually say something.

   Silence is not disagreement. Purelia publishes no scent group, no note and
   no botanical name for its Professional line, so a Purelia bottle joining a
   plant must not be able to wipe out what RBM does publish about it — it has
   no opinion to be at odds with. Three answers come back:

     agreed   every bottle that states a value states the same one
     none     nobody states one at all
     split    two bottles state different ones, and that is the fact

   Only a split empties the field and records both sides. Nothing is averaged,
   nothing is voted on, and the longer range never wins (§4). */
function consensus(list, valueOf) {
  var stated = [], i;
  for (i = 0; i < list.length; i++) {
    var v = valueOf(list[i]);
    if (v === null || v === undefined || v === '') continue;
    stated.push(v);
  }
  if (!stated.length) return { state: 'none', value: null };
  for (i = 1; i < stated.length; i++) {
    if (stated[i] !== stated[0]) return { state: 'split', value: null };
  }
  return { state: 'agreed', value: stated[0] };
}

/* One row per bottle, for a field its bottles do not agree on. `value` is the
   id the code reasons with and `label` is the word that supplier actually
   printed — `label` is the one that goes on a screen (§4). A bottle that says
   nothing gets a row too, saying so: "Purelia sagt nichts dazu" is a different
   sentence from "Purelia sagt Herznote", and both are worth reading. */
function splitRows(list, valueOf, labelOf) {
  return list.map(function (o) {
    var v = valueOf(o);
    return {
      supplier: o.supplier, de: o.de, id: o.id,
      value: (v === '' || v === undefined) ? null : v,
      label: v ? labelOf(v, o) : '',
    };
  });
}

function buildPlant(key, list) {
  var i;

  /* The name the plant goes by: the bottles' own names with their declared
     variety taken back out, and the spelling most of them carry when those
     still differ — decided by count, then by length, so the label cannot
     change its wording just because the catalogue was re-sorted.

     A bottle may override that with `plantDe`, and it is there for the handful
     of plants where counting picks something silly: Aromen writes "Steranis"
     twice and RBM and Purelia write "Sternanis" once each, so the count is
     tied and the shorter word — the typo — would win. The override is a name
     for the plant, never a correction of what the shop printed: `de` on that
     bottle still says Steranis, because that is what is on the label. */
  var declared = null;
  for (i = 0; i < list.length; i++) if (list[i].plantDe) { declared = list[i].plantDe; break; }
  var stripped = list.map(strippedName), deCount = {};
  for (i = 0; i < stripped.length; i++) deCount[stripped[i]] = (deCount[stripped[i]] || 0) + 1;
  var de = stripped[0];
  for (i = 0; i < stripped.length; i++) {
    var n = deCount[stripped[i]], best = deCount[de];
    if (n > best || (n === best && stripped[i].length < de.length)) de = stripped[i];
  }
  if (declared) de = declared;

  var suppliers = [], seenSup = {};
  for (i = 0; i < list.length; i++) {
    var s = list[i].supplier;
    if (!s || seenSup[s]) continue;
    seenSup[s] = true; suppliers.push(s);
  }

  /* What the chips under a chosen oil offer: only what the bottles declare.
     Reading the leftover words of a name would put a shop's own typo on a chip
     — Aromen writes "Steranis", and next to a plant called Sternanis that word
     is not a variety, it is a misspelling. A bottle with no `variety` is a
     bottle its shop sells in one version, and it offers no chip at all.

     Deduped by folded value, first spelling seen wins, anything under two
     characters dropped; ordered by what kind of variety it is, so the colours
     sit together and the countries sit together rather than in whatever order
     the shelf happened to be walked. */
  var variants = [], seenVar = {};
  for (var vk = 0; vk < VARIETY_KEYS.length; vk++) {
    for (i = 0; i < list.length; i++) {
      var vs = varietyOf(list[i]);
      for (var v = 0; v < vs.length; v++) {
        if (vs[v].kind !== VARIETY_KEYS[vk]) continue;
        if (vs[v].id.length < 2 || seenVar[vs[v].id]) continue;
        seenVar[vs[v].id] = true;
        variants.push({ id: vs[v].id, label: vs[v].label, kind: vs[v].kind });
      }
    }
  }

  /* An oil can lead with two notes ("top-to-heart"); only the first is what it
     is counted as anywhere in the app — leadNote() in blend.js decides that.
     blend.js imports catalog.js, not the other way round (§3), so importing it
     here would invert the dependency graph; notes[0] is exactly what
     leadNote() reads, so it is read directly instead. */
  function leadOf(o) { return (o.notes && o.notes.length) ? o.notes[0] : null; }
  var note = consensus(list, leadOf);
  var estimated = false;
  if (note.state === 'agreed') {
    for (i = 0; i < list.length; i++) if (list[i].noteEstimated) estimated = true;
  }

  var family = consensus(list, function (o) { return o.family; });
  var familyDe = '';
  if (family.state === 'agreed') {
    /* The two shops write the same group differently — Aromen's Holzig is
       RBM's Hölzer — so the German label is the one more bottles carry. */
    var famCount = {};
    for (i = 0; i < list.length; i++) {
      var fd = list[i].familyDe;
      if (!fd) continue;
      famCount[fd] = (famCount[fd] || 0) + 1;
      if (famCount[fd] > (famCount[familyDe] || 0)) familyDe = fd;
    }
  }
  var latin = consensus(list, function (o) { return o.latin; });

  var split = {};
  if (note.state === 'split') split.note = splitRows(list, leadOf, function (v) { return noteName(v); });
  if (family.state === 'split') split.family = splitRows(list, function (o) { return o.family; },
    function (v, o) { return o.familyDe || v; });
  if (latin.state === 'split') split.latin = splitRows(list, function (o) { return o.latin; },
    function (v) { return v; });

  var plant = {
    id: 'art:' + key,
    de: de,
    /* `isPlant` marks the entry; `plant` carries the same slug its bottles
       carry, so plantOf(x).plant answers "which plant is this" for a bottle
       and for a plant alike. Two separate keys because a bottle's `plant` is a
       string and truthy: one key doing both jobs made every bottle look like a
       plant. */
    isPlant: true,
    plant: key,
    bottles: list,
    custom: false,
    code: '',
    url: null,
    supplier: '',
    suppliers: suppliers,
    variants: variants,
    /* The other names this plant answers to — a search index and never a claim
       (src/data/names.js says where they come from and why they are held to a
       lower bar than anything about a scent). Empty for a plant nobody has
       written a second name for yet. */
    aka: PLANT_NAMES[key] || [],
    /* Agreeing that there is no note is still no note. A range that ships
       without one — Purelia's whole Professional line does — would otherwise
       give the plant a notes array holding nothing, which every reader would
       count as a note it does not have. */
    notes: note.value ? [note.value] : [],
    noteEstimated: estimated,
    family: family.value || '',
    familyDe: family.value ? familyDe : '',
    latin: latin.value || '',
  };
  if (Object.keys(split).length) plant.split = split;
  return plant;
}

var PLANT_LAYER = buildPlants();
var BOTTLE_TO_PLANT = PLANT_LAYER.byBottle;

/* The entries all() walks and the lists show: every CATALOGUE bottle that did
   not join a plant — an ungrouped single oil or a Mischung, unchanged — plus
   the plants, sorted the same way CATALOGUE is so a plant sits where its name
   would put a bottle. Built once: neither CATALOGUE nor the grouping
   depends on the custom oils, so there is nothing here for invalidate() to
   reach. */
var BASE_ENTRIES = (function () {
  var out = [];
  for (var i = 0; i < CATALOGUE.length; i++) {
    if (!BOTTLE_TO_PLANT[CATALOGUE[i].id]) out.push(CATALOGUE[i]);
  }
  return out.concat(PLANT_LAYER.plants).sort(function (a, b) {
    return a.de.localeCompare(b.de, 'de');
  });
})();

/* The suppliers, taken off the oils so this list cannot drift from the data.
   Ordered by how many oils each has, the same way families() is. */
export function suppliers() {
  var seen = {}, out = [];
  for (var i = 0; i < CATALOGUE.length; i++) {
    var s = CATALOGUE[i].supplier;
    if (!s) continue;
    if (!seen[s]) { seen[s] = { id: s, n: 0 }; out.push(seen[s]); }
    seen[s].n++;
  }
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

/* The families, with their German label, taken off the oils themselves so the
   list cannot drift from the data. Ordered by how many oils are in each.

   The two suppliers write the same group differently — Aromen's Holzig is
   RBM's Hölzer — so the label is the one more oils carry rather than the one
   that happens to sort first. Otherwise the chip would change its wording
   whenever the catalogue is re-sorted, which is a fact about nothing. */
export function families() {
  var seen = {}, out = [];
  for (var i = 0; i < CATALOGUE.length; i++) {
    var o = CATALOGUE[i];
    if (!o.family) continue;
    if (!seen[o.family]) { seen[o.family] = { id: o.family, de: o.familyDe, n: 0, labels: {} }; out.push(seen[o.family]); }
    var f = seen[o.family];
    f.n++;
    f.labels[o.familyDe] = (f.labels[o.familyDe] || 0) + 1;
    if (f.labels[o.familyDe] > (f.labels[f.de] || 0)) f.de = o.familyDe;
  }
  out.sort(function (a, b) { return b.n - a.n; });
  return out;
}

export function customOil(name, extra) {
  var o = extra || {};
  return {
    id: 'own:' + fold(name).replace(/ /g, '-') + '-' + Math.random().toString(36).slice(2, 6),
    code: '', de: name, en: o.en || '', latin: o.latin || '',
    family: o.family || '', familyDe: o.familyDe || '',
    notes: o.notes || [], noteEstimated: false,
    good: [], goodDe: [], supplier: '', character: [], goesWith: [],
    about: o.about || '', url: null, custom: true,
  };
}

/* A custom oil, normalised the same way wherever it is read: `custom: true`
   so nothing has to check the id prefix twice, and a `familyDe` filled in
   from `family` for a custom oil that came in through an old backup written
   before this fallback existed. Idempotent, so all() and bottles() can each
   call it without the two arrangements drifting apart. */
function normalizedCustoms() {
  return Store.customOils().map(function (o) {
    o.custom = true;
    if (!o.familyDe && o.family) o.familyDe = o.family;
    return o;
  });
}

var cache = null, cacheStamp = '';

/* Rebuilt whenever the custom oils change, which is rarely; the stamp is the
   cheapest honest way to notice. The plant layer itself never needs rebuilding
   here — BASE_ENTRIES is built once above, because custom oils never join a
   plant. */
export function all() {
  var custom = Store.customOils();
  var stamp = String(custom.length) + ':' + custom.map(function (o) { return o.id; }).join(',');
  if (cache && cacheStamp === stamp) return cache;
  cacheStamp = stamp;
  cache = BASE_ENTRIES.concat(normalizedCustoms());
  for (var i = 0; i < cache.length; i++) cache[i]._hay = haystack(cache[i]);
  return cache;
}
export function invalidate() { cache = null; }

/* Every bottle all three ranges sell (plant-shaped when walked through all(),
   but each bottle is still here) plus the custom oils — what the oil page reads to
   show one concrete bottle, and what tools/smoke.mjs walks to check every
   field a bottle must have regardless of whether it also sits inside a
   plant. */
export function bottles() {
  return CATALOGUE.concat(normalizedCustoms());
}

/* An id is the supplier's slug, so when a supplier renames a product the id
   moves with it — and every Aufguss already written down points at the old
   one. `wasId` carries the name it used to have, and an entry from before the
   rename still finds its oil. Without it the oil would quietly vanish out of
   an Aufguss that was written correctly at the time, which is the one thing
   this app must never do. The exact id always wins; the old name is only ever
   a fallback.

   A bottle that has joined a plant no longer sits in all() by itself — only
   its plant does — but every Aufguss already written down still names the
   bottle, not the plant, so byId() also checks bottles() before it falls back
   to wasId. Returning the bottle itself here rather than its plant is the
   point: an old entry must go on naming the exact oil it was poured with. */
export function byId(id) {
  var list = all(), flat = bottles(), i;
  for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  for (i = 0; i < flat.length; i++) if (flat[i].id === id) return flat[i];
  for (i = 0; i < list.length; i++) if (list[i].wasId === id) return list[i];
  for (i = 0; i < flat.length; i++) if (flat[i].wasId === id) return flat[i];
  return null;
}

/* The plant an oil or a bottle id belongs to — or the entry itself when it
   was never grouped, so callers never need to branch on `.isPlant` before
   asking. Checked directly against the bottle→plant map first, and again
   after resolving through byId(), so a bottle passed by its old `wasId`
   still finds the plant it now lives in rather than the bare bottle. */
export function plantOf(oilOrId) {
  var id = (oilOrId && typeof oilOrId === 'object') ? oilOrId.id : oilOrId;
  if (BOTTLE_TO_PLANT[id]) return BOTTLE_TO_PLANT[id];
  var entry = byId(id);
  if (entry && BOTTLE_TO_PLANT[entry.id]) return BOTTLE_TO_PLANT[entry.id];
  return entry;
}

function uniqueList(arr) {
  var out = [], seen = {};
  for (var i = 0; i < arr.length; i++) {
    var v = arr[i];
    if (!v || seen[v]) continue;
    seen[v] = true; out.push(v);
  }
  return out;
}

/* The union of what an entry's bottles say, falling back to the entry's own
   single value when it was never grouped — so the Öle screen's family,
   supplier and note filters can match a plant under every value its bottles
   actually carry, rather than only the one value a disagreement happened to
   leave empty. */
export function familiesOf(entry) {
  if (!entry) return [];
  if (entry.isPlant) {
    var out = [];
    for (var i = 0; i < entry.bottles.length; i++) out.push(entry.bottles[i].family);
    return uniqueList(out);
  }
  return entry.family ? [entry.family] : [];
}
export function suppliersOf(entry) {
  if (!entry) return [];
  if (entry.isPlant) {
    var out = [];
    for (var i = 0; i < entry.bottles.length; i++) out.push(entry.bottles[i].supplier);
    return uniqueList(out);
  }
  return entry.supplier ? [entry.supplier] : [];
}
export function notesOf(entry) {
  if (!entry) return [];
  if (entry.isPlant) {
    var out = [], seen = {};
    for (var i = 0; i < entry.bottles.length; i++) {
      var ns = entry.bottles[i].notes || [];
      for (var j = 0; j < ns.length; j++) { if (!seen[ns[j]]) { seen[ns[j]] = true; out.push(ns[j]); } }
    }
    return out;
  }
  return entry.notes || [];
}

/* Everything the data is at odds with itself about, or silent on — what the
   Daten prüfen screen lists and turns into a prompt.

   It resolves nothing. Three shops describe the same plant in their own words
   and sometimes those words disagree: Aromen calls Kampfer a Kopfnote and RBM
   calls it a Herznote, and that disagreement is the fact (§4). What this does
   is make every one of them countable and readable in one place, so the answer
   can be gone and looked for at the source rather than decided here.

   `kind` is 'note', 'family' or 'latin' for a disagreement, and 'missing' for
   a field a supplier simply never published. A missing field is not a fault —
   Purelia publishes no note for anything in its Professional line — it is
   listed so that nobody later fills it in from memory. */
export function inconsistencies() {
  var out = [], i, j;
  var plants = PLANT_LAYER.plants;
  for (i = 0; i < plants.length; i++) {
    var p = plants[i];
    if (!p.split) continue;
    if (p.split.note) out.push(issue('note', p, p.split.note, 'Duftnote'));
    if (p.split.family) out.push(issue('family', p, p.split.family, 'Duftgruppe'));
    if (p.split.latin) out.push(issue('latin', p, p.split.latin, 'botanischer Name'));
  }
  var wanted = [
    { field: 'family', de: 'Duftgruppe', has: function (o) { return !!o.family; } },
    { field: 'note', de: 'Duftnote', has: function (o) { return !!(o.notes && o.notes.length); } },
    { field: 'latin', de: 'botanischer Name', has: function (o) { return !!o.latin; } },
    { field: 'url', de: 'Produktseite', has: function (o) { return !!o.url; } },
  ];
  for (i = 0; i < CATALOGUE.length; i++) {
    var o = CATALOGUE[i];
    for (j = 0; j < wanted.length; j++) {
      var w = wanted[j];
      /* A Mischung has no note, no botanical name and no scent family on
         purpose, and nobody publishes one — listing all of them every time
         would bury the rows that can actually be answered. */
      if (o.blend && w.field !== 'url') continue;
      if (w.has(o)) continue;
      out.push({
        kind: 'missing', field: w.field,
        plantId: o.plant ? 'art:' + o.plant : o.id,
        de: o.de,
        rows: [{ supplier: o.supplier, de: o.de, id: o.id, value: null, label: '' }],
        text: o.supplier + ' gibt für „' + o.de + '“ keine ' + w.de + ' an.',
      });
    }
  }
  return out;
}
function issue(kind, plant, rows, de) {
  var said = [], i;
  for (i = 0; i < rows.length; i++) {
    said.push(rows[i].supplier + ' sagt ' + (rows[i].label || 'nichts dazu'));
  }
  return {
    kind: kind, field: kind, plantId: plant.id, de: plant.de, rows: rows,
    text: 'Bei „' + plant.de + '“ ist die ' + de + ' uneinheitlich: ' + said.join(', ') + '.',
  };
}

/* Everything one oil can be found by, folded once and kept on the oil.
   Fields are kept separate so a hit on the name can outrank a hit on the
   description — which matters, because the descriptions mention half the
   catalogue by name.

   `aka` rides along with the German name at the same weight, because that is
   what it is: another spelling of the word you would type. It is a search aid
   and never a fact about the oil, so nothing shows it anywhere.

   RBM's `goesWith` is the one field on an oil that is deliberately not in
   here. It is a list of other oils' names, so indexing it would put every oil
   whose Harmonie line says "Zitrone" into the results for zitrone — the exact
   noise the separate fields above exist to keep out.

   A plant's haystack is the union of its bottles' — each bottle's own
   haystack already leaves goesWith and parts out, so the union does too
   without anything extra to remember here. */
function haystack(o) {
  if (o.isPlant) return plantHaystack(o);
  return {
    de: fold(o.de) + (o.aka && o.aka.length ? ' ' + fold(o.aka.join(' ')) : ''),
    en: fold(o.en),
    latin: fold(o.latin),
    fam: fold((o.family || '') + ' ' + (o.familyDe || '')),
    note: fold((o.notes || []).map(noteName).join(' ') + ' ' + (o.notes || []).join(' ')),
    good: fold((o.goodDe || []).join(' ') + ' ' + (o.good || []).join(' ')),
    /* What is in the bottle is searchable — "menthol" is a real question in
       front of a shelf — but at the character weight, under the name and the
       family, because half the catalogue contains a little limonene. */
    char: fold((o.character || []).join(' ') + ' ' + (o.main || []).join(' ') + ' ' + (o.colour || '')),
    code: fold(o.code) + (o.cas ? ' ' + fold(o.cas) : ''),
    supplier: fold(o.supplier),
    about: fold(o.about),
  };
}
function plantHaystack(p) {
  /* The plant's own name goes in first, and that ordering is the whole
     ranking: typing "minze" has to put Minze above Bergamottminze, and it only
     does so if "minze" starts the field rather than sitting somewhere inside
     the run of its five bottles' names. Its other names follow, at the same
     weight, because "Spearmint" and "Krauseminze" are the same question asked
     in two languages. */
  var merged = {
    de: fold(p.de) + (p.aka.length ? ' ' + fold(p.aka.join(' ')) : ''),
    en: '', latin: '', fam: '', note: '', good: '', char: '', code: '', supplier: '', about: '',
  };
  for (var i = 0; i < p.bottles.length; i++) {
    var h = haystack(p.bottles[i]);
    for (var key in merged) merged[key] = (merged[key] ? merged[key] + ' ' : '') + h[key];
  }
  return merged;
}

/* Score one oil against one folded query word.

   The order of these tests is the whole ranking: the name you typed beats the
   name in another language, which beats the family, which beats a word buried
   in a description. A word that starts a name beats one in the middle of it,
   so "zit" puts Zitrone above Bergamotte-Zitrone and well above the eleven
   oils whose description mentions lemon. */
function scoreWord(hay, w) {
  var s = 0;
  s = Math.max(s, part(hay.de, w, 100));
  s = Math.max(s, part(hay.en, w, 88));
  s = Math.max(s, part(hay.latin, w, 80));
  s = Math.max(s, part(hay.fam, w, 62));
  s = Math.max(s, part(hay.note, w, 58));
  s = Math.max(s, part(hay.good, w, 46));
  s = Math.max(s, part(hay.char, w, 44));
  s = Math.max(s, hay.code === w ? 96 : (hay.code.indexOf(w) === 0 ? 54 : 0));
  s = Math.max(s, isSupplier(hay.supplier, w) ? 70 : 0);   /* "rbm" means the range, not a word in it */
  if (!s && hay.about.indexOf(w) >= 0) s = 12;
  return s;
}
/* A whole supplier name, not a word inside one: typing "rbm" means the range
   and should not drag in every oil whose description mentions it. A plant's
   haystack holds every supplier behind it — "aromen rbm" — so this matches a
   whole token rather than the whole field, or a Zitrone both shops sell would
   answer to neither of them. */
function isSupplier(hay, w) {
  if (!hay) return false;
  return (' ' + hay + ' ').indexOf(' ' + w + ' ') >= 0;
}
function part(hay, w, top) {
  if (!hay) return 0;
  if (hay === w) return top + 12;
  if (hay.indexOf(w) === 0) return top;                 /* starts the field */
  if (hay.indexOf(' ' + w) >= 0) return top - 14;       /* starts a word in it */
  if (hay.indexOf(w) >= 0) return top - 30;             /* somewhere in it */
  return 0;
}

/* Search. Every word has to hit something — "zitrone bio" finding nothing is
   better than it finding every oil with "bio" in the text. */
export function search(query, opts) {
  var o = opts || {};
  var list = o.pool || all();
  var q = fold(query);
  var words = q ? q.split(' ') : [];
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var oil = list[i];
    var hay = oil._hay || (oil._hay = haystack(oil));
    if (o.families && o.families.length && !anyIn(familiesOf(oil), o.families)) continue;
    if (o.suppliers && o.suppliers.length && !anyIn(suppliersOf(oil), o.suppliers)) continue;
    if (o.notes && o.notes.length && !anyIn(notesOf(oil), o.notes)) continue;
    if (o.exclude && o.exclude.indexOf(oil.id) >= 0) continue;
    if (o.favsOnly && !Store.personalFor(oil.id).fav) continue;
    var total = 0, ok = true;
    for (var w = 0; w < words.length; w++) {
      var s = scoreWord(hay, words[w]);
      if (!s) { ok = false; break; }
      total += s;
    }
    if (!ok) continue;
    out.push({ oil: oil, score: total });
  }
  out.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.oil.de.localeCompare(b.oil.de, 'de');
  });
  var oils = out.map(function (r) { return r.oil; });
  return o.limit ? oils.slice(0, o.limit) : oils;
}

/* Used for the families/suppliers/notes filters above: true when any of an
   entry's values (familiesOf/suppliersOf/notesOf — the union across a
   plant's bottles) is one of the values the filter chips selected. */
function anyIn(list, targets) {
  for (var i = 0; i < list.length; i++) if (targets.indexOf(list[i]) >= 0) return true;
  return false;
}

/* Which part of the oil the query actually matched, so the autocomplete can
   show it: typing "santalum" should say why Sandelholz is in the list. */
export function why(oil, query) {
  var words = fold(query).split(' ').filter(Boolean);
  var hay = oil._hay || haystack(oil);
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    if (hay.de.indexOf(w) >= 0) continue;               /* the name is obvious */
    if (hay.latin.indexOf(w) >= 0) return oil.latin;
    if (hay.en.indexOf(w) >= 0) return oil.en;
    if (hay.fam.indexOf(w) >= 0) return oil.familyDe;
    if (hay.good.indexOf(w) >= 0) return (oil.goodDe || [])[0] || '';
    if (hay.char.indexOf(w) >= 0) return (oil.character || []).join(', ');
    if (isSupplier(hay.supplier, w)) return suppliersOf(oil).join(' und ');
  }
  return '';
}
