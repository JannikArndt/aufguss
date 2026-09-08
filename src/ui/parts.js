/* 5. The pieces every screen is built out of.

   Kept here rather than repeated because an oil has to look like the same oil
   on the journal, in the editor, in a suggestion and on its own page — and
   because the note dot is the one piece of colour the app uses to mean
   something, so there had better be exactly one of it. */

import { el, fold } from '../core/util.js';
import { noteName } from '../core/catalog.js';
import { leadNote } from '../core/blend.js';

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

export function intensityPill(id) {
  if (!id) return null;
  return el('span', 'pill ' + id, id);
}

/* One oil as a tappable row. `sub` overrides the second line, which is
   otherwise the family and the Latin name — the two things that answer
   "which one is this?" fastest. */
export function oilRow(oil, opts) {
  var o = opts || {};
  var sub = o.sub != null ? o.sub :
    [oil.familyDe, oil.latin].filter(Boolean).join(' · ');
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
  var key = el('div', 'balkey', ['top', 'heart', 'base'].map(function (id) {
    return el('span', null, [
      el('i', 'note-dot note-' + id),
      noteName(id) + ' ' + bal.have[id] + '×',
    ]);
  }));
  return el('div', null, [bar, key]);
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
  var wrap = el('div', 'ac');
  if (input.parentNode) input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);
  var list = el('div', 'ac-list');
  wrap.appendChild(list);
  var rows = [], sel = -1;

  function close() { while (list.firstChild) list.removeChild(list.firstChild); rows = []; sel = -1; }

  function open() {
    close();
    var q = input.value.trim();
    if (q.length < (o.minChars || 2)) return;
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
    });
    move(0);
  }
  function move(n) {
    var kids = list.childNodes;
    if (!kids.length) { sel = -1; return; }
    sel = (n + kids.length) % kids.length;
    for (var i = 0; i < kids.length; i++) kids[i].className = 'ac-item' + (i === sel ? ' sel' : '');
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
