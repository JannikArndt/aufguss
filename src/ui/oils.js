/* 8. The oils: the whole catalogue, and one oil at a time.

   The list is the search field. Filters by family and by note sit under it as
   chips because those are the two things worth narrowing by without typing —
   "zeig mir die Basisnoten" is a real question in front of a shelf. */

import { $, el, clear, notice, agoText } from '../core/util.js';
import { Store } from '../core/store.js';
import { byId, search, families, noteName, customOil, invalidate } from '../core/catalog.js';
import { NOTES, DOSAGE, leadNote } from '../core/blend.js';
import { history } from '../core/suggest.js';
import { oilRow, noteChip, field, card } from './parts.js';

var state = { q: '', families: [], notes: [], favsOnly: false };
var currentOil = null;

/* ── The list ────────────────────────────────────────────────────────────── */
export function renderList() {
  /* Two rows that scroll sideways rather than four that push the list off the
     screen. Notes and favourites on top because those are the two questions
     asked in front of a shelf; the ten families under them. */
  var chips = $('oilFilters');
  clear(chips);

  var top = el('div', 'chiprow');
  top.appendChild(chip('★ Lieblinge', state.favsOnly, function () {
    state.favsOnly = !state.favsOnly; renderList();
  }));
  NOTES.forEach(function (n) {
    top.appendChild(chip(n.de, state.notes.indexOf(n.id) >= 0, function () {
      toggle(state.notes, n.id); renderList();
    }, n.id));
  });
  chips.appendChild(top);

  var fams = el('div', 'chiprow');
  families().forEach(function (f) {
    fams.appendChild(chip(f.de, state.families.indexOf(f.id) >= 0, function () {
      toggle(state.families, f.id); renderList();
    }));
  });
  chips.appendChild(fams);

  var hist = history();
  var hits = search(state.q, {
    families: state.families, notes: state.notes, favsOnly: state.favsOnly,
  });

  var list = $('oilList');
  clear(list);
  list.appendChild(el('div', 'daymark', hits.length + (hits.length === 1 ? ' Öl' : ' Öle')));
  if (!hits.length) {
    list.appendChild(el('p', 'empty', 'Nichts gefunden. Über + oben rechts kannst du ein eigenes Öl anlegen.'));
    return;
  }
  hits.forEach(function (o) {
    var used = hist.used[o.id] || 0;
    list.appendChild(oilRow(o, {
      fav: Store.personalFor(o.id).fav,
      trail: used ? used + '×' : '',
      onTap: function () { location.hash = '#/oel/' + encodeURIComponent(o.id); },
    }));
  });
}
function chip(text, on, fn, note) {
  var c = el('button', 'chip' + (on ? ' on' : ''),
    note ? [el('i', 'note-dot note-' + note), text] : text);
  c.type = 'button';
  c.addEventListener('click', fn);
  return c;
}
function toggle(arr, v) {
  var i = arr.indexOf(v);
  if (i < 0) arr.push(v); else arr.splice(i, 1);
}

export function wireList() {
  var input = $('oilSearch');
  input.addEventListener('input', function () { state.q = input.value.trim(); renderList(); });
  $('btnAddOil').addEventListener('click', function () { newOil(); });
}

function newOil() {
  var name = prompt('Wie heißt das Öl?');
  if (!name) return;
  var oil = customOil(name.trim());
  Store.putCustomOil(oil);
  invalidate();
  notice('Angelegt. Note und Duftgruppe kannst du jetzt eintragen.');
  location.hash = '#/oel/' + encodeURIComponent(oil.id);
}

/* ── One oil ─────────────────────────────────────────────────────────────── */
export function renderOne(id) {
  currentOil = byId(id);
  var body = $('oilBody');
  clear(body);
  if (!currentOil) {
    $('oilTitle').textContent = 'Unbekannt';
    body.appendChild(el('p', 'empty', 'Dieses Öl gibt es nicht mehr.'));
    return;
  }
  var o = currentOil, p = Store.personalFor(o.id);
  $('oilTitle').textContent = o.de;
  var fav = $('oilFav');
  fav.textContent = p.fav ? '★' : '☆';
  fav.className = 'icon fav' + (p.fav ? ' on' : '');

  body.appendChild(card(null, [
    el('div', 'chips', [
      noteChip(o),
      o.familyDe ? el('span', 'pill', o.familyDe) : null,
      o.code ? el('span', 'pill', o.code) : null,
    ]),
    el('dl', 'kv', [
      o.en ? el('dt', null, 'Englisch') : null, o.en ? el('dd', null, o.en) : null,
      o.latin ? el('dt', null, 'Botanisch') : null, o.latin ? el('dd', null, el('i', null, o.latin)) : null,
      (o.goodDe && o.goodDe.length) ? el('dt', null, 'Gut für') : null,
      (o.goodDe && o.goodDe.length) ? el('dd', null, o.goodDe.join(', ')) : null,
      el('dt', null, 'Menge'), el('dd', null, DOSAGE.mlPerOil[0] + '–' + DOSAGE.mlPerOil[1] + ' ml'),
    ].filter(Boolean)),
    el('p', 'tiny', 'Als Anhaltspunkt ' + DOSAGE.dropsPerLitre[0] + '–' + DOSAGE.dropsPerLitre[1] +
      ' Tropfen pro Liter Aufgusswasser (saunawelt-oso.de). Was auf die Steine kommt, ' +
      'entscheidest du und das Haus.'),
  ]));

  if (o.about) {
    body.appendChild(card('Wie es riecht', [
      el('div', 'prose', el('p', null, o.about)),
      o.url ? link('Bei Aromen nachlesen', o.url) : null,
    ]));
  }
  if (o.noteEstimated) {
    body.appendChild(card('Zur Note', [
      el('p', 'prose small', 'Aromen gibt für dieses Öl keine Note an. ' + noteName(leadNote(o)) +
        ' ist aus der Duftgruppe „' + o.familyDe + '“ geschätzt — siehe sources/oils.md im Repository.'),
    ]));
  }
  if (o.custom) body.appendChild(editCard(o));

  body.appendChild(personalCard(o, p));
  body.appendChild(usageCard(o));
}

function link(text, href) {
  var a = el('a', 'link small', text);
  a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
  return el('p', null, a);
}

/* Only your own oils are editable. A catalogue oil's facts belong to Aromen
   and are re-read from their site rather than typed over here; what you think
   of it goes in your own note below, which every oil has. */
function editCard(o) {
  var fam = el('select');
  fam.appendChild(new Option('— Duftgruppe —', ''));
  families().forEach(function (f) {
    var opt = new Option(f.de, f.id);
    if (o.family === f.id) opt.selected = true;
    fam.appendChild(opt);
  });
  fam.addEventListener('change', function () {
    o.family = fam.value;
    o.familyDe = fam.value ? (fam.options[fam.selectedIndex].text) : '';
    Store.putCustomOil(o); invalidate(); renderOne(o.id);
  });

  var notes = el('div', 'chips', NOTES.map(function (n) {
    var on = (o.notes || []).indexOf(n.id) >= 0;
    var c = el('button', 'chip' + (on ? ' on' : ''), [el('i', 'note-dot note-' + n.id), n.de]);
    c.type = 'button';
    c.addEventListener('click', function () {
      o.notes = on ? [] : [n.id];
      Store.putCustomOil(o); invalidate(); renderOne(o.id);
    });
    return c;
  }));

  var lat = el('input');
  lat.type = 'text'; lat.value = o.latin || ''; lat.placeholder = 'Botanischer Name';
  lat.addEventListener('change', function () {
    o.latin = lat.value.trim(); Store.putCustomOil(o); invalidate();
  });

  var del = el('button', 'btn danger', 'Öl löschen');
  del.addEventListener('click', function () {
    if (!confirm('„' + o.de + '“ aus deiner Liste löschen? Aufgüsse, in denen es steht, ' +
                 'zeigen es danach nicht mehr an.')) return;
    Store.removeCustomOil(o.id); invalidate();
    notice('Gelöscht.'); location.hash = '#/oele';
  });

  return card('Dein eigenes Öl', [
    field('Note', notes),
    field('Duftgruppe', fam),
    field('Botanisch', lat),
    del,
  ]);
}

function personalCard(o, p) {
  var ta = el('textarea');
  ta.value = p.note;
  ta.placeholder = 'Deine Notiz: wie es sich in der Kabine verhält, womit es gut geht, wie viel davon.';
  ta.addEventListener('input', function () { Store.setPersonal(o.id, { note: ta.value }); });
  return card('Deine Notiz', [ta]);
}

function usageCard(o) {
  var hist = history();
  var n = hist.used[o.id] || 0;
  var kids = [];
  if (!n) {
    kids.push(el('p', 'prose small', 'Noch nie damit gegossen.'));
  } else {
    kids.push(el('p', 'prose small', n + (n === 1 ? ' Aufguss' : ' Aufgüsse') +
      ', zuletzt ' + agoText(hist.last[o.id]) + '.'));
    var partners = [];
    for (var k in hist.pair) {
      var ids = k.split(' ');
      if (ids.indexOf(o.id) < 0) continue;
      var other = byId(ids[0] === o.id ? ids[1] : ids[0]);
      if (other) partners.push({ oil: other, n: hist.pair[k] });
    }
    partners.sort(function (a, b) { return b.n - a.n; });
    partners.slice(0, 5).forEach(function (pp) {
      kids.push(oilRow(pp.oil, {
        flat: true, sub: pp.n + (pp.n === 1 ? '× zusammen' : '× zusammen'),
        onTap: function () { location.hash = '#/oel/' + encodeURIComponent(pp.oil.id); },
      }));
    });
  }
  var use = el('button', 'btn primary', 'Aufguss damit anfangen');
  use.addEventListener('click', function () {
    location.hash = '#/neu?oil=' + encodeURIComponent(o.id);
  });
  kids.push(use);
  return card('In deinem Journal', kids);
}

export function wireOne() {
  $('oilFav').addEventListener('click', function () {
    if (!currentOil) return;
    var p = Store.personalFor(currentOil.id);
    Store.setPersonal(currentOil.id, { fav: !p.fav });
    renderOne(currentOil.id);
  });
}
