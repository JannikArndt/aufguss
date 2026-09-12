/* 6. One Aufguss: the screen the app exists for.

   The shortest way through it is the one the brief describes — pick a theme,
   type three oil names, done. Everything else on this screen is optional and
   sits below that: what you did last time under the same theme, and what would
   go with what you have so far.

   It saves as you go. There is no Save button and no draft that can be lost by
   locking the phone, because the one thing worse than a clumsy journal is one
   that quietly throws away the Aufguss you just poured. The foot carries
   "Fertig", which only closes the screen. */

import { $, el, clear, uid, todayISO, nearestHour, agoText, notice } from '../core/util.js';
import { Store } from '../core/store.js';
import { byId, search, why, customOil, invalidate, noteName, families, plantOf, varietyOf } from '../core/catalog.js';
import { THEMES, INTENSITIES } from '../data/themes.js';
import { pourOrder, leadNote } from '../core/blend.js';
import { suggest, history } from '../core/suggest.js';
import { oilRow, autocomplete, field, card, kellenOf, kellenIcon, noteGlyph, chipRow } from './parts.js';

var entry = null;      /* the one being edited */
var isNew = false;
var onClose = null;
var suggestOpen = false;   /* "Passt dazu" starts collapsed on every fresh open */

export function open(id, opts) {
  var o = opts || {};
  onClose = o.onClose || function () {};
  isNew = !id;
  suggestOpen = false;
  lastTimeShown = 5;
  entry = id ? Store.entry(id) : null;
  if (!entry) {
    entry = {
      id: uid(),
      date: todayISO(), time: nearestHour(),
      theme: '', themeKind: '', intensity: '', sauna: Store.prefs().venue,
      oils: [], rounds: ROUNDS_DEFAULT, notes: '', rating: 0,
      written: new Date().toISOString(),
    };
    if (o.oils) entry.oils = o.oils.slice();
    if (o.theme) applyTheme(o.theme);
  }
  normaliseOils();
  normaliseRounds();
  $('entryTitle').textContent = isNew ? 'Neuer Aufguss' : (entry.theme || 'Aufguss');
  $('entryDelete').hidden = isNew;
  render();
}

/* Every Aufguss already in localStorage names a bottle in `oilId` — plants did
   not exist when it was written. Rewriting that in place, the first time the
   entry is opened after the plant layer landed, is what keeps an old entry
   pointing at exactly the bottle it was poured with rather than a bare plant
   name: the bottle moves to `bottleId`, and `oilId` becomes the plant it now
   sits inside. An oilId that was never grouped — a Mischung, an own: oil, or
   one that is already a plant id — comes back unchanged from plantOf(), so
   nothing here touches it. Idempotent, so reopening an already-migrated entry
   is a no-op. */
function migratedOilRef(x) {
  var oilId = x.oilId, bottleId = x.bottleId || '';
  if (!bottleId) {
    var plant = plantOf(oilId);
    if (plant && plant.isPlant && plant.id !== oilId) { bottleId = oilId; oilId = plant.id; }
  }
  return { oilId: oilId, bottleId: bottleId, ml: x.ml, round: x.round || 1 };
}
function normaliseOils() {
  entry.oils = entry.oils.map(migratedOilRef);
}

/* The oil this line of the set actually means: the chosen bottle when chips
   have narrowed one, the plant (or the ungrouped oil, Mischung, own: oil)
   otherwise. Everything downstream — the pour order, the suggestions — reads
   this and never the bare plant, so a plant whose bottles disagree on note
   correctly lands in "ohne Note" until a chip resolves it. */
function effectiveOil(x) { return byId(x.bottleId || x.oilId); }

/* The plant behind an entry's oil, or null when there is none — an ungrouped
   oil, a Mischung and an own: oil never get chips. */
function plantFor(oilId) {
  var p = byId(oilId);
  return (p && p.isPlant) ? p : null;
}

/* Three ice balls is the usual Aufguss — a round per Guss. Older entries were
   written before rounds existed, so every oil in them counts as round 1, and
   the round count grows to fit whatever the highest one actually used. */
var ROUNDS_DEFAULT = 3;
function normaliseRounds() {
  var max = 0;
  entry.oils.forEach(function (x) {
    if (!x.round) x.round = 1;
    if (x.round > max) max = x.round;
  });
  entry.rounds = Math.max(ROUNDS_DEFAULT, entry.rounds || 0, max);
}

function applyTheme(t) {
  entry.theme = t.name;
  entry.themeKind = t.kind || '';
  if (t.intensity) entry.intensity = t.intensity;
  if (t.time) entry.time = t.time;
}

/* Written on every change. Cheap — the whole journal is one JSON string — and
   it means the screen can be left at any moment. */
function save() {
  if (!entry.theme && !entry.oils.length && !entry.notes) return;   /* nothing yet */
  Store.putEntry(entry);
}

function render() {
  var body = $('entryBody');
  clear(body);
  $('entryTitle').textContent = entry.theme || (isNew ? 'Neuer Aufguss' : 'Aufguss');
  var oils = entry.oils.map(effectiveOil).filter(Boolean);

  body.appendChild(whenAndWhat());
  body.appendChild(lastTimeCard());
  body.appendChild(oilsCard());
  if (oils.length < 6) body.appendChild(suggestCard(oils));
  body.appendChild(notesCard());

  var foot = $('entryFoot');
  clear(foot);
  var done = el('button', 'btn primary', isNew ? 'Fertig' : 'Zurück zu den Aufgüssen');
  done.addEventListener('click', function () { save(); onClose(); });
  foot.appendChild(done);
}

/* ── When, and which Aufguss ─────────────────────────────────────────────── */
function whenAndWhat() {
  var date = el('input');
  date.type = 'date'; date.value = entry.date;
  date.addEventListener('change', function () {
    entry.date = date.value || todayISO(); save(); refreshLastTime();
  });

  var time = el('input');
  time.type = 'time'; time.step = '3600'; time.value = entry.time;
  time.addEventListener('change', function () { entry.time = time.value; save(); });

  var theme = el('input');
  theme.type = 'text'; theme.value = entry.theme;
  theme.placeholder = 'Thema, z. B. Waldfunkeln';
  theme.autocomplete = 'off';
  theme.addEventListener('input', function () {
    entry.theme = theme.value; save();
    $('entryTitle').textContent = entry.theme || (isNew ? 'Neuer Aufguss' : 'Aufguss');
  });
  var themeAc = autocomplete(theme, {
    find: function (q) { return findThemes(q); },
    onPick: function (t) {
      applyTheme(t);
      theme.value = t.name;
      render();
    },
  });

  var kinds = el('div', 'chips', INTENSITIES.map(function (iv) {
    var n = kellenOf(iv.id);
    var c = el('button', 'chip ' + iv.id + (entry.intensity === iv.id ? ' on' : ''), kellenIcon(n));
    c.type = 'button';
    c.title = iv.de;
    c.setAttribute('aria-label', iv.de + ', ' + n + (n === 1 ? ' Kelle' : ' Kellen'));
    c.addEventListener('click', function () {
      entry.intensity = entry.intensity === iv.id ? '' : iv.id;
      save(); render();
    });
    return c;
  }));

  var sauna = el('input');
  sauna.type = 'text'; sauna.value = entry.sauna || ''; sauna.placeholder = 'Kaifubad';
  sauna.addEventListener('change', function () {
    entry.sauna = sauna.value; Store.setPref('venue', sauna.value); save();
  });

  return card(null, [
    el('div', 'row2', [field('Tag', date), field('Uhrzeit', time)]),
    field('Thema', themeAc.node, entry.themeKind || null),
    field('Stärke', kinds),
    field('Sauna', sauna),
  ]);
}

/* Only five of the sixty themes say what family goes in them, and they say it
   on the plan itself (Blankenese labels its slots HOLZAROMEN, FRUCHTAROMEN and
   so on). Where that exists it is worth showing; where it does not, the app
   stays quiet rather than reading a theme's name as a hint. */
function themeFamilies() {
  if (!entry.theme) return [];
  for (var i = 0; i < THEMES.length; i++) {
    if (THEMES[i].name.toLowerCase() === entry.theme.toLowerCase()) return THEMES[i].families || [];
  }
  return [];
}

function findThemes(q) {
  var f = q.toLowerCase();
  var hits = THEMES.filter(function (t) {
    return t.name.toLowerCase().indexOf(f) >= 0 || (t.kind || '').toLowerCase().indexOf(f) >= 0;
  }).slice(0, 8);
  return hits.map(function (t) {
    return {
      title: t.name, value: t,
      sub: [t.kind, t.venue, t.time].filter(Boolean).join(' · '),
      lead: t.intensity ? el('span', 'pill ' + t.intensity, kellenIcon(kellenOf(t.intensity))) : null,
    };
  });
}

/* ── What you did last time under this theme ─────────────────────────────
   Nothing shown at all when there is nothing to show — a card that only ever
   says "never written down before" is a card worth skipping. Up to five past
   Aufgüsse once there are some, each oils grouped by the ball they were on
   together rather than flattened into one list, because "combined" is the
   thing this is meant to answer. */
var lastTimeShown = 5;
function refreshLastTime() {
  var old = $('lastTime');
  if (!old) return;
  var fresh = lastTimeCard();
  old.parentNode.replaceChild(fresh, old);
}
function lastTimeCard() {
  var wrap = el('div');
  wrap.id = 'lastTime';
  if (!entry.theme) return wrap;
  var matches = Store.entries().filter(function (e) {
    return e.id !== entry.id && e.theme && e.theme.toLowerCase() === entry.theme.toLowerCase();
  });
  if (!matches.length) return wrap;

  var shown = matches.slice(0, lastTimeShown);
  var kids = shown.map(pastRow);
  if (matches.length > shown.length) {
    var more = el('button', 'btn quiet', 'Mehr …');
    more.type = 'button';
    more.addEventListener('click', function () { lastTimeShown += 5; refreshLastTime(); });
    kids.push(more);
  }
  wrap.appendChild(card('Beim letzten Mal', kids));
  return wrap;
}

/* One past Aufguss, oils grouped by round. Tapping the row takes the same
   oils, on the same balls — the fastest way to repeat one that worked. */
function pastRow(e) {
  var groups = {};
  (e.oils || []).forEach(function (x) {
    var m = migratedOilRef(x);
    var o = byId(m.bottleId || m.oilId);
    if (!o) return;
    (groups[m.round] = groups[m.round] || []).push(o.de);
  });
  var rounds = Object.keys(groups).sort(function (a, b) { return a - b; });
  var text = rounds.map(function (r) { return groups[r].join(' + '); }).join('  ·  ');

  var row = el('button', 'item flat', [
    el('span', 'grow', [
      el('span', 't', text || 'Keine Öle notiert'),
      el('span', 's', agoText(e.date) + (e.notes ? ' · „' + e.notes + '“' : '')),
    ]),
  ]);
  row.type = 'button';
  row.addEventListener('click', function () {
    entry.oils = (e.oils || []).map(migratedOilRef);
    normaliseRounds();
    save(); render(); notice('Übernommen. Ändern geht natürlich noch.');
  });
  return row;
}

/* ── The oils, one ice ball (Kugel) per round ────────────────────────────────
   A round is what goes on one ice ball for one Guss. Three rounds and one oil
   each is the usual shape, so that is what a new Aufguss opens with — each
   round keeps its own search field, so adding a second or third oil to the
   same ball is no different from adding the first, and "Weitere Kugel" grows
   the set past three without touching what is already poured. */
function oilsCard() {
  var kids = [];
  var fams = themeFamilies();
  if (fams.length) {
    kids.push(el('p', 'tiny', 'Der Plan sagt zu diesem Thema: ' + fams.map(famDe).join(' oder ') + '.'));
  }
  for (var r = 1; r <= entry.rounds; r++) kids.push(roundBlock(r));

  var addRound = el('button', 'btn quiet', 'Weitere Kugel');
  addRound.type = 'button';
  addRound.addEventListener('click', function () { entry.rounds++; save(); render(); });
  kids.push(addRound);

  return card('Öle', kids);
}

/* Which oils are already on this ball, so the search can leave them out and
   the "add as own oil" row can find the right spot for them. */
function chosenIds() { return entry.oils.map(function (x) { return x.oilId; }); }

function roundBlock(r) {
  var items = entry.oils.filter(function (x) { return x.round === r; });
  var pairs = items.map(function (x) { return { x: x, oil: effectiveOil(x) }; })
    .filter(function (p) { return !!p.oil; });
  var byOilId = {};
  pairs.forEach(function (p) { byOilId[p.oil.id] = p; });
  var ordered = pourOrder(pairs.map(function (p) { return p.oil; }))
    .map(function (o) { return byOilId[o.id]; });

  var rows = el('div');
  ordered.forEach(function (p) {
    rows.appendChild(setRow(p.x, p.oil));
    var chips = chipsFor(p.x);
    if (chips) rows.appendChild(chips);
  });

  var input = el('input');
  input.type = 'search';
  input.placeholder = items.length ? 'Öl hinzufügen' : 'Öl suchen — Name, Latein, Duftgruppe';
  input.autocomplete = 'off';
  var oilAc = autocomplete(input, {
    find: function (q) {
      var hits = search(q, { limit: 12, exclude: chosenIds() });
      var rows = hits.map(function (o) {
        var reason = why(o, q);
        return { title: o.de, value: o, sub: searchSub(o, reason), lead: leadDot(o) };
      });
      rows.push({ title: '„' + q + '“ als eigenes Öl anlegen', value: { newOil: q }, sub: 'Kommt in deine Liste' });
      return rows;
    },
    onPick: function (v) {
      if (v.newOil) { addCustom(v.newOil, r); return; }
      addOil(v.id, r);
      input.value = '';
    },
  });

  return el('div', 'round', [
    el('div', 'roundhead', 'Kugel ' + r),
    rows,
    field(null, oilAc.node),
  ]);
}

/* The autocomplete's sub-line: what the name alone does not say.

   For a plant that is its varieties — "Grün | Orange | Rot" under one
   Mandarine is the whole reason five bottles are one row, and it answers the
   only question the name leaves open. For everything else it is the old
   supplier/Duftgruppe/Note line, which is what tells two oils of nearly the
   same name apart. Only what is actually there: a plant whose bottles disagree
   has no family and no note, and printing the gap as "· ·" would look broken
   rather than honest. */
function searchSub(o, reason) {
  if (o.isPlant && o.variants.length) {
    var vs = o.variants.map(function (v) { return capitalised(v.label); }).join(' | ');
    return (reason && reason !== o.de) ? vs + ' · ' + reason : vs;
  }
  var bits = [];
  var sup = o.isPlant ? o.suppliers.join(', ') : o.supplier;
  if (sup) bits.push(sup);
  if (o.familyDe) bits.push(o.familyDe);
  var note = noteName(leadNote(o) || '');
  if (note) bits.push(note);
  if (reason && reason !== o.de) bits.push(reason);
  return bits.join(' · ');
}

/* A variety is stored in the base form the suppliers' own words reduce to, so
   they can be compared across three shops — which means they arrive lowercase
   ("grün", "italienisch") and want a capital on a screen. Left alone where the
   word carries its own shape: "ct. Cineol" and "CO2" are not improved by it. */
function capitalised(word) {
  if (!/^[a-zäöüß]/.test(word)) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function leadDot(o) {
  var n = leadNote(o);
  return el('i', 'note-dot' + (n ? ' note-' + n : ''));
}

function setRow(x, oil) {
  var n = leadNote(oil);

  var glyph = el('span', 'step', noteGlyph(n));
  glyph.title = (noteName(n || '') || 'Note unbekannt') + (oil.noteEstimated ? ' (geschätzt)' : '');

  var drop = el('button', 'drop', '×');
  drop.type = 'button';
  drop.setAttribute('aria-label', oil.de + ' entfernen');
  drop.addEventListener('click', function () {
    entry.oils = entry.oils.filter(function (y) { return y !== x; });
    save(); render();
  });

  var plant = plantFor(x.oilId);

  var open = el('button', 'grow');
  open.type = 'button';
  open.style.cssText = 'background:none;border:0;text-align:left;padding:0;color:inherit;font:inherit;min-width:0';
  open.appendChild(el('span', 'name', plant ? plant.de : oil.de));
  if (oil.latin) open.appendChild(el('div', 'lat', oil.latin));
  var detail = rowDetail(x, oil, plant);
  if (detail) open.appendChild(el('div', 'tiny', detail));
  open.addEventListener('click', function () {
    location.hash = '#/oel/' + encodeURIComponent(oil.id);
  });

  return el('div', 'setrow' + (n ? ' n-' + n : ''), [glyph, open, drop]);
}

/* The line under the oil's name. An ungrouped oil, a Mischung or an own: oil
   keeps exactly what it always showed — family and what it is good for. A
   plant says who it can be bought from when nothing has narrowed it yet, or
   the chosen bottle's supplier and variety once a chip has; and when the
   bottles disagree on note or family and nothing has resolved that yet, it
   says so in a plain sentence rather than leaving a silent gap. */
function rowDetail(x, oil, plant) {
  if (!plant) {
    return [oil.familyDe, (oil.goodDe && oil.goodDe.length) ? oil.goodDe.slice(0, 2).join(', ') : null]
      .filter(Boolean).join(' · ');
  }
  if (x.bottleId) {
    var vid = bottleVariantId(oil, plant);
    var vlabel = vid ? capitalised(variantLabel(plant, vid) || '') : null;
    return [oil.supplier, vlabel].filter(Boolean).join(' · ');
  }
  var bits = [plant.suppliers.join(', ')];
  if (plant.split && plant.split.note) bits.push('Note je nach Anbieter unterschiedlich');
  else if (plant.split && plant.split.family) bits.push('Duftgruppe je nach Anbieter unterschiedlich');
  return bits.filter(Boolean).join(' · ');
}
function variantLabel(plant, id) {
  for (var i = 0; i < plant.variants.length; i++) if (plant.variants[i].id === id) return plant.variants[i].label;
  return null;
}
function bottleVariantId(bottle, plant) {
  var ids = variantIds(bottle);
  for (var i = 0; i < plant.variants.length; i++) if (ids.indexOf(plant.variants[i].id) >= 0) return plant.variants[i].id;
  return null;
}

/* Sorte and Anbieter, under the row — never required, so a fresh pick always
   shows a plant with no chip lit. A chip is on exactly when the bottle
   currently chosen carries it; tapping an on chip clears bottleId back to ''
   (tapping an active chip simply deselects it), and tapping an off one narrows
   to the first bottle that carries it, keeping whatever the other chip already
   chose when a bottle exists for both.

   Two lines, no labels over them: what the oil is on the first — Italien, rot,
   Bio — and who sells it on the second. Different questions, so different
   lines; headings over them would only repeat what the words already say. */
function chipsFor(x) {
  var plant = plantFor(x.oilId);
  if (!plant) return null;
  var bottle = x.bottleId ? byId(x.bottleId) : null;
  var kids = [];
  if (plant.variants.length) {
    kids.push(chipRow(null, plant.variants.map(function (v) {
      return { id: v.id, label: capitalised(v.label) };
    }), function (id) { return !!bottle && variantIds(bottle).indexOf(id) >= 0; },
      function (id) { toggleVariant(x, plant, id); }));
  }
  if (plant.suppliers.length >= 2) {
    kids.push(chipRow(null, plant.suppliers.map(function (s) { return { id: s, label: s }; }),
      function (id) { return !!bottle && bottle.supplier === id; },
      function (id) { toggleSupplier(x, plant, id); }));
  }
  if (!kids.length) return null;
  return el('div', 'setchips', kids);
}

/* Every value one bottle answers to as a variety — only what it declares,
   which is exactly what catalog.js built the chips out of, so a chip and the
   bottle behind it can never disagree. */
function variantIds(bottle) {
  return varietyOf(bottle).map(function (v) { return v.id; });
}

function toggleVariant(x, plant, id) {
  var bottle = x.bottleId ? byId(x.bottleId) : null;
  if (bottle && variantIds(bottle).indexOf(id) >= 0) { x.bottleId = ''; save(); render(); return; }
  var picked = pickBottle(plant, id, bottle ? bottle.supplier : null);
  x.bottleId = picked ? picked.id : '';
  save(); render();
}
function toggleSupplier(x, plant, id) {
  var bottle = x.bottleId ? byId(x.bottleId) : null;
  if (bottle && bottle.supplier === id) { x.bottleId = ''; save(); render(); return; }
  var picked = pickBottle(plant, bottle ? bottleVariantId(bottle, plant) : null, id);
  x.bottleId = picked ? picked.id : '';
  save(); render();
}
/* The first bottle carrying both wants, falling back to just the one that was
   actually tapped when no bottle carries both — a plant's bottles do not
   always cover every variety/supplier pair. */
function pickBottle(plant, wantVariant, wantSupplier) {
  var i;
  function fits(b, variant, supplier) {
    if (variant && variantIds(b).indexOf(variant) < 0) return false;
    if (supplier && b.supplier !== supplier) return false;
    return true;
  }
  if (wantVariant && wantSupplier) {
    for (i = 0; i < plant.bottles.length; i++) if (fits(plant.bottles[i], wantVariant, wantSupplier)) return plant.bottles[i];
  }
  if (wantVariant) {
    for (i = 0; i < plant.bottles.length; i++) if (fits(plant.bottles[i], wantVariant, null)) return plant.bottles[i];
  }
  if (wantSupplier) {
    for (i = 0; i < plant.bottles.length; i++) if (fits(plant.bottles[i], null, wantSupplier)) return plant.bottles[i];
  }
  return null;
}

function famDe(id) {
  var fs = families();
  for (var i = 0; i < fs.length; i++) if (fs[i].id === id) return fs[i].de;
  return id;
}

function addOil(id, round) {
  for (var i = 0; i < entry.oils.length; i++) if (entry.oils[i].oilId === id) return;
  entry.oils.push({ oilId: id, bottleId: '', ml: Store.prefs().defaultMl, round: round || 1 });
  save(); render();
}

function addCustom(name, round) {
  var oil = customOil(name);
  Store.putCustomOil(oil);
  invalidate();
  addOil(oil.id, round);
  notice('„' + name + '“ angelegt. Duftgruppe und Note kannst du unter Öle ergänzen.');
}

/* ── What would go with it ─────────────────────────────────────────────────
   Collapsed by default: a suggestion nobody asked for is one more thing on a
   screen that is already trying to fit four oils without scrolling. One tap
   opens it, and it stays open for the rest of this Aufguss. */
function suggestCard(oils) {
  if (!suggestOpen) {
    var toggle = el('button', 'btn quiet', 'Passende Öle vorschlagen');
    toggle.type = 'button';
    toggle.addEventListener('click', function () { suggestOpen = true; render(); });
    return toggle;
  }
  var hist = history();
  var fams = themeFamilies();
  var picks = suggest(oils, { history: hist, limit: 5, families: fams });
  if (!picks.length && fams.length) picks = suggest(oils, { history: hist, limit: 5 });
  if (!picks.length) return el('div');
  var rows = picks.map(function (p) {
    return oilRow(p.oil, {
      flat: true,
      sub: p.reasons.map(function (r) { return r.text; }).join(' · ') ||
        (p.oil.familyDe + ' · ' + noteName(leadNote(p.oil) || '')),
      onTap: function () { addOil(p.oil.id); },
    });
  });
  return card(oils.length ? 'Passt dazu' : 'Womit anfangen', rows.concat([
    el('p', 'tiny', oils.length
      ? 'Tippen fügt hinzu. Der Grund steht dabei — Note, Duftgruppe oder deine eigenen Aufgüsse.'
      : 'Ohne ein erstes Öl sind das deine Lieblinge und die, die du oft nimmst.'),
  ]));
}

/* ── Your own notes ──────────────────────────────────────────────────────── */
function notesCard() {
  var ta = el('textarea');
  ta.value = entry.notes || '';
  ta.placeholder = 'Wie war es? Zu scharf, zu wenig, die Gäste, das Wetter …';
  ta.addEventListener('input', function () { entry.notes = ta.value; save(); });

  var stars = el('div', 'chips');
  for (var i = 1; i <= 5; i++) (function (n) {
    var b = el('button', 'chip' + (entry.rating >= n ? ' on' : ''), '★');
    b.type = 'button';
    b.setAttribute('aria-label', n + ' von 5');
    b.addEventListener('click', function () {
      entry.rating = entry.rating === n ? 0 : n; save(); render();
    });
    stars.appendChild(b);
  })(i);

  return card('Notiz', [ta, field('Wie gut', stars)]);
}

/* While a field on this screen has focus, the foot is dead weight — Fertig
   and Zurück both just close the screen, and "‹ Zurück" in the head already
   does that — so the class trades it for scroll room the oil suggestions can
   use. A timeout on focusout, checked against where focus actually landed,
   is what keeps tabbing between two fields (or tapping a suggestion, which
   keeps focus on the input) from flickering the foot off and back on. */
function wireTyping() {
  var sc = $('scEntry');
  function isField(t) { return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'); }
  sc.addEventListener('focusin', function (ev) {
    if (isField(ev.target)) sc.className = 'screen typing';
  });
  sc.addEventListener('focusout', function () {
    setTimeout(function () {
      var a = document.activeElement;
      if (!isField(a)) sc.className = 'screen';
    }, 120);
  });
}

export function wire() { wireTyping(); }

export function currentId() { return entry ? entry.id : null; }
export function removeCurrent() {
  if (!entry) return;
  Store.removeEntry(entry.id);
  notice('Gelöscht.');
}
