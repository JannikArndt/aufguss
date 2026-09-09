/* 9. Mischen: combinations, from your favourites and from your own journal.

   Two lists and they are different in kind, which is the point of putting them
   on one screen. The upper one is built out of the sourced rules — one Kopf,
   one Herz, one Basis out of the oils you have starred, families checked
   against the table. The lower one is nothing but what you have actually
   poured together, counted. The second gets better than the first somewhere
   around the thirtieth Aufguss, and you can watch it happen. */

import { $, el, clear } from '../core/util.js';
import { byId } from '../core/catalog.js';
import { pourOrder, leadNote } from '../core/blend.js';
import { setsFromFavourites, favouritePairs, history } from '../core/suggest.js';
import { card } from './parts.js';

export function render() {
  var body = $('mixBody');
  clear(body);
  body.appendChild(fromFavourites());
  body.appendChild(fromHistory());
  body.appendChild(card('Woher das kommt', [
    el('p', 'prose small',
      'Die Reihenfolge und die Verhältnisse stammen von aroma1x1.com und ' +
      'floria-natural.com, die Duftgruppen-Tabelle ebenfalls, die Tropfenzahl ' +
      'pro Liter von saunawelt-oso.de. Alles nachzulesen in sources/blending.md. ' +
      'Es ist Handwerk, keine Wissenschaft — deine eigenen Aufgüsse sind der bessere Zeuge.'),
  ]));
}

function fromFavourites() {
  var r = setsFromFavourites(5);
  if (r.need) {
    return card('Aus deinen Lieblingsölen', [
      el('p', 'prose small', 'Markiere unter Öle noch ' + r.need +
        (r.need === 1 ? ' Öl' : ' Öle') + ' mit ★, dann baue ich daraus Sätze.'),
    ]);
  }
  if (r.thin && r.thin.length) {
    return card('Aus deinen Lieblingsölen', [
      el('p', 'prose small', 'Unter deinen Lieblingen fehlt noch ' + r.thin.join(' und ') +
        '. Ein Satz braucht alle drei Ebenen, sonst trägt er nicht.'),
    ]);
  }
  var kids = r.sets.map(function (s) { return setBlock(s.oils); });
  kids.push(el('p', 'tiny', 'Basis, Herz, Kopf — in dieser Reihenfolge in die Kelle. ' +
    'Tippen fängt einen Aufguss damit an.'));
  return card('Aus deinen Lieblingsölen', kids);
}

/* One row per set, in pouring order, with a coloured dot per note. A card per
   set was tried first and three stacked cards filled a phone screen with two
   suggestions — the point of this screen is to see five at once and pick. */
function setBlock(oils) {
  var ordered = pourOrder(oils);
  var dots = el('span', 'setdots', ordered.map(function (o) {
    return el('i', 'note-dot note-' + (leadNote(o) || ''));
  }));
  var row = el('button', 'item', [
    dots,
    el('span', 'grow', [
      el('span', 't', ordered.map(function (o) { return o.de; }).join(' · ')),
      el('span', 's', ordered.map(function (o) { return o.familyDe; }).join(' · ')),
    ]),
    el('span', 'when', '›'),
  ]);
  row.type = 'button';
  row.addEventListener('click', function () {
    location.hash = '#/neu?oil=' + ordered.map(function (o) { return encodeURIComponent(o.id); }).join(',');
  });
  return row;
}

function fromHistory() {
  var pairs = favouritePairs(8), hist = history();
  if (!pairs.length) {
    return card('Was du wirklich zusammen gießt', [
      el('p', 'prose small', 'Noch nichts — das füllt sich von selbst, sobald ein paar ' +
        'Aufgüsse aufgeschrieben sind.'),
    ]);
  }
  var kids = pairs.map(function (p) {
    var a = byId(p.ids[0]), b = byId(p.ids[1]);
    if (!a || !b) return null;
    var row = el('button', 'item', [
      el('span', 'grow', [
        el('span', 't', a.de + ' + ' + b.de),
        el('span', 's', a.familyDe + ' · ' + b.familyDe),
      ]),
      el('span', 'when', p.n + '×'),
    ]);
    row.type = 'button';
    row.addEventListener('click', function () {
      location.hash = '#/neu?oil=' + encodeURIComponent(a.id) + ',' + encodeURIComponent(b.id);
    });
    return row;
  }).filter(Boolean);
  kids.push(el('p', 'tiny', 'Aus ' + hist.entries + ' Aufgüssen. Tippen fängt einen neuen damit an.'));
  return card('Was du wirklich zusammen gießt', kids);
}
