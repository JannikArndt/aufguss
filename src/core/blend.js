/* 3. What can be said about a set of oils once it is chosen.

   The rules are all in src/data/blending.js and every one of them is sourced
   (sources/blending.md). This file only applies them, and it applies very
   little: the order to pour in, which note is missing, and whether the scent
   families are ones a source pairs. It reports and never refuses, and it never
   scores anybody — a set with three base notes in it saves exactly like any
   other. */

import { NOTES, MIX_ORDER, HARMONY, DOSAGE } from '../data/blending.js';

export { NOTES, MIX_ORDER, DOSAGE };

/* An oil can carry two notes ("top-to-heart"). The first one is the one it
   leads with, and that is the one it is counted as; the second is shown but
   does not vote, because half an oil in two buckets makes every count a
   fraction and no clearer. */
export function leadNote(oil) {
  return (oil && oil.notes && oil.notes.length) ? oil.notes[0] : null;
}

/* The pour order: base first and sparingly, then heart, then top
   (aroma1x1.com). Within a note the order you added them is kept — at that
   point nothing here has an opinion. */
export function pourOrder(oils) {
  var out = [];
  for (var s = 0; s < MIX_ORDER.length; s++) {
    for (var i = 0; i < oils.length; i++) {
      if (leadNote(oils[i]) === MIX_ORDER[s]) out.push(oils[i]);
    }
  }
  for (var j = 0; j < oils.length; j++) {
    if (MIX_ORDER.indexOf(leadNote(oils[j])) < 0) out.push(oils[j]);   /* note unknown */
  }
  return out;
}

/* How the set divides between the three notes. A plain count and nothing
   more: how many lead with each, how many lead with none because nobody
   published one, and how many of the notes are estimated rather than stated. */
export function balance(oils) {
  var have = { top: 0, heart: 0, base: 0 }, unknown = 0, estimated = 0;
  for (var i = 0; i < oils.length; i++) {
    var n = leadNote(oils[i]);
    if (n && have.hasOwnProperty(n)) have[n]++; else unknown++;
    if (oils[i].noteEstimated) estimated++;
  }
  return { have: have, unknown: unknown, estimated: estimated, count: oils.length };
}

/* The note the set does not have yet, which is what a suggestion should fill.
   Heaviest first, so a set of two top notes is offered a base before a heart.
   Null once all three are there — then the suggestions fall back to harmony
   and to what you have poured together before.

   This used to be measured against a published ratio of Kopf to Herz to Basis.
   Four pages recommended four different ratios, the app made you choose one,
   and no Aufguss was ever written down better for it. Absent is a fact; three
   decimal places of "short by 0.4 of an oil" was arithmetic about a guess. */
export function missingNote(oils) {
  var b = balance(oils);
  for (var k = 0; k < MIX_ORDER.length; k++) {
    if (!b.have[MIX_ORDER[k]]) return MIX_ORDER[k];
  }
  return null;
}

/* Does every pair in the set appear in the family table, in either direction?
   Floria's table is not symmetric as published — citrus lists woody, woody
   lists citrus, but herbal does not list woody while nothing says they clash.
   So a pair counts as harmonious if either side lists the other, and a pair
   the table simply does not cover is reported as "nicht in der Tabelle"
   rather than as a clash. */
export function harmony(oils) {
  var pairs = [];
  for (var i = 0; i < oils.length; i++) {
    for (var j = i + 1; j < oils.length; j++) {
      var a = oils[i], b = oils[j];
      pairs.push({ a: a, b: b, state: pairState(a.family, b.family) });
    }
  }
  var known = pairs.filter(function (p) { return p.state !== 'unlisted'; });
  return {
    pairs: pairs,
    good: pairs.filter(function (p) { return p.state === 'good'; }).length,
    unlisted: pairs.length - known.length,
    total: pairs.length,
  };
}
export function pairState(famA, famB) {
  if (!famA || !famB) return 'unlisted';
  var a = HARMONY[famA], b = HARMONY[famB];
  if (!a && !b) return 'unlisted';
  if (famA === famB) return 'same';
  if ((a && a.indexOf(famB) >= 0) || (b && b.indexOf(famA) >= 0)) return 'good';
  return 'unlisted';
}
