/* 6. One Aufguss: the screen the app exists for.

   The shortest way through it is the one the brief describes — pick a theme,
   type three oil names, done. Everything else on this screen is optional and
   sits below that: what the notes add up to, what order to pour them in, what
   you did last time under the same theme, and what would go with what you have
   so far.

   It saves as you go. There is no Save button and no draft that can be lost by
   locking the phone, because the one thing worse than a clumsy journal is one
   that quietly throws away the Aufguss you just poured. The foot carries
   "Fertig", which only closes the screen. */

import { $, el, clear, uid, todayISO, nearestHour, agoText, notice } from '../core/util.js';
import { Store } from '../core/store.js';
import { byId, search, why, customOil, invalidate, noteName, families } from '../core/catalog.js';
import { THEMES, INTENSITIES } from '../data/themes.js';
import { RATIOS, DOSAGE, pourOrder, balance, remarks, drops, leadNote } from '../core/blend.js';
import { suggest, history } from '../core/suggest.js';
import { oilRow, balanceBar, autocomplete, field, card } from './parts.js';

var entry = null;      /* the one being edited */
var isNew = false;
var onClose = null;

export function open(id, opts) {
  var o = opts || {};
  onClose = o.onClose || function () {};
  isNew = !id;
  entry = id ? Store.entry(id) : null;
  if (!entry) {
    entry = {
      id: uid(),
      date: todayISO(), time: nearestHour(),
      theme: '', themeKind: '', intensity: '', sauna: Store.prefs().venue,
      oils: [], ratio: Store.prefs().ratio, notes: '', rating: 0,
      written: new Date().toISOString(),
    };
    if (o.oils) entry.oils = o.oils.slice();
    if (o.theme) applyTheme(o.theme);
  }
  $('entryTitle').textContent = isNew ? 'Neuer Aufguss' : (entry.theme || 'Aufguss');
  $('entryDelete').hidden = isNew;
  render();
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
  var oils = entry.oils.map(function (x) { return byId(x.oilId); }).filter(Boolean);

  body.appendChild(whenAndWhat());
  body.appendChild(lastTimeCard());
  body.appendChild(oilsCard(oils));
  if (oils.length) body.appendChild(setCard(oils));
  if (oils.length < 6) body.appendChild(suggestCard(oils));
  body.appendChild(notesCard());

  var foot = $('entryFoot');
  clear(foot);
  var done = el('button', 'btn primary', isNew ? 'Fertig' : 'Zurück zum Journal');
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
    var c = el('button', 'chip' + (entry.intensity === iv.id ? ' on' : ''), iv.de);
    c.type = 'button';
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
      lead: t.intensity ? el('span', 'pill ' + t.intensity, t.intensity) : null,
    };
  });
}

/* ── What you did last time under this theme ─────────────────────────────── */
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
  var prev = null, list = Store.entries();
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === entry.id) continue;
    if (list[i].theme && list[i].theme.toLowerCase() === entry.theme.toLowerCase()) { prev = list[i]; break; }
  }
  if (!prev) {
    wrap.appendChild(card('Beim letzten Mal', [
      el('p', 'prose', 'Noch nie unter diesem Thema aufgeschrieben.'),
    ]));
    return wrap;
  }
  var names = (prev.oils || []).map(function (x) {
    var o = byId(x.oilId); return o ? o.de : null;
  }).filter(Boolean);
  var again = el('button', 'btn quiet', 'Dieselben Öle übernehmen');
  again.addEventListener('click', function () {
    entry.oils = (prev.oils || []).slice().map(function (x) { return { oilId: x.oilId, ml: x.ml }; });
    save(); render(); notice('Übernommen. Ändern geht natürlich noch.');
  });
  wrap.appendChild(card('Beim letzten Mal · ' + agoText(prev.date), [
    el('p', 'prose', names.length ? names.join(', ') : 'Keine Öle notiert.'),
    prev.notes ? el('p', 'prose small', '„' + prev.notes + '“') : null,
    names.length ? again : null,
  ]));
  return wrap;
}

/* ── The oils ────────────────────────────────────────────────────────────── */
function oilsCard(oils) {
  var input = el('input');
  input.type = 'search';
  input.placeholder = oils.length ? 'Noch ein Öl …' : 'Öl suchen — Name, Latein, Duftgruppe';
  input.autocomplete = 'off';
  var oilAc = autocomplete(input, {
    find: function (q) {
      var chosen = entry.oils.map(function (x) { return x.oilId; });
      var hits = search(q, { limit: 8, exclude: chosen });
      var rows = hits.map(function (o) {
        var reason = why(o, q);
        return {
          title: o.de, value: o,
          sub: [o.familyDe, noteName(leadNote(o) || ''), reason && reason !== o.de ? reason : null]
            .filter(Boolean).join(' · '),
          lead: el('i', 'note-dot' + (leadNote(o) ? ' note-' + leadNote(o) : '')),
        };
      });
      rows.push({ title: '„' + q + '“ als eigenes Öl anlegen', value: { newOil: q }, sub: 'Kommt in deine Liste' });
      return rows;
    },
    onPick: function (v) {
      if (v.newOil) { addCustom(v.newOil); return; }
      addOil(v.id);
      input.value = '';
    },
  });

  var rows = el('div');
  var ordered = pourOrder(oils);
  ordered.forEach(function (oil, i) {
    rows.appendChild(setRow(oil, i + 1, ordered.length));
  });

  var fams = themeFamilies();
  return card('Öle', [
    fams.length ? el('p', 'tiny', 'Der Plan sagt zu diesem Thema: ' +
      fams.map(famDe).join(' oder ') + '.') : null,
    rows,
    field(null, oilAc.node),
    oils.length ? el('p', 'tiny', 'In dieser Reihenfolge in die Kelle: Basis zuerst und sparsam, dann Herz, dann Kopf.') : null,
  ]);
}

function setRow(oil, step, total) {
  var rec = null;
  for (var i = 0; i < entry.oils.length; i++) if (entry.oils[i].oilId === oil.id) rec = entry.oils[i];
  var n = leadNote(oil);

  var ml = el('input');
  ml.type = 'number'; ml.min = '0'; ml.max = '20'; ml.step = '0.5';
  ml.inputMode = 'decimal';
  ml.value = rec && rec.ml != null ? String(rec.ml) : '';
  ml.placeholder = 'ml';
  ml.setAttribute('aria-label', 'Milliliter ' + oil.de);
  ml.addEventListener('change', function () {
    var v = parseFloat(ml.value.replace(',', '.'));
    rec.ml = isFinite(v) ? v : null;
    save(); refreshSet();
  });

  var drop = el('button', 'drop', '×');
  drop.type = 'button';
  drop.setAttribute('aria-label', oil.de + ' entfernen');
  drop.addEventListener('click', function () {
    entry.oils = entry.oils.filter(function (x) { return x.oilId !== oil.id; });
    save(); render();
  });

  var open = el('button', 'grow');
  open.type = 'button';
  open.style.cssText = 'background:none;border:0;text-align:left;padding:0;color:inherit;font:inherit;min-width:0';
  open.appendChild(el('span', 'name', oil.de));
  if (oil.latin) open.appendChild(el('div', 'lat', oil.latin));
  open.appendChild(el('div', 'tiny', [
    noteName(n || '') || 'Note unbekannt',
    oil.noteEstimated ? ' (geschätzt)' : '',
    oil.familyDe ? ' · ' + oil.familyDe : '',
    (oil.goodDe && oil.goodDe.length) ? ' · ' + oil.goodDe.slice(0, 2).join(', ') : '',
  ].join('')));
  open.addEventListener('click', function () {
    location.hash = '#/oel/' + encodeURIComponent(oil.id);
  });

  return el('div', 'setrow' + (n ? ' n-' + n : ''), [
    el('span', 'step', String(step)),
    open,
    el('span', 'ml', [ml, el('div', 'tiny unit', 'ml')]),
    drop,
  ]);
}

function famDe(id) {
  var fs = families();
  for (var i = 0; i < fs.length; i++) if (fs[i].id === id) return fs[i].de;
  return id;
}

function addOil(id) {
  for (var i = 0; i < entry.oils.length; i++) if (entry.oils[i].oilId === id) return;
  entry.oils.push({ oilId: id, ml: Store.prefs().defaultMl });
  save(); render();
}

function addCustom(name) {
  var oil = customOil(name);
  Store.putCustomOil(oil);
  invalidate();
  addOil(oil.id);
  notice('„' + name + '“ angelegt. Duftgruppe und Note kannst du unter Öle ergänzen.');
}

/* ── What the set adds up to ─────────────────────────────────────────────── */
function refreshSet() {
  var old = $('setCard');
  if (!old) return;
  var oils = entry.oils.map(function (x) { return byId(x.oilId); }).filter(Boolean);
  old.parentNode.replaceChild(setCard(oils), old);
}
function setCard(oils) {
  var totalMl = entry.oils.reduce(function (s, x) { return s + (x.ml || 0); }, 0);
  var bal = balance(oils, entry.ratio);

  var ratios = el('div', 'chips', RATIOS.map(function (r) {
    var c = el('button', 'chip' + (entry.ratio === r.id ? ' on' : ''), r.label);
    c.type = 'button';
    c.title = r.de;
    c.addEventListener('click', function () {
      entry.ratio = r.id; Store.setPref('ratio', r.id); save(); render();
    });
    return c;
  }));

  var d = drops(entry.ratio, 10);
  var wrap = card('Die Mischung', [
    balanceBar(bal),
    ratios,
    el('p', 'tiny', bal.ratio.de + ' — ' + bal.ratio.note +
      ' Auf 10 Tropfen: ' + d.top + ' Kopf, ' + d.heart + ' Herz, ' + d.base + ' Basis.'),
    el('div', 'prose small', remarks(oils, entry.ratio, totalMl).map(function (r) {
      return el('p', null, r.text);
    })),
    el('p', 'tiny', 'Zur Orientierung: ' + DOSAGE.dropsPerLitre[0] + '–' + DOSAGE.dropsPerLitre[1] +
      ' Tropfen pro Liter Aufgusswasser (saunawelt-oso.de). Was auf die Steine kommt, entscheidest du.'),
  ]);
  wrap.id = 'setCard';
  return wrap;
}

/* ── What would go with it ───────────────────────────────────────────────── */
function suggestCard(oils) {
  var hist = history();
  var fams = themeFamilies();
  var picks = suggest(oils, entry.ratio, { history: hist, limit: 5, families: fams });
  if (!picks.length && fams.length) picks = suggest(oils, entry.ratio, { history: hist, limit: 5 });
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
      ? 'Tippen fügt hinzu. Der Grund steht dabei — Note, Duftgruppe oder dein eigenes Journal.'
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

export function currentId() { return entry ? entry.id : null; }
export function removeCurrent() {
  if (!entry) return;
  Store.removeEntry(entry.id);
  notice('Gelöscht.');
}
