/* 7. The journal: what you poured, when.

   Grouped by day, newest first, because "what did I do on the 3rd" and "what
   did I do last time" are the two questions this list answers and both are
   asked by date. The search field takes a theme, an oil or a date and filters
   the same list rather than opening a different screen. */

import { $, el, clear, longDate, todayISO, daysBetween } from '../core/util.js';
import { Store } from '../core/store.js';
import { byId } from '../core/catalog.js';
import { fold } from '../core/util.js';

var query = '';

export function render() {
  var list = $('journalList');
  clear(list);
  var all = Store.entries();
  var shown = query ? all.filter(match) : all;

  $('journalEmpty').hidden = all.length > 0;
  if (all.length && !shown.length) {
    list.appendChild(el('p', 'empty', 'Nichts gefunden für „' + query + '“.'));
    return;
  }

  var day = null;
  for (var i = 0; i < shown.length; i++) {
    var e = shown[i];
    if (e.date !== day) {
      day = e.date;
      list.appendChild(el('div', 'daymark', dayLabel(e.date)));
    }
    list.appendChild(row(e));
  }
}

function dayLabel(iso) {
  var n = daysBetween(iso, todayISO());
  if (n === 0) return 'Heute · ' + longDate(iso);
  if (n === 1) return 'Gestern · ' + longDate(iso);
  return longDate(iso);
}

function row(e) {
  var names = (e.oils || []).map(function (x) {
    var o = byId(x.oilId); return o ? o.de : '?';
  });
  var item = el('button', 'item', [
    el('span', 'when', e.time || ''),
    el('span', 'grow', [
      el('span', 't', e.theme || 'Ohne Thema'),
      el('span', 's', names.length ? names.join(' · ') : 'Keine Öle notiert'),
    ]),
    e.intensity ? el('span', 'pill ' + e.intensity, e.intensity) : null,
    e.rating ? el('span', 'star', '★') : null,
  ]);
  item.type = 'button';
  item.addEventListener('click', function () {
    location.hash = '#/e/' + encodeURIComponent(e.id);
  });
  return item;
}

/* One query against everything an entry can be recognised by: its theme, its
   oils, its note, and the date in both the stored form and the German one, so
   "3. Mai" and "2026-05-03" both work. */
function match(e) {
  var q = fold(query);
  if (!q) return true;
  var hay = [
    e.theme, e.themeKind, e.sauna, e.intensity, e.notes, e.date, longDate(e.date), e.time,
  ].concat((e.oils || []).map(function (x) {
    var o = byId(x.oilId);
    return o ? o.de + ' ' + o.en + ' ' + o.latin + ' ' + o.familyDe : '';
  })).join(' ');
  var words = q.split(' ');
  var folded = fold(hay);
  for (var i = 0; i < words.length; i++) if (folded.indexOf(words[i]) < 0) return false;
  return true;
}

export function wire() {
  var input = $('journalSearch'), wrap = $('journalSearchWrap');
  $('btnSearchJournal').addEventListener('click', function () {
    wrap.hidden = !wrap.hidden;
    if (!wrap.hidden) input.focus();
    else { input.value = ''; query = ''; render(); }
  });
  input.addEventListener('input', function () { query = input.value.trim(); render(); });
}
