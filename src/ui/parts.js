/* 5. The pieces every screen is built out of.

   Kept here rather than repeated because an oil has to look like the same oil
   on the journal, in the editor, in a suggestion and on its own page — and
   because the note dot is the one piece of colour the app uses to mean
   something, so there had better be exactly one of it. */

import { el, fold } from '../core/util.js';
import { noteName } from '../core/catalog.js';
import { leadNote } from '../core/blend.js';
import { INTENSITIES } from '../data/themes.js';

var SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  var n = document.createElementNS(SVG_NS, tag);
  for (var k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
/* A tiny icon, built from SVG shapes rather than an emoji — an emoji is a
   drawing someone else made in a style that is never quite this app's, and
   it cannot take currentColor the way these need to for a chip or a pill
   that changes colour under them. */
function icon(viewBox, size, kids) {
  var s = svgEl('svg', { viewBox: viewBox, width: size, height: size, 'aria-hidden': 'true' });
  kids.forEach(function (k) { s.appendChild(k); });
  return s;
}

/* Kopf, Herz, Basis as a shape, for the rows where a set is already read by
   its colour (the step circle in a set row is already top/heart/base
   coloured) and the word next to it would not fit four oils on a screen. A
   shape rather than just a fuller dot, because colour alone tells nobody who
   cannot see it apart which note it is — a head for Kopf, first to arrive; a
   heart for Herz, the body of the mix; a square for Basis, what it stands
   on. */
export function noteGlyph(n) {
  if (n === 'top') {
    return icon('0 0 20 20', '13', [
      svgEl('circle', { cx: '10', cy: '7.5', r: '5', fill: 'currentColor' }),
      svgEl('path', { d: 'M2 19c0-4.7 3.6-8.5 8-8.5s8 3.8 8 8.5', fill: 'currentColor' }),
    ]);
  }
  if (n === 'heart') {
    return icon('0 0 20 20', '13', [
      svgEl('path', {
        d: 'M10 18C10 18 2 12.6 2 7 2 4 4.2 2 7 2c1.6 0 3 .8 3 2.6C10 2.8 11.4 2 13 2c2.8 0 5 2 5 5 0 5.6-8 11-8 11Z',
        fill: 'currentColor',
      }),
    ]);
  }
  if (n === 'base') {
    return icon('0 0 20 20', '13', [
      svgEl('rect', { x: '3.5', y: '3.5', width: '13', height: '13', rx: '2.5', fill: 'currentColor' }),
    ]);
  }
  return el('span', null, '?');
}

/* Kopf, Herz, Basis as a coloured dot plus its name. The dot alone would be
   colour carrying meaning on its own, which is no good to anyone who cannot
   tell the three apart — so the word is always next to it. */
export function noteChip(oil, opts) {
  var o = opts || {};
  var n = leadNote(oil);
  if (!n) return el('span', 'tiny', 'Note unbekannt');
  var kids = [el('i', 'note-dot note-' + n)];
  kids.push(document.createTextNode(o.short ? noteName(n).slice(0, 4) + '.' : noteName(n)));
  if (oil.notes.length > 1 && !o.short) {
    kids.push(el('span', 'tiny', ' → ' + noteName(oil.notes[1])));
  }
  if (oil.noteEstimated && !o.short) kids.push(el('span', 'tiny', ' geschätzt'));
  return el('span', 'pill', kids);
}

/* Stärke, as Kellen. Bäderland's plan gives three levels as a coloured icon
   (sources/aufgussplan.md); the app keeps those three ids everywhere, since
   that is the sourced fact, and only shows the count here — one ladle for
   sanft, up to three for stark — in a small glyph in the same spirit as the
   plan's own icon, not a copy of it. */
var KELLEN = { sanft: 1, mittel: 2, stark: 3 };
export function kellenOf(id) { return KELLEN[id] || 0; }

/* A ladle: a round bowl and the handle it hangs from, the shape it actually
   has at the stones — not the wave this used to be, which read as nothing
   in particular. */
function ladle() {
  return icon('0 0 16 16', '12', [
    svgEl('circle', { cx: '5.3', cy: '5.3', r: '4', fill: 'currentColor' }),
    svgEl('line', {
      x1: '8.1', y1: '8.1', x2: '14', y2: '14', stroke: 'currentColor',
      'stroke-width': '2.2', 'stroke-linecap': 'round',
    }),
  ]);
}
export function kellenIcon(n) {
  var wrap = el('span', 'kellen');
  for (var i = 0; i < n; i++) wrap.appendChild(ladle());
  return wrap;
}

export function intensityPill(id) {
  if (!id) return null;
  var p = el('span', 'pill ' + id, kellenIcon(kellenOf(id)));
  var iv = INTENSITIES.filter(function (x) { return x.id === id; })[0];
  if (iv) p.title = iv.de;
  return p;
}

/* One oil as a tappable row. `sub` overrides the second line, which is
   otherwise the family and the Latin name — the two things that answer
   "which one is this?" fastest. */
/* The line under the name. The supplier goes first because it is the short
   part and the part that tells two bottles apart — both ranges sell a Zitrone
   and a Zirbelkiefer, and without this the two rows are the same row. */
export function oilRow(oil, opts) {
  var o = opts || {};
  var sub = o.sub != null ? o.sub :
    [oil.supplier, oil.familyDe, oil.latin].filter(Boolean).join(' · ');
  var row = el('button', 'item' + (o.flat ? ' flat' : ''), [
    noteDot(oil),
    el('span', 'grow', [
      el('span', 't', oil.de + (oil.custom ? ' · eigenes' : '')),
      sub ? el('span', 's', sub) : null,
    ]),
    o.fav ? el('span', 'star', '★') : null,
    o.trail ? el('span', 'when', o.trail) : null,
  ]);
  row.type = 'button';
  if (o.onTap) row.addEventListener('click', o.onTap);
  return row;
}
function noteDot(oil) {
  var n = leadNote(oil);
  return el('i', 'note-dot' + (n ? ' note-' + n : ''));
}

/* How much of the set is top, heart and base — a bar rather than three
   numbers, because the only question anyone asks of it is "is one missing?" */
export function balanceBar(bal) {
  var total = bal.count || 1;
  var bar = el('div', 'bal');
  [['top', 't'], ['heart', 'h'], ['base', 'b']].forEach(function (p) {
    var n = bal.have[p[0]];
    if (!n) return;
    var i = el('i', p[1]);
    i.style.width = (n / total * 100) + '%';
    bar.appendChild(i);
  });
  /* Oils nobody gives a note for — a fertige Mischung, or one of your own —
     leave the rest of the track showing. Naming them in the key is the
     difference between a bar that is short and a bar that looks broken. */
  var keys = ['top', 'heart', 'base'].map(function (id) {
    return el('span', null, [
      el('i', 'note-dot note-' + id),
      noteName(id) + ' ' + bal.have[id] + '×',
    ]);
  });
  if (bal.unknown) {
    keys.push(el('span', null, [el('i', 'note-dot note-none'), 'ohne Note ' + bal.unknown + '×']));
  }
  return el('div', null, [bar, el('div', 'balkey', keys)]);
}

/* ── Autocomplete ──────────────────────────────────────────────────────────
   One input, a list under it, and the rule that the list is only ever a faster
   way to reach something the list below could also reach. Enter takes the
   highlighted row; the arrow keys move it, for the desktop this will sometimes
   be used from.

   The list is not shown until two characters are typed, because one character
   matches thirty oils and reads as noise. */
export function autocomplete(input, opts) {
  var o = opts || {};
  /* The wrapper is created around the input whether or not the input is in the
     document yet, and it is what the caller places. Reaching for
     input.parentNode instead only works when the field has already been built,
     which is never the order these screens are written in. */
  /* Marks "a field whose results appear underneath it" — main.js reads this
     to scroll the field to the top of .body instead of centring it, and to
     know when the screen should give the list the rest of the space. */
  input.className = (input.className ? input.className + ' ' : '') + 'ac-input';
  var wrap = el('div', 'ac');
  if (input.parentNode) input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);
  var list = el('div', 'ac-list');
  wrap.appendChild(list);
  var rows = [], rowNodes = [], sel = -1;

  function close() {
    while (list.firstChild) list.removeChild(list.firstChild);
    rows = []; rowNodes = []; sel = -1;
    list.style.maxHeight = '';
  }

  function open() {
    close();
    var q = input.value.trim();
    if (q.length < (o.minChars || 2)) return;
    /* The filter chips, when the search has a choice worth offering — built
       first so they sit above the rows rather than after them. Returning null
       here means the query did not earn a choice, and nothing is added. */
    if (o.head) {
      var head = o.head(q);
      if (head) list.appendChild(head);
    }
    var found = o.find(q) || [];
    for (var i = 0; i < found.length; i++) rows.push(found[i]);
    rows.forEach(function (r, i) {
      var btn = el('button', 'ac-item', [
        r.lead || null,
        el('span', 'grow', [
          el('span', 't', highlight(r.title, q)),
          r.sub ? el('span', 's', r.sub) : null,
        ]),
      ]);
      btn.type = 'button';
      btn.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
      btn.addEventListener('click', function () { take(i); });
      list.appendChild(btn);
      rowNodes.push(btn);
    });
    /* The CSS max-height is a guess (46vh); the real number is however much
       room is actually left below the field before the keyboard's edge, and
       that is only knowable once the field has a position. Guarded all the
       way through because the stub DOM this runs against in tests has none
       of it. */
    var box = input.getBoundingClientRect ? input.getBoundingClientRect() : null;
    if (box) {
      var appH = window.getComputedStyle
        ? parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--app-h'))
        : NaN;
      if (!isFinite(appH)) appH = window.innerHeight;
      var avail = appH - box.bottom - 12;
      if (avail > 160) list.style.maxHeight = avail + 'px';
    }
    move(0);
  }
  /* Off `rowNodes`, not every child of the list — the filter chips `head`
     adds are not a row to land on with the arrow keys. */
  function move(n) {
    if (!rowNodes.length) { sel = -1; return; }
    sel = (n + rowNodes.length) % rowNodes.length;
    for (var i = 0; i < rowNodes.length; i++) rowNodes[i].className = 'ac-item' + (i === sel ? ' sel' : '');
  }
  function take(i) {
    if (i < 0 || i >= rows.length) return;
    var r = rows[i];
    close();
    o.onPick(r.value, r);
  }

  input.addEventListener('input', open);
  input.addEventListener('focus', open);
  input.addEventListener('blur', function () { setTimeout(close, 120); });
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); move(sel + 1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); move(sel - 1); }
    else if (ev.key === 'Enter') {
      if (sel >= 0 && rows.length) { ev.preventDefault(); take(sel); }
      else if (o.onEnter) { ev.preventDefault(); o.onEnter(input.value.trim()); }
    } else if (ev.key === 'Escape') { close(); }
  });

  return { node: wrap, close: close, refresh: open };
}

/* Mark the typed part inside a suggestion. Folded on both sides, so typing
   "sues" still lights up the "süß" it matched. */
function highlight(text, query) {
  var words = fold(query).split(' ').filter(Boolean);
  if (!words.length) return document.createTextNode(text);
  var hay = fold(text), best = -1, bestLen = 0;
  for (var i = 0; i < words.length; i++) {
    var at = hay.indexOf(words[i]);
    if (at >= 0 && (best < 0 || at < best)) { best = at; bestLen = words[i].length; }
  }
  if (best < 0) return document.createTextNode(text);
  /* Folding can change lengths (ä becomes ae), so map back by counting
     folded characters as the original is walked. */
  var from = -1, to = -1, seen = 0;
  for (var c = 0; c <= text.length; c++) {
    if (seen === best && from < 0) from = c;
    if (seen === best + bestLen && to < 0) { to = c; break; }
    if (c < text.length) seen += fold(text[c]).length || 0;
  }
  if (from < 0) return document.createTextNode(text);
  if (to < 0) to = text.length;
  return el('span', null, [
    text.slice(0, from), el('mark', null, text.slice(from, to)), text.slice(to),
  ]);
}

/* A label and a row of chips under it, scrolling sideways the same way the
   Öle screen's filters do — the same two classes, so a chip looks like a chip
   everywhere it shows up. `items` is `[{ id, label }]`; `isOn` and `onToggle`
   work off `id`, `label` is only ever shown. */
export function chipRow(label, items, isOn, onToggle) {
  var row = el('div', 'chiprow', items.map(function (it) {
    var c = el('button', 'chip' + (isOn(it.id) ? ' on' : ''), it.label);
    c.type = 'button';
    /* Same trick the suggestion rows use: without it the tap takes the focus
       off the field, the field's blur closes the list, and the chip you just
       tapped takes the list with it. A filter is not somewhere to type. */
    c.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
    c.addEventListener('click', function () { onToggle(it.id); });
    return c;
  }));
  return el('div', null, [el('div', 'tiny', label), row]);
}

/* A labelled field. `input` is built by the caller so it can keep a handle. */
export function field(label, input, hint) {
  return el('div', 'field', [
    label ? el('label', null, label) : null,
    input,
    hint ? el('div', 'tiny', hint) : null,
  ]);
}

export function card(title, kids) {
  return el('div', 'card', [title ? el('h2', null, title) : null].concat(kids || []));
}
