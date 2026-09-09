/* 4. "Ich fange mit Zitrone an — was passt dazu?"

   Three things decide, and the app always says which one it was, because a
   suggestion you cannot see the reason for is a suggestion you cannot argue
   with:

     1. the note gap    — what the chosen ratio still wants (sourced)
     2. family harmony  — Floria's table, widened by aroma1x1 (sourced)
     3. your history    — how often you have actually poured these together

   The weights below are a judgement and nothing else: they say that filling a
   missing note matters most on the first few Aufgüsse, and that once there are
   fifty entries in the journal your own pairs should outweigh a table off a
   shop's blog. They are here rather than buried so they can be argued with.

   Nothing here is ever the only way in. Every suggestion sits next to the same
   search field, and the search field reaches all 133 oils. */

import { all } from './catalog.js';
import { Store } from './store.js';
import { leadNote, missingNote, pairState } from './blend.js';
import { HARMONY } from '../data/blending.js';

var W = {
  note: 40,        /* fills the note the ratio is short of */
  noteSpare: 8,    /* a note the set already has, but not too many of */
  family: 22,      /* every chosen oil's family lists this one, or the reverse */
  familySome: 11,  /* at least one does */
  together: 9,     /* per Aufguss you have poured it with one of these before */
  togetherCap: 36, /* history is strong evidence, not the only evidence */
  favourite: 10,
  used: 4,         /* faint: you have used it at all */
  usedCap: 12,
  /* A tie-break, not a preference. On an empty journal every candidate that
     fills the missing note and matches the families scores identically, and
     the list then came out alphabetical — six oils nobody starts with. This
     leans on the source itself: a family the harmony table pairs with seven
     others is more likely to work than one it pairs with three. One point per
     listed partner, so it can only ever separate a tie. */
  versatile: 1,
};

/* How often each pair of oils has been in the same Aufguss, and how often each
   oil has been used at all. Built once per call from the journal; a journal of
   a few thousand entries is still a few milliseconds. */
export function history(entries) {
  var list = entries || Store.entries();
  var pair = {}, used = {}, last = {};
  for (var i = 0; i < list.length; i++) {
    var ids = (list[i].oils || []).map(function (x) { return x.oilId; });
    for (var a = 0; a < ids.length; a++) {
      used[ids[a]] = (used[ids[a]] || 0) + 1;
      if (!last[ids[a]] || last[ids[a]] < list[i].date) last[ids[a]] = list[i].date;
      for (var b = a + 1; b < ids.length; b++) {
        pair[key(ids[a], ids[b])] = (pair[key(ids[a], ids[b])] || 0) + 1;
      }
    }
  }
  return {
    pair: pair, used: used, last: last, entries: list.length,
    together: function (x, y) { return pair[key(x, y)] || 0; },
  };
}
function key(a, b) { return a < b ? a + ' ' + b : b + ' ' + a; }

/* Suggest partners for a set. `chosen` may be empty — then it opens with your
   favourites and your most-used oils, which is the honest answer to "surprise
   me" before there is anything to go on. */
export function suggest(chosen, ratioId, opts) {
  var o = opts || {};
  var hist = o.history || history();
  var favs = Store.favourites();
  var want = missingNote(chosen, ratioId);
  var chosenIds = chosen.map(function (x) { return x.id; });
  var pool = o.pool || all();
  var out = [];

  for (var i = 0; i < pool.length; i++) {
    var oil = pool[i];
    if (chosenIds.indexOf(oil.id) >= 0) continue;
    if (o.families && o.families.length && o.families.indexOf(oil.family) < 0) continue;

    var score = 0, reasons = [];

    var n = leadNote(oil);
    if (want && n === want) {
      score += W.note;
      reasons.push({ kind: 'note', text: 'füllt die fehlende ' + deNote(want) });
    } else if (!want && n) {
      score += W.noteSpare;
    }

    if (chosen.length) {
      var good = 0;
      for (var c = 0; c < chosen.length; c++) {
        if (pairState(chosen[c].family, oil.family) === 'good') good++;
      }
      if (good === chosen.length) {
        score += W.family;
        reasons.push({ kind: 'family', text: 'passt zu allen Duftgruppen' });
      } else if (good) {
        score += W.familySome;
        reasons.push({ kind: 'family', text: 'passt zu ' + chosen[firstGood(chosen, oil)].familyDe });
      }
    }

    var tog = 0;
    for (var t = 0; t < chosen.length; t++) tog += hist.together(chosen[t].id, oil.id);
    if (tog) {
      score += Math.min(tog * W.together, W.togetherCap);
      reasons.push({ kind: 'history',
        text: tog === 1 ? 'einmal zusammen gegossen' : tog + '\u00d7 zusammen gegossen' });
    }

    if (favs.indexOf(oil.id) >= 0) {
      score += W.favourite;
      reasons.push({ kind: 'fav', text: 'dein Lieblingsöl' });
    }

    var u = hist.used[oil.id] || 0;
    if (u) score += Math.min(u * W.used, W.usedCap);

    score += W.versatile * ((HARMONY[oil.family] || []).length);
    if (!oil.noteEstimated) score += 1;   /* a stated note beats a guessed one */

    if (score <= 0) continue;
    out.push({ oil: oil, score: score, reasons: reasons, used: u });
  }

  out.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.oil.de.localeCompare(b.oil.de, 'de');
  });
  return out.slice(0, o.limit || 6);
}
function firstGood(chosen, oil) {
  for (var i = 0; i < chosen.length; i++) if (pairState(chosen[i].family, oil.family) === 'good') return i;
  return 0;
}
function deNote(id) { return id === 'top' ? 'Kopfnote' : id === 'heart' ? 'Herznote' : 'Basisnote'; }

