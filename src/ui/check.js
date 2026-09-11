/* 12. Daten prüfen: everywhere the three shops contradict each other, and
   everywhere one of them says nothing at all.

   This screen decides nothing. Aromen calls Kampfer a Kopfnote, RBM calls it a
   Herznote, and neither is corrected here or anywhere else — that disagreement
   is the fact (§1, §4). What was missing was a way to see all of them at once:
   with three ranges in one list, a contradiction that only shows up on one
   oil's page is a contradiction nobody finds.

   So it counts them, groups them and writes them out, and then hands over a
   block of text that can be pasted wherever the answer is going to be looked
   for. The text is a question, never an answer: it names the oil, quotes what
   each shop said, and asks for the shops' own pages to be read again. Nothing
   on this screen writes anything back into the catalogue. */

import { $, el, clear, notice } from '../core/util.js';
import { inconsistencies } from '../core/catalog.js';
import { card } from './parts.js';

var KINDS = [
  { id: 'note', de: 'Duftnote', why: 'Zwei Anbieter ordnen dasselbe Öl verschieden ein.' },
  { id: 'family', de: 'Duftgruppe', why: 'Jeder Shop hat seine eigenen Gruppen, und sie decken sich nicht.' },
  { id: 'latin', de: 'Botanischer Name', why: 'Unterschiedliche Schreibweisen — oder wirklich zwei Pflanzen.' },
  { id: 'missing', de: 'Fehlt ganz', why: 'Der Anbieter veröffentlicht dazu nichts. Geraten wird hier nichts.' },
];

export function render() {
  var body = $('checkBody');
  clear(body);
  var all = inconsistencies();

  body.appendChild(card(null, [
    el('p', 'prose small',
      'Die Öle stehen so da, wie ihr Anbieter sie beschreibt. Wo zwei sich ' +
      'widersprechen, bleibt das Feld im Öl leer und beide Angaben stehen beim ' +
      'Öl — hier stehen sie alle zusammen. ' + all.length +
      (all.length === 1 ? ' Stelle ist offen.' : ' Stellen sind offen.')),
  ]));

  for (var k = 0; k < KINDS.length; k++) {
    var kind = KINDS[k];
    var rows = all.filter(byKind(kind.id));
    if (!rows.length) continue;
    /* A shop that publishes no note publishes no note for its whole range, so
       listing those one oil at a time would bury the handful of rows that can
       actually be answered under a hundred that cannot. They are counted per
       shop and per field instead, which is the shape the question really has:
       "Purelia gibt für 40 Öle keine Duftnote an" is one question, not forty. */
    var shown = kind.id === 'missing' ? gaps(rows).map(gapRow) : rows.map(issueRow);
    body.appendChild(card(kind.de + ' · ' + rows.length, [
      el('p', 'tiny', kind.why),
      el('div', null, shown),
    ]));
  }

  body.appendChild(promptCard(all));
}
function byKind(id) {
  return function (x) { return x.kind === id; };
}

/* The missing fields, one row per shop and field, with the oils behind it
   kept so the text to paste can still name them. */
function gaps(rows) {
  var seen = {}, out = [];
  for (var i = 0; i < rows.length; i++) {
    var x = rows[i], sup = x.rows[0].supplier || 'Eigene';
    var key = sup + '|' + x.field;
    if (!seen[key]) { seen[key] = { supplier: sup, field: x.field, names: [] }; out.push(seen[key]); }
    seen[key].names.push(x.de);
  }
  out.sort(function (a, b) { return b.names.length - a.names.length; });
  return out;
}
function gapRow(g) {
  return el('div', 'item flat', [
    el('span', 'grow', [
      el('span', 't', g.supplier + ' · ' + fieldName(g.field)),
      el('span', 's', g.names.length + (g.names.length === 1 ? ' Öl: ' : ' Öle: ') +
        g.names.slice(0, 6).join(', ') + (g.names.length > 6 ? ' …' : '')),
    ]),
  ]);
}

/* One open question, as a plain line. Not tappable: the oil's own page is two
   taps away under Öle and already says all of this in the place where it
   matters — this list is for reading down, not for working through. */
function issueRow(x) {
  return el('div', 'item flat', [
    el('span', 'grow', [
      el('span', 't', x.de),
      el('span', 's', x.text),
    ]),
  ]);
}

/* The text to paste somewhere else. A textarea rather than only a button,
   because the clipboard is not always there — a phone that refuses it, a
   browser that wants a gesture it did not get — and a screen whose one job is
   handing over text must not depend on it. The button is the convenience; the
   field is the screen. */
function promptCard(all) {
  var ta = el('textarea');
  ta.rows = 8;
  ta.readOnly = true;
  ta.value = promptText(all);

  var copy = el('button', 'btn primary', 'Text kopieren');
  copy.type = 'button';
  copy.addEventListener('click', function () {
    var done = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value);
        done = true;
      }
    } catch (e) { done = false; }
    if (!done && ta.select) { ta.select(); }
    notice(done ? 'Kopiert.' : 'Markiert — jetzt kopieren.');
  });

  return card('Zum Weitergeben', [
    el('p', 'prose small',
      'Der Text fragt nach, er behauptet nichts. Er nennt jedes Öl, zitiert, ' +
      'was welcher Shop dazu schreibt, und bittet darum, es auf den Seiten der ' +
      'Anbieter nachzulesen. Was dabei herauskommt, gehört in src/data/ und in ' +
      'sources/ — nicht hier hinein.'),
    ta,
    copy,
  ]);
}

/* Written for whoever has to go and look it up, which may well be a person
   with three browser tabs open. Every line carries the oil, the field and what
   each shop actually said, so nothing has to be guessed back out of a summary
   — and the last paragraph says out loud that an unanswerable line stays
   unanswered rather than being filled in. */
function promptText(all) {
  var out = [];
  out.push('In einem Aufguss-Journal stehen 3 Ölsortimente nebeneinander: Aromen, ' +
    'RBM und Purelia. Jedes Feld stammt wörtlich vom jeweiligen Anbieter. An ' +
    'diesen Stellen widersprechen sie sich oder schweigen:');
  out.push('');
  out.push('Widersprüche:');
  var splits = all.filter(function (x) { return x.kind !== 'missing'; });
  for (var i = 0; i < splits.length; i++) {
    var x = splits[i], said = [];
    for (var r = 0; r < x.rows.length; r++) {
      said.push(x.rows[r].supplier + ' („' + x.rows[r].de + '“): ' +
        (x.rows[r].label || '—'));
    }
    out.push('- ' + x.de + ' · ' + fieldName(x.field) + ' · ' + said.join(' | '));
  }
  out.push('');
  out.push('Fehlende Angaben:');
  var missing = gaps(all.filter(byKind('missing')));
  for (var g = 0; g < missing.length; g++) {
    out.push('- ' + missing[g].supplier + ' · ' + fieldName(missing[g].field) + ' · ' +
      missing[g].names.length + ': ' + missing[g].names.join(', '));
  }
  out.push('');
  out.push('Bitte für jede Zeile auf den Produktseiten der Anbieter nachsehen, was ' +
    'dort heute steht, und die Quelle mit URL und Datum dazuschreiben. Wo ein ' +
    'Anbieter die Angabe nicht veröffentlicht, bleibt sie leer — nichts ergänzen, ' +
    'was nicht auf einer Seite steht, und die Angaben der Anbieter nicht ' +
    'aneinander angleichen.');
  return out.join('\n');
}
function fieldName(id) {
  for (var i = 0; i < KINDS.length; i++) if (KINDS[i].id === id) return KINDS[i].de;
  if (id === 'url') return 'Produktseite';
  return id;
}
