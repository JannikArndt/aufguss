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

var cache = null, cacheStamp = '';

/* Rebuilt whenever the custom oils change, which is rarely; the stamp is the
   cheapest honest way to notice. */
export function all() {
  var custom = Store.customOils();
  var stamp = String(custom.length) + ':' + custom.map(function (o) { return o.id; }).join(',');
  if (cache && cacheStamp === stamp) return cache;
  cacheStamp = stamp;
  cache = CATALOGUE.concat(custom.map(function (o) {
    o.custom = true;
    if (!o.familyDe && o.family) o.familyDe = o.family;
    return o;
  }));
  for (var i = 0; i < cache.length; i++) cache[i]._hay = haystack(cache[i]);
  return cache;
}
export function invalidate() { cache = null; }

/* An id is the supplier's slug, so when a supplier renames a product the id
   moves with it — and every Aufguss already written down points at the old
   one. `wasId` carries the name it used to have, and an entry from before the
   rename still finds its oil. Without it the oil would quietly vanish out of
   an Aufguss that was written correctly at the time, which is the one thing
   this app must never do. The exact id always wins; the old name is only ever
   a fallback. */
export function byId(id) {
  var list = all(), i;
  for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  for (i = 0; i < list.length; i++) if (list[i].wasId === id) return list[i];
  return null;
}

/* Everything one oil can be found by, folded once and kept on the oil.
   Fields are kept separate so a hit on the name can outrank a hit on the
   description — which matters, because the descriptions mention half the
   catalogue by name.

   RBM's `goesWith` is the one field on an oil that is deliberately not in
   here. It is a list of other oils' names, so indexing it would put every oil
   whose Harmonie line says "Zitrone" into the results for zitrone — the exact
   noise the separate fields above exist to keep out. */
function haystack(o) {
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
    if (o.families && o.families.length && o.families.indexOf(oil.family) < 0) continue;
    if (o.suppliers && o.suppliers.length && o.suppliers.indexOf(oil.supplier) < 0) continue;
    if (o.notes && o.notes.length && !anyNote(oil, o.notes)) continue;
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

function anyNote(oil, notes) {
  for (var i = 0; i < notes.length; i++) if ((oil.notes || []).indexOf(notes[i]) >= 0) return true;
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
