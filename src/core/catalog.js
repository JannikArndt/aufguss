/* 2. The catalogue, and finding something in it.

   One list of oils: the 133 from Aromen, the 81 from RBM, and whatever you
   have added yourself. Which supplier an oil came from is a fact about where
   to buy it, not about how it smells, so it is carried on the oil and shown
   where it helps — and nowhere else does anything in the app branch on it.
   Both ranges have a Zitrone and a Zirbelkiefer in them; that is not a
   duplicate to clean up, it is two bottles.

   Custom oils carry a `custom: true` flag and an id that starts `own:` — that
   prefix is the only thing that distinguishes them anywhere in the app, and it
   is what makes an update of src/data/oils.js safe.

   The brief asks to search by name in three languages, by scent family, and by
   note. All three go through one index and one query, because in practice you
   type "zitr" and mean any of them. */

import { OILS } from '../data/oils.js';
import { OILS_RBM } from '../data/oils-rbm.js';
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
export var CATALOGUE = OILS.concat(OILS_RBM).sort(function (a, b) {
  return a.de.localeCompare(b.de, 'de');
});

/* Plants: the owner picks "Mandarine", not which of the two bottles that says
   Mandarine on it. This groups CATALOGUE by nameParts().key wherever two or
   more bottles share one — never a Mischung and never a custom oil, so the
   grouping only ever runs on the 239 supplier bottles above.

   A Mischung is an entry, not an oil (§4): it stays out of every group it
   would otherwise fall into, which is why the "jasmin" key holds a plant made
   of Aromen's Jasmin absolut and Jasmin mix while RBM's Mischung Jasmin Mix
   sits beside it unchanged, and why "orange" is a plant of two RBM oils next
   to the untouched Mischung Orange Sprizz. A custom oil is already exactly
   what someone meant to write down, so it never joins a plant either.

   The plant id is `art:` plus the key with its spaces turned to hyphens — a
   fourth id prefix alongside `own:` and `rbm:`, and like them the only thing
   that ever tells the app what kind of entry it is looking at.

   What a plant says about itself is only what its bottles agree on. Two
   suppliers naming the same plant differently is not a typo to fix — the
   disagreement is the fact, so a field the bottles do not all agree on comes
   back empty and the plant carries a `split` recording what each bottle said,
   the same honesty §1 asks of everything else here. Nothing is averaged or
   voted on: a plant without an agreed note lands exactly where an oil without
   one already does — poured last, counted as *ohne Note*. */
function buildPlants() {
  var groups = {}, order = [], i, k;
  for (i = 0; i < CATALOGUE.length; i++) {
    var o = CATALOGUE[i];
    if (o.blend) continue;                    /* a Mischung is an entry, not an oil — §4 */
    var key = nameParts(o).key;
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

function buildPlant(key, list) {
  var i;

  /* The label follows the tie-break families() already uses for familyDe:
     the spelling most of the bottles carry, decided by count rather than by
     whichever happens to sort first — otherwise the label could change its
     wording whenever the catalogue is re-sorted, which is a fact about
     nothing. */
  var de = nameParts(list[0]).base, deCount = {};
  for (i = 0; i < list.length; i++) {
    var base = nameParts(list[i]).base;
    deCount[base] = (deCount[base] || 0) + 1;
    if (deCount[base] > (deCount[de] || 0)) de = base;
  }

  var suppliers = [], seenSup = {};
  for (i = 0; i < list.length; i++) {
    var s = list[i].supplier;
    if (!s || seenSup[s]) continue;
    seenSup[s] = true; suppliers.push(s);
  }

  /* The exact dedupe roundBlock()'s Variante chips already do in
     src/ui/entry.js: fold each word, drop anything that folds to under two
     characters, keep the first spelling seen. A plant's variants are what
     that chip row would offer, computed once here instead of on every
     keystroke. */
  var variants = [], seenVar = {};
  for (i = 0; i < list.length; i++) {
    var words = nameParts(list[i]).words;
    for (var w = 0; w < words.length; w++) {
      var word = words[w], vk = fold(word);
      if (vk.length < 2 || seenVar[vk]) continue;
      seenVar[vk] = true; variants.push({ id: vk, label: word });
    }
  }

  /* An oil can lead with two notes ("top-to-heart"); only the first is what
     it is counted as anywhere in the app — leadNote() in blend.js decides
     that. blend.js imports catalog.js, not the other way round (§3), so
     importing it here would invert the dependency graph; notes[0] is exactly
     what leadNote() reads, so it is read directly instead. */
  var leads = [], notesAgree = true;
  for (i = 0; i < list.length; i++) {
    leads.push((list[i].notes && list[i].notes.length) ? list[i].notes[0] : null);
    if (leads[i] !== leads[0]) notesAgree = false;
  }
  var estimated = false;
  if (notesAgree) for (i = 0; i < list.length; i++) if (list[i].noteEstimated) estimated = true;

  var familyAgree = true;
  for (i = 1; i < list.length; i++) if (list[i].family !== list[0].family) familyAgree = false;
  var familyDe = list[0].familyDe, famCount = {};
  if (familyAgree) {
    for (i = 0; i < list.length; i++) {
      famCount[list[i].familyDe] = (famCount[list[i].familyDe] || 0) + 1;
      if (famCount[list[i].familyDe] > (famCount[familyDe] || 0)) familyDe = list[i].familyDe;
    }
  }

  var latinAgree = true;
  for (i = 1; i < list.length; i++) if (list[i].latin !== list[0].latin) latinAgree = false;

  var split = {};
  if (!notesAgree) split.note = list.map(function (o, idx) {
    return { supplier: o.supplier, de: o.de, value: leads[idx] };
  });
  if (!familyAgree) split.family = list.map(function (o) {
    return { supplier: o.supplier, de: o.de, value: o.family };
  });
  if (!latinAgree) split.latin = list.map(function (o) {
    return { supplier: o.supplier, de: o.de, value: o.latin };
  });

  var plant = {
    id: 'art:' + key.replace(/ /g, '-'),
    de: de,
    plant: true,
    bottles: list,
    custom: false,
    code: '',
    url: null,
    supplier: '',
    suppliers: suppliers,
    variants: variants,
    /* Agreeing that there is no note is still no note. Every single oil has
       one today, so this never fires — but a supplier who ships one without,
       the way RBM already does for its Mischungen, would otherwise give the
       plant a notes array holding nothing, which every reader would count as
       a note it does not have. */
    notes: (notesAgree && leads[0]) ? [leads[0]] : [],
    noteEstimated: estimated,
    family: familyAgree ? list[0].family : '',
    familyDe: familyAgree ? familyDe : '',
    latin: latinAgree ? list[0].latin : '',
  };
  if (Object.keys(split).length) plant.split = split;
  return plant;
}

var PLANT_LAYER = buildPlants();
var BOTTLE_TO_PLANT = PLANT_LAYER.byBottle;

/* The 172 entries all() walks and the lists show: every CATALOGUE bottle that
   did not join a plant — an ungrouped single oil or a Mischung, unchanged —
   plus the 45 plants, sorted the same way CATALOGUE is so a plant sits where
   its name would put a bottle. Built once: neither CATALOGUE nor the grouping
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

/* The flat 239 (now 172-plant-shaped when walked through all(), but every
   bottle is still here) plus the custom oils — what the oil page reads to
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
   was never grouped, so callers never need to branch on `.plant` before
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
  if (entry.plant) {
    var out = [];
    for (var i = 0; i < entry.bottles.length; i++) out.push(entry.bottles[i].family);
    return uniqueList(out);
  }
  return entry.family ? [entry.family] : [];
}
export function suppliersOf(entry) {
  if (!entry) return [];
  if (entry.plant) {
    var out = [];
    for (var i = 0; i < entry.bottles.length; i++) out.push(entry.bottles[i].supplier);
    return uniqueList(out);
  }
  return entry.supplier ? [entry.supplier] : [];
}
export function notesOf(entry) {
  if (!entry) return [];
  if (entry.plant) {
    var out = [], seen = {};
    for (var i = 0; i < entry.bottles.length; i++) {
      var ns = entry.bottles[i].notes || [];
      for (var j = 0; j < ns.length; j++) { if (!seen[ns[j]]) { seen[ns[j]] = true; out.push(ns[j]); } }
    }
    return out;
  }
  return entry.notes || [];
}

/* Everything one oil can be found by, folded once and kept on the oil.
   Fields are kept separate so a hit on the name can outrank a hit on the
   description — which matters, because the descriptions mention half the
   catalogue by name.

   RBM's `goesWith` is the one field on an oil that is deliberately not in
   here. It is a list of other oils' names, so indexing it would put every oil
   whose Harmonie line says "Zitrone" into the results for zitrone — the exact
   noise the separate fields above exist to keep out.

   A plant's haystack is the union of its bottles' — each bottle's own
   haystack already leaves goesWith and parts out, so the union does too
   without anything extra to remember here. */
function haystack(o) {
  if (o.plant) return plantHaystack(o);
  return {
    de: fold(o.de),
    en: fold(o.en),
    latin: fold(o.latin),
    fam: fold((o.family || '') + ' ' + (o.familyDe || '')),
    note: fold((o.notes || []).map(noteName).join(' ') + ' ' + (o.notes || []).join(' ')),
    good: fold((o.goodDe || []).join(' ') + ' ' + (o.good || []).join(' ')),
    char: fold((o.character || []).join(' ')),
    code: fold(o.code),
    supplier: fold(o.supplier),
    about: fold(o.about),
  };
}
function plantHaystack(p) {
  var merged = { de: '', en: '', latin: '', fam: '', note: '', good: '', char: '', code: '', supplier: '', about: '' };
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
  s = Math.max(s, hay.supplier === w ? 70 : 0);   /* "rbm" means the range, not a word in it */
  if (!s && hay.about.indexOf(w) >= 0) s = 12;
  return s;
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
    if (hay.supplier === w) return oil.supplier;
  }
  return '';
}
