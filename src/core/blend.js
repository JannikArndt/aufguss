/* 3. What can be said about a set of oils once it is chosen.

   The rules are all in src/data/blending.js and every one of them is sourced
   (sources/blending.md). This file only applies them. It reports and never
   refuses: a set with three base notes in it gets a remark, not an error, and
   saves exactly like any other. Some notes in this app's catalogue are
   estimated from the family rather than stated, and anything derived from one
   of those says so — and RBM's Mischungen carry no note at all, which is
   reported the same way rather than guessed at. */

import { NOTES, MIX_ORDER, RATIOS, HARMONY, DOSAGE } from '../data/blending.js';
import { noteName } from './catalog.js';

export { NOTES, MIX_ORDER, RATIOS, DOSAGE };

export function ratioById(id) {
  for (var i = 0; i < RATIOS.length; i++) if (RATIOS[i].id === id) return RATIOS[i];
  return RATIOS[0];
}

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

/* How the set divides between the three notes, and what the chosen ratio
   would have wanted for a set of that size. */
export function balance(oils, ratioId) {
  var r = ratioById(ratioId), have = { top: 0, heart: 0, base: 0 }, unknown = 0, estimated = 0;
  for (var i = 0; i < oils.length; i++) {
    var n = leadNote(oils[i]);
    if (n && have.hasOwnProperty(n)) have[n]++; else unknown++;
    if (oils[i].noteEstimated) estimated++;
  }
  var n = oils.length || 1;
  var sum = r.parts.top + r.parts.heart + r.parts.base;
  var want = {
    top: r.parts.top / sum * n,
    heart: r.parts.heart / sum * n,
    base: r.parts.base / sum * n,
  };
  return { have: have, want: want, unknown: unknown, estimated: estimated, ratio: r, count: oils.length };
}

/* The note the set is shortest of, which is what a suggestion should fill.
   Null once nothing is short — then the suggestions fall back to harmony and
   to what you have poured together before. */
export function missingNote(oils, ratioId) {
  var b = balance(oils.concat([{ notes: [] }]), ratioId);   /* as if one more */
  var worst = null, gap = 0.35;    /* under a third of an oil short is not short */
  for (var k = 0; k < MIX_ORDER.length; k++) {
    var id = MIX_ORDER[k], d = b.want[id] - b.have[id];
    if (d > gap) { gap = d; worst = id; }
  }
  return worst;
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

/* The drops the chosen ratio implies, for a total the user picks. Rounded so
   they add up to the total, largest remainder first — otherwise a 20-drop
   30·50·20 comes out as 19. */
export function drops(ratioId, total) {
  var r = ratioById(ratioId);
  var sum = r.parts.top + r.parts.heart + r.parts.base;
  var raw = MIX_ORDER.map(function (id) { return { id: id, v: r.parts[id] / sum * total }; });
  var out = {}, used = 0;
  raw.forEach(function (x) { out[x.id] = Math.floor(x.v); used += out[x.id]; });
  raw.sort(function (a, b) { return (b.v - Math.floor(b.v)) - (a.v - Math.floor(a.v)); });
  for (var i = 0; used < total && i < raw.length; i++, used++) out[raw[i].id]++;
  return out;
}

/* Plain sentences about a set, in the order they are worth reading. Each is
   { kind, text } — kind is 'note', 'family' or 'dose' so the view can style
   them, and nothing here is phrased as a correction. */
export function remarks(oils, ratioId, totalMl) {
  var out = [];
  if (!oils.length) return out;
  var b = balance(oils, ratioId), h = harmony(oils);

  /* Which notes are in the set and which are not. `present` is read off the
     count rather than off oils[0], because the first oil in the set may be one
     the supplier gives no note for — a Mischung, or one of your own — and then
     "Alles <nichts>" was the sentence this used to print. */
  var missing = [], present = [];
  for (var k = 0; k < MIX_ORDER.length; k++) {
    if (b.have[MIX_ORDER[k]]) present.push(MIX_ORDER[k]);
    else missing.push(noteName(MIX_ORDER[k]));
  }
  if (oils.length >= 2 && missing.length === 1) {
    out.push({ kind: 'note', text: 'Ohne ' + missing[0] + '. Das kann genau richtig sein — nach ' +
      b.ratio.label + ' wäre eine drin.' });
  } else if (oils.length >= 2 && missing.length === 2 && !b.unknown) {
    out.push({ kind: 'note', text: 'Alles ' + noteName(present[0]) +
      '. Sehr geradlinig; eine zweite Ebene würde die Mischung länger tragen.' });
  } else if (!missing.length) {
    out.push({ kind: 'note', text: 'Kopf, Herz und Basis sind alle da.' });
  }

  /* A fertige Mischung has no note because nobody published one, so it cannot
     count towards Kopf, Herz oder Basis. Saying so beats letting the bar
     quietly come up short. */
  if (b.unknown) {
    out.push({ kind: 'note', text: b.unknown === 1
      ? 'Ein Öl hat keine angegebene Note — in der Verteilung zählt es nicht mit, ' +
        'und in die Kelle kommt es zuletzt.'
      : b.unknown + ' Öle haben keine angegebene Note — in der Verteilung zählen sie ' +
        'nicht mit, und in die Kelle kommen sie zuletzt.' });
  }

  if (b.estimated) {
    out.push({ kind: 'note', text: b.estimated === 1
      ? 'Bei einem Öl ist die Note aus der Duftgruppe geschätzt, nicht vom Anbieter angegeben.'
      : 'Bei ' + b.estimated + ' Ölen ist die Note aus der Duftgruppe geschätzt.' });
  }

  if (h.total) {
    if (h.good === h.total) {
      out.push({ kind: 'family', text: 'Die Duftgruppen passen paarweise zusammen.' });
    } else if (h.unlisted === h.total) {
      out.push({ kind: 'family', text: 'Zu diesen Duftgruppen sagt die Tabelle nichts — was nichts gegen sie sagt.' });
    } else {
      var open = h.pairs.filter(function (p) { return p.state === 'unlisted'; });
      out.push({ kind: 'family', text: open.length + ' von ' + h.total +
        ' Paaren stehen nicht in der Tabelle: ' +
        open.map(function (p) { return p.a.familyDe + ' + ' + p.b.familyDe; }).join(', ') + '.' });
    }
  }

  if (totalMl > 0) {
    out.push({ kind: 'dose', text: totalMl.toFixed(1).replace('.', ',') + ' ml insgesamt. ' + DOSAGE.hint });
  }
  return out;
}
