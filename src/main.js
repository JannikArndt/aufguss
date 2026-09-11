/* 11. Which screen is showing, and everything that wires the app to the phone.

   Routing is the hash, so Back on the phone works without any thought and a
   screen can be linked to. Five routes and two of them take an argument:

     #/            the journal
     #/neu         a new Aufguss   (?oil=<id>,<id> pre-fills it)
     #/e/<id>      one Aufguss
     #/oele        the catalogue
     #/oel/<id>    one oil
     #/mehr        settings, backup, sources

   Nothing else in src/ imports this file. That is what keeps the core modules
   loadable in Node without a DOM, which is what tools/smoke.mjs relies on. */

import { $, el, AppUpdate, bodyPane } from './core/util.js';
import { Store } from './core/store.js';
import * as Journal from './ui/journal.js';
import * as Entry from './ui/entry.js';
import * as Oils from './ui/oils.js';
import * as More from './ui/more.js';

/* ── The tab bar ───────────────────────────────────────────────────────────
   The same four tabs on every screen that has them, built from one table so
   they cannot drift apart. */
var TABS = [
  { hash: '#/',        glyph: '≡', label: 'Aufgüsse' },
  { hash: '#/neu',     glyph: '+', label: 'Neu' },
  { hash: '#/oele',    glyph: '\u25cb', label: 'Öle' },
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

var SCREENS = ['scJournal', 'scEntry', 'scOils', 'scOil', 'scMore'];
function show(id) {
  for (var i = 0; i < SCREENS.length; i++) $(SCREENS[i]).hidden = SCREENS[i] !== id;
}
/* Only a screen whose content just became a specific, possibly different
   thing — a chosen Aufguss, a chosen oil — starts back at the top. A list
   screen keeps whatever scroll it already had, because it never stopped
   showing the same list: coming back from an oil with Zurück should land
   where that oil was tapped from, not scroll the shelf back to the start. */
function resetScroll(id) {
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
    show('scEntry'); resetScroll('scEntry');

  } else if (h.indexOf('#/e/') === 0) {
    var id = decodeURIComponent(h.slice(4));
    Entry.open(id, { onClose: function () { go('#/'); } });
    show('scEntry'); resetScroll('scEntry');

  } else if (h === '#/oele') {
    cameFrom = '#/oele';
    buildTabs($('tabsOils'), '#/oele');
    Oils.renderList();
    show('scOils');

  } else if (h.indexOf('#/oel/') === 0) {
    Oils.renderOne(decodeURIComponent(h.slice(6)));
    show('scOil'); resetScroll('scOil');

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
  /* iOS still scrolls the document itself when a field near the foot takes
     focus, even with html and body locked to overflow:hidden — that scroll is
     what used to drag .top up under the notch. This undoes it regardless of
     what triggered it. Already at 0 is a no-op, so the visualViewport
     'scroll' listener that calls fitHeight cannot turn this into a loop. */
  var scrolledDoc = window.scrollY || 0;
  var scrolledView = (window.visualViewport && window.visualViewport.offsetTop) || 0;
  if ((scrolledDoc || scrolledView) && window.scrollTo) window.scrollTo(0, 0);
}

/* The keyboard opening moves the field a fixed layout would otherwise leave
   right where it was — half hidden above it, however tight --app-h already
   is. This scrolls only the field's own .body pane, after the keyboard has
   had a moment to finish animating, and only ever downward: the document
   itself must never move (fitHeight's job above is to undo it when iOS does
   it anyway), and the field must never end up higher than it already was —
   that is exactly what used to put it under the notch. A short field near the
   top of the screen is therefore left alone; parts.js's autocomplete handles
   fitting the list that opens under it. */
function nudgeFieldIntoView(ev) {
  var t = ev.target;
  if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA')) return;
  setTimeout(function () {
    var pane = bodyPane(t);
    if (!pane || !t.getBoundingClientRect || !pane.getBoundingClientRect) return;
    var f = t.getBoundingClientRect(), p = pane.getBoundingClientRect();
    var paneBottom = p.top + (pane.clientHeight || (p.bottom - p.top));
    var over = f.bottom - paneBottom + 12;
    if (over > 0) pane.scrollTop = (pane.scrollTop || 0) + over;
  }, 300);
}

function wire() {
  Journal.wire();
  Entry.wire();
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
  window.addEventListener('focusin', nudgeFieldIntoView);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitHeight);
    window.visualViewport.addEventListener('scroll', fitHeight);
  }
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
    .then(watchForUpdate)
    .catch(function () { /* no offline copy; nothing else changes */ });

  /* Reloading is the only way a tab actually starts running the new worker's
     files, and it only happens once someone has asked for it — either just
     now, or on an earlier visit that downloaded the update but never applied
     it, in which case it is still sitting there the next time this runs. */
  var reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (reloaded) return;
    reloaded = true;
    location.reload();
  });
}

/* Sees a new worker finish installing and offers it, instead of taking it —
   sw.js never calls skipWaiting() on its own, which is what keeps a version
   change from landing mid-Aufguss. AppUpdate.apply is what the Mehr screen
   calls when a person actually taps the button; it is the one message this
   app's own worker ever answers to, and it never fires by itself. */
function watchForUpdate(reg) {
  if (reg.waiting) AppUpdate.ready = true;
  reg.addEventListener('updatefound', function () {
    var worker = reg.installing;
    if (!worker) return;
    worker.addEventListener('statechange', function () {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) AppUpdate.ready = true;
    });
  });
  AppUpdate.apply = function () {
    if (reg.waiting) reg.waiting.postMessage('skipWaiting');
  };
}

wire();
registerWorker();

/* Exported for tools/smoke.mjs, which drives the app the way a finger does and
   needs to see state a finger cannot. Nothing in src/ may import this. */
export { route, go, TABS };
