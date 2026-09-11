/* 8. The oils: the whole catalogue, and one oil at a time.

   The list is the search field. Filters by family and by note sit under it as
   chips because those are the two things worth narrowing by without typing —
   "zeig mir die Basisnoten" is a real question in front of a shelf. */

import { $, el, clear, notice, agoText } from '../core/util.js';
import { Store } from '../core/store.js';
import { byId, search, families, suppliers, noteName, customOil, invalidate, plantOf, varietyOf } from '../core/catalog.js';
import { NOTES, DOSAGE, leadNote } from '../core/blend.js';
import { history } from '../core/suggest.js';
import { oilRow, noteChip, field, card } from './parts.js';

var state = { q: '', families: [], suppliers: [], notes: [], favsOnly: false };
var currentOil = null;

/* A favourite still keys on one id, but a plant is a different id from any of
   its bottles — so before this grouping existed, someone could already have
   starred a bottle that now lives inside a plant. Treating the plant as a
   favourite whenever it is itself starred *or* one of its bottles still is
   means that old star keeps showing up rather than quietly vanishing. */
function isFav(o) {
  if (!o) return false;
  if (Store.personalFor(o.id).fav) return true;
  if (o.isPlant) {
    for (var i = 0; i < o.bottles.length; i++) if (Store.personalFor(o.bottles[i].id).fav) return true;
  }
  return false;
}

/* The line under a plant's name in the list: what tells the bottles apart,
   in the same "supplier · family · latin" shape a single oil's row already
   uses, plus how many bottles answer to the name when that is more than
   one. Built from pieces that may each be empty — joined rather than
   concatenated, so a disagreement (no familyDe, no latin) drops its part
   cleanly instead of leaving a stray " · " behind. */
function plantSub(o) {
  var bits = [];
  if (o.suppliers.length) bits.push(o.suppliers.join('/'));
  if (o.familyDe) bits.push(o.familyDe);
  if (o.latin) bits.push(o.latin);
  if (o.bottles.length > 1) bits.push(o.bottles.length + ' Sorten');
  return bits.join(' · ');
}

/* ── The list ────────────────────────────────────────────────────────────── */
export function renderList() {
  /* Notes and favourites on top, because those are the two questions asked in
     front of a shelf, and there are few enough of them to scroll sideways.
     The ten families underneath wrap onto their own lines instead — scrolling
     that many off the right edge hid most of them, and a filter that cannot
     be seen cannot be picked. */
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

  var fams = el('div', 'chiprow wrap');
  /* The two ranges sit on the same row as the families, because "nur RBM" is
     the same kind of narrowing as "nur Holzig" — and because with both ranges
     in one list, the shelf you are standing in front of is a real filter. */
  suppliers().forEach(function (s) {
    fams.appendChild(chip(s.id, state.suppliers.indexOf(s.id) >= 0, function () {
      toggle(state.suppliers, s.id); renderList();
    }));
  });
  families().forEach(function (f) {
    fams.appendChild(chip(f.de, state.families.indexOf(f.id) >= 0, function () {
      toggle(state.families, f.id); renderList();
    }));
  });
  chips.appendChild(fams);

  var hist = history();
  /* favsOnly is filtered here rather than handed to search() as an option:
     search() checks a fav on the entry's own id, and a plant's own id is
     never what an old favourite was set on — see isFav() above. Filtering
     after the fact means "★ Lieblinge" still finds a plant whose favourite
     lives on one of its bottles. */
  var hits = search(state.q, {
    families: state.families, suppliers: state.suppliers, notes: state.notes,
  });
  if (state.favsOnly) hits = hits.filter(isFav);

  var list = $('oilList');
  clear(list);
  list.appendChild(el('div', 'daymark', hits.length + (hits.length === 1 ? ' Öl' : ' Öle')));
  if (!hits.length) {
    list.appendChild(el('p', 'empty', 'Nichts gefunden. Über + oben rechts kannst du ein eigenes Öl anlegen.'));
    return;
  }
  hits.forEach(function (o) {
    var used = usedCount(o, hist);
    list.appendChild(oilRow(o, {
      fav: isFav(o),
      sub: o.isPlant ? plantSub(o) : undefined,
      trail: used ? used + '×' : '',
      onTap: function () { location.hash = '#/oel/' + encodeURIComponent(o.id); },
    }));
  });
}
/* How often this entry has been poured — a plant's own id never appears in a
   journal written before this grouping existed, so its count is the sum of
   whatever its bottles were poured as, plus its own id in case a future
   Aufguss ever names the plant directly. */
function usedCount(o, hist) {
  var n = hist.used[o.id] || 0;
  if (o.isPlant) for (var i = 0; i < o.bottles.length; i++) n += hist.used[o.bottles[i].id] || 0;
  return n;
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
  var favOn = isFav(o);
  fav.textContent = favOn ? '★' : '☆';
  fav.className = 'icon fav' + (favOn ? ' on' : '');

  /* A bottle that belongs to a plant gets a way back up to it — the plant is
     the thing you were looking at, this is the detail underneath. A plant's
     own page never shows this, since plantOf() on a plant id returns the
     plant itself. */
  var pl = plantOf(o);
  if (pl && pl.isPlant && pl.id !== o.id) {
    body.appendChild(el('div', 'chips', [backChip(pl)]));
  }

  var headChips = [
    /* An agreed note, shown the same way a single oil's is. Where the
       bottles disagree o.notes is empty on purpose (§4) — nothing is
       guessed here, the disagreement gets its own card below instead. */
    (o.notes && o.notes.length) ? noteChip(o) : null,
    o.familyDe ? el('span', 'pill', o.familyDe) : null,
  ];
  if (o.isPlant) headChips = headChips.concat(o.suppliers.map(function (s) { return el('span', 'pill', s); }));
  else if (o.supplier) headChips.push(el('span', 'pill', o.supplier));
  if (o.code) headChips.push(el('span', 'pill', o.code));

  body.appendChild(card(null, [
    el('div', 'chips', headChips),
    el('dl', 'kv', [
      o.en ? el('dt', null, 'Englisch') : null, o.en ? el('dd', null, o.en) : null,
      o.latin ? el('dt', null, 'Botanisch') : null, o.latin ? el('dd', null, el('i', null, o.latin)) : null,
      o.plantFamily ? el('dt', null, 'Pflanzenfamilie') : null,
      o.plantFamily ? el('dd', null, o.plantFamily) : null,
      o.blend ? el('dt', null, 'Zusammensetzung') : null,
      o.blend ? el('dd', null, o.parts ||
        'RBM veröffentlicht dazu nichts — das Öl steht nur auf der Preisliste.') : null,
      (o.goodDe && o.goodDe.length) ? el('dt', null, 'Gut für') : null,
      (o.goodDe && o.goodDe.length) ? el('dd', null, o.goodDe.join(', ')) : null,
      (o.goesWith && o.goesWith.length) ? el('dt', null, 'Harmoniert mit') : null,
      (o.goesWith && o.goesWith.length) ? el('dd', null, o.goesWith.join(', ')) : null,
      el('dt', null, 'Menge'), el('dd', null, DOSAGE.mlPerOil[0] + '–' + DOSAGE.mlPerOil[1] + ' ml'),
    ].filter(Boolean)),
  ]));

  if (o.about) {
    body.appendChild(card('Wie es riecht', [
      el('div', 'prose', el('p', null, o.about)),
      o.url ? link('Bei ' + (o.supplier || 'der Quelle') + ' nachlesen', o.url) : null,
    ]));
  }
  if (o.noteEstimated) {
    var famBit = o.familyDe ? ' aus der Duftgruppe „' + o.familyDe + '“' : '';
    body.appendChild(card('Zur Note', [
      el('p', 'prose small', (o.isPlant ? o.suppliers.join('/') : (o.supplier || 'Die Quelle')) +
        ' gibt für dieses Öl keine Note an. ' + noteName(leadNote(o)) + ' ist' + famBit +
        ' geschätzt — siehe sources/ im Repository.'),
    ]));
  } else if (o.blend) {
    /* A fertige Mischung has a note only in the sense that its ingredients do,
       and nobody publishes which one wins. Guessing it off the Zusammensetzung
       would be the invented fact this app is built not to write down. */
    body.appendChild(card('Zur Note', [
      el('p', 'prose small', 'Für eine fertige Mischung gibt ' + (o.supplier || 'der Anbieter') +
        ' keine Duftnote an, und geraten wird hier nichts. In der Verteilung ' +
        'zählt sie deshalb nicht mit, und in die Kelle kommt sie zuletzt.'),
    ]));
  }
  if (o.isPlant) {
    var sc = splitCard(o);
    if (sc) body.appendChild(sc);
    body.appendChild(bottlesCard(o));
  }
  if (o.custom) body.appendChild(editCard(o));

  body.appendChild(personalCard(o, p));
  body.appendChild(usageCard(o));
}

/* A button back up to the plant a bottle belongs to. A chip rather than a new
   element, so it looks like every other tappable pill on this screen. */
function backChip(pl) {
  var c = el('button', 'chip', '← ' + pl.de);
  c.type = 'button';
  c.addEventListener('click', function () { location.hash = '#/oel/' + encodeURIComponent(pl.id); });
  return c;
}

/* Where a plant's bottles do not agree, every side — never resolved, never
   averaged, never marked as the one that is right (§1). A shop that publishes
   nothing about the field is in the sentence too, saying so: "Purelia sagt
   nichts dazu" is a different fact from "Purelia sagt Herznote", and silence
   is not what caused the disagreement. Built off the
   bottles themselves rather than o.split: split's family value is the
   English family id catalog.js already translates familyDe from, and the
   supplier's own word for it is familyDe, not that id. Grouped by supplier so
   two bottles from the same range that happen to agree read as one voice; a
   bottle named alongside its supplier only when that same supplier's bottles
   disagree with each other too. */
function disagreeSentence(bottles, valueFn, renderFn) {
  var seen = {}, kids = [];
  for (var i = 0; i < bottles.length; i++) {
    var b = bottles[i], v = valueFn(b) || 'nichts dazu';
    var key = b.supplier + '|' + v;
    if (seen[key]) continue;
    seen[key] = true;
    var supplierSplits = false;
    for (var j = 0; j < bottles.length; j++) {
      if (bottles[j].supplier === b.supplier && valueFn(bottles[j]) && valueFn(bottles[j]) !== v) supplierSplits = true;
    }
    if (kids.length) kids.push(', ');
    kids.push((supplierSplits ? b.supplier + ' (' + b.de + ')' : b.supplier) + ' sagt ');
    kids.push(renderFn(v));
  }
  kids.push('.');
  return kids;
}
function splitCard(o) {
  var kids = [];
  if (!o.notes.length) kids.push(el('p', 'prose small',
    disagreeSentence(o.bottles, function (b) { return leadNote(b); }, noteName)));
  if (!o.familyDe) kids.push(el('p', 'prose small',
    disagreeSentence(o.bottles, function (b) { return b.familyDe; }, function (v) { return v; })));
  if (!o.latin) kids.push(el('p', 'prose small',
    disagreeSentence(o.bottles, function (b) { return b.latin; },
      function (v) { return v === 'nichts dazu' ? v : el('i', null, v); })));
  if (!kids.length) return null;
  return card('Die Anbieter sind sich uneinig', kids);
}

/* Where the plant can actually be bought, one shop at a time and under each
   shop the varieties it sells. This is the question the screen exists to
   answer: Zitrone gibt es von Purelia und von RBM, Purelia italienisch, RBM
   italienisch — and whichever of the two wrote a note and a description, that
   bottle says so on its own row.

   Grouped by supplier rather than listed flat, because "welche Flasche" is
   really two questions in a row: whose shelf, and then which bottle off it.
   Tapping a row opens that exact bottle — byId() resolves a bottle id — so the
   description, the Harmonie line and the article number are one tap away
   without any of it being crammed in here. */
function bottlesCard(o) {
  var kids = [];
  for (var i = 0; i < o.suppliers.length; i++) {
    var sup = o.suppliers[i];
    var mine = o.bottles.filter(function (b) { return b.supplier === sup; });
    kids.push(el('div', 'daymark', sup + ' · ' + mine.length +
      (mine.length === 1 ? ' Flasche' : ' Flaschen')));
    mine.forEach(function (b) {
      kids.push(oilRow(b, {
        flat: true,
        fav: isFav(b),
        sub: bottleSub(b),
        onTap: function () { location.hash = '#/oel/' + encodeURIComponent(b.id); },
      }));
    });
  }
  return card('Wo du es bekommst', kids);
}

/* One bottle's line: first what tells it apart from its neighbour on the same
   shelf — the variety the shop declared, or failing that the rest of the name
   it printed — then what that shop says about it. A shop that publishes no
   note and no Duftgruppe simply contributes nothing to the line rather than a
   run of empty separators. */
function bottleSub(b) {
  var vs = varietyOf(b).map(function (v) { return v.label; });
  var bits = vs.length ? [vs.join(', ')] : [];
  var n = leadNote(b);
  if (n) bits.push(noteName(n) + (b.noteEstimated ? ' (geschätzt)' : ''));
  if (b.familyDe) bits.push(b.familyDe);
  if (b.latin) bits.push(b.latin);
  if (b.code) bits.push(b.code);
  if (!bits.length) bits.push(b.de);
  return bits.join(' · ');
}

function link(text, href) {
  var a = el('a', 'link small', text);
  a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
  return el('p', null, a);
}

/* Only your own oils are editable. A catalogue oil's facts belong to whoever
   sells it and are re-read from their site rather than typed over here; what
   you think of it goes in your own note below, which every oil has. */
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
  /* Every Aufguss ever written down named a bottle, never a plant — a plant's
     id did not exist yet when it was poured. So "how often" sums every
     bottle the plant groups, plus the plant's own id in case a future
     Aufguss ever names it directly. */
  var ids = o.isPlant ? o.bottles.map(function (b) { return b.id; }).concat([o.id]) : [o.id];
  var n = 0, last = null;
  for (var i = 0; i < ids.length; i++) {
    n += hist.used[ids[i]] || 0;
    if (hist.last[ids[i]] && (!last || hist.last[ids[i]] > last)) last = hist.last[ids[i]];
  }
  var kids = [];
  if (!n) {
    kids.push(el('p', 'prose small', 'Noch nie damit gegossen.'));
  } else {
    kids.push(el('p', 'prose small', n + (n === 1 ? ' Aufguss' : ' Aufgüsse') +
      ', zuletzt ' + agoText(last) + '.'));
    /* A partner is collapsed to its own plant, if it has one — two Aufgüsse
       poured with different bottles of the same partner plant are one
       partner here, the same as the list shows one row for them. */
    var partners = {}, order = [];
    for (var k in hist.pair) {
      var pair = k.split(' ');
      var mineA = ids.indexOf(pair[0]) >= 0, mineB = ids.indexOf(pair[1]) >= 0;
      if (mineA === mineB) continue;   /* neither is this entry, or both are — not a partner */
      var otherId = mineA ? pair[1] : pair[0];
      var otherEntry = plantOf(otherId);
      if (!otherEntry) continue;
      if (!partners[otherEntry.id]) { partners[otherEntry.id] = { oil: otherEntry, n: 0 }; order.push(otherEntry.id); }
      partners[otherEntry.id].n += hist.pair[k];
    }
    var list = order.map(function (key) { return partners[key]; });
    list.sort(function (a, b) { return b.n - a.n; });
    list.slice(0, 5).forEach(function (pp) {
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
  return card('In deinen Aufgüssen', kids);
}

export function wireOne() {
  $('oilFav').addEventListener('click', function () {
    if (!currentOil) return;
    var next = !isFav(currentOil);
    Store.setPersonal(currentOil.id, { fav: next });
    /* Turning a plant's star off while a bottle underneath is still starred
       from before this grouping existed would otherwise leave the star
       stuck on — isFav() would still find that old bottle favourite. Clearing
       it here is a direct answer to the tap that was just made, not a silent
       loss of data. */
    if (currentOil.isPlant && !next) {
      currentOil.bottles.forEach(function (b) { Store.setPersonal(b.id, { fav: false }); });
    }
    renderOne(currentOil.id);
  });
}
