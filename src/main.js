/* 11. Which screen is showing, and everything that wires the app to the phone.

   Routing is the hash, so Back on the phone works without any thought and a
   screen can be linked to. Five routes and two of them take an argument:

     #/            the journal
     #/neu         a new Aufguss   (?oil=<id>,<id> pre-fills it)
     #/e/<id>      one Aufguss
     #/oele        the catalogue
     #/oel/<id>    one oil
     #/mischen     combinations
     #/mehr        settings, backup, sources

   Nothing else in src/ imports this file. That is what keeps the core modules
   loadable in Node without a DOM, which is what tools/smoke.mjs relies on. */

import { $, el } from './core/util.js';
import { Store } from './core/store.js';
import * as Journal from './ui/journal.js';
import * as Entry from './ui/entry.js';
import * as Oils from './ui/oils.js';
import * as Mix from './ui/mix.js';
import * as More from './ui/more.js';

/* ── The tab bar ───────────────────────────────────────────────────────────
   The same four tabs on every screen that has them, built from one table so
   they cannot drift apart. */
var TABS = [
  { hash: '#/',        glyph: '≡', label: 'Journal' },
  { hash: '#/neu',     glyph: '+', label: 'Neu' },
  { hash: '#/oele',    glyph: '\u25cb', label: 'Öle' },
  { hash: '#/mischen', glyph: '✦', label: 'Mischen' },
  { hash: '#/mehr',    glyph: '⋯', label: 'Mehr' },
];
function buildTabs(node, active) {
  while (node.firstChild) node.removeChild(node.firstChild);
  TABS.forEach(function (t) {
    var b = el('button', t.hash === active ? 'on' : '', [
      el('span', 'g', t.glyph), el('span', null, t.label),
    ]);
    b.type = 'button';
    b.addEventListener('click', function () { go(t.hash); });
    node.appendChild(b);
  });
}

var SCREENS = ['scJournal', 'scEntry', 'scOils', 'scOil', 'scMix', 'scMore'];
function show(id) {
  for (var i = 0; i < SCREENS.length; i++) $(SCREENS[i]).hidden = SCREENS[i] !== id;
  var body = $(id).querySelector('.body');
  if (body) body.scrollTop = 0;
}
function go(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

/* Where a Back button goes. The oil screen and the entry screen can both be
   reached from more than one place, so the route that opened them is
   remembered rather than assumed — arriving at an oil from inside an Aufguss
   and being dropped on the catalogue is the kind of thing that makes an app
   feel like it is not listening. */
var cameFrom = '#/';

function route() {
  var h = location.hash || '#/';
  var q = '';
  var qi = h.indexOf('?');
  if (qi >= 0) { q = h.slice(qi + 1); h = h.slice(0, qi); }

  if (h === '#/' || h === '') {
    cameFrom = '#/';
    buildTabs($('tabsJournal'), '#/');
    Journal.render();
    show('scJournal');

  } else if (h === '#/neu') {
    var pre = param(q, 'oil');
    var oils = pre ? pre.split(',').map(function (id) {
      return { oilId: decodeURIComponent(id), ml: Store.prefs().defaultMl };
    }) : null;
    Entry.open(null, { oils: oils, onClose: function () { go('#/'); } });
    show('scEntry');

  } else if (h.indexOf('#/e/') === 0) {
    var id = decodeURIComponent(h.slice(4));
    Entry.open(id, { onClose: function () { go('#/'); } });
    show('scEntry');

  } else if (h === '#/oele') {
    cameFrom = '#/oele';
    buildTabs($('tabsOils'), '#/oele');
    Oils.renderList();
    show('scOils');

  } else if (h.indexOf('#/oel/') === 0) {
    Oils.renderOne(decodeURIComponent(h.slice(6)));
    show('scOil');

  } else if (h === '#/mischen') {
    cameFrom = '#/mischen';
    buildTabs($('tabsMix'), '#/mischen');
    Mix.render();
    show('scMix');

  } else if (h === '#/mehr') {
    cameFrom = '#/mehr';
    buildTabs($('tabsMore'), '#/mehr');
    More.render();
    show('scMore');

  } else {
    go('#/');
  }
}
function param(query, key) {
  var parts = query.split('&');
  for (var i = 0; i < parts.length; i++) {
    var kv = parts[i].split('=');
    if (kv[0] === key) return kv.slice(1).join('=');
  }
  return '';
}

/* ── The part of the screen the browser is actually showing ────────────────
   100vh on iOS is the window with the address bar hidden, which it is not
   while you are scrolling. visualViewport knows the truth; without it the
   foot of a panel sits under the toolbar and the buttons in it cannot be
   reached, which is exactly the bug the foot exists to prevent. */
function fitHeight() {
  var h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  document.documentElement.style.setProperty('--app-h', h + 'px');
}

function wire() {
  Journal.wire();
  Oils.wireList();
  Oils.wireOne();

  $('entryBack').addEventListener('click', function () { go('#/'); });
  $('oilBack').addEventListener('click', function () { go(cameFrom); });

  $('entryDelete').addEventListener('click', function () {
    if (!confirm('Diesen Aufguss löschen? Das lässt sich nicht rückgängig machen.')) return;
    Entry.removeCurrent();
    go('#/');
  });

  window.addEventListener('hashchange', route);
  window.addEventListener('resize', fitHeight);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fitHeight);
  fitHeight();
  route();
}

/* The service worker makes the app open without a network and is the only
   thing here that fetches anything — and only this app's own files. It is
   registered last so a browser that refuses it still gets a working app. */
function registerWorker() {
  if (!('serviceWorker' in navigator)) return;
  /* A worker needs a secure context, and the browser is the authority on what
     counts as one — https, localhost, and 127.0.0.1, which a hand-written
     hostname check gets wrong and did. */
  if (window.isSecureContext === false) return;
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
    .catch(function () { /* no offline copy; nothing else changes */ });
}

wire();
registerWorker();

/* Exported for tools/smoke.mjs, which drives the app the way a finger does and
   needs to see state a finger cannot. Nothing in src/ may import this. */
export { route, go, TABS };
