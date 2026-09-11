/* 10. Mehr: getting the journal out of the phone, and saying where all this
   came from.

   The export exists because of the one thing this app cannot promise. Nothing
   leaves the phone, which also means nothing is anywhere else: clear the site
   data, reset the phone, and the journal is gone. A file you have saved is the
   whole backup story, and it is honest to say so on this screen rather than
   after the fact. */

import { $, el, clear, notice, todayISO, AppUpdate } from '../core/util.js';
import { Store } from '../core/store.js';
import { all, bottles, suppliers } from '../core/catalog.js';
import { RATIOS, DOSAGE } from '../core/blend.js';
import { card, field } from './parts.js';
import { RELEASE, RELEASES } from '../release.js';

export function render() {
  var body = $('moreBody');
  clear(body);

  var entries = Store.entries();
  var custom = Store.customOils();
  var favs = Store.favourites();

  body.appendChild(card('Dein Stand', [
    el('dl', 'kv', [
      el('dt', null, 'Aufgüsse'), el('dd', null, String(entries.length)),
      el('dt', null, 'Öle'), el('dd', null, all().length + ' (davon ' + custom.length + ' eigene)'),
      el('dt', null, 'Lieblinge'), el('dd', null, String(favs.length)),
    ]),
  ]));

  body.appendChild(card('Sichern', [
    el('p', 'prose small',
      'Alles steht nur auf diesem Gerät. Kein Konto, kein Server, keine Synchronisierung — ' +
      'und deshalb auch keine Kopie irgendwo anders. Lade dir ab und zu eine Sicherung ' +
      'herunter und lege sie irgendwohin, wo sie bleibt.'),
    exportButton(entries.length),
    importButton(),
  ]));

  body.appendChild(card('Voreinstellungen', prefsFields()));

  body.appendChild(card('Woher das Wissen kommt', [
    el('p', 'prose small',
      'Die ' + all().length + ' Einträge stehen für ' + bottles().length + ' Flaschen: ' +
      rangeSentence() + '. Gleiche Pflanze, mehrere Flaschen: die stehen als ein Öl ' +
      'da, und darunter steht, wer welche verkauft. Duftgruppe, Note und Beschreibung stehen so, wie es der jeweilige ' +
      'Anbieter schreibt — welcher es ist, steht auf dem Öl. Für eine fertige Mischung ' +
      'gibt niemand eine Note an, Purelia veröffentlicht für diese Linie überhaupt keine, ' +
      'und geraten wird hier nichts. Die botanischen Namen der Aromen-Öle sind von ' +
      'Wikidata, die der RBM-Öle von RBM selbst. Die Aufguss-Themen von Bäderlands ' +
      'eigenen Aufgussplänen. Die Regeln zum Mischen von vier Seiten, die alle in ' +
      'sources/blending.md stehen — mit dem Satz, aus dem sie kommen.'),
    el('p', 'prose small',
      'Nichts davon ist aus dem Kopf geschrieben, und nichts davon ist eine Wissenschaft. ' +
      'Wo etwas geschätzt ist, steht es dabei.'),
    linkP('Aromen — Einzelöle', 'https://www.aromen.be/de/shop/category/atherische-ole-einzelole-26'),
    linkP('RBM — Naturreine ätherische Öle', 'https://www.rbm-wellness.de/Naturreine-atherische-Ole-c134687002'),
    linkP('Purelia professional — ätherische Öle', 'https://schrader24.eu/portfolio/aetherische-oele/'),
    linkP('Bäderland — Aufgusspläne', 'https://www.baederland.de/wellness/aufgussplaene/'),
    linkP('Alle Quellen im Repository', 'https://github.com/JannikArndt/aufguss/tree/main/sources'),
  ]));

  body.appendChild(card('Daten prüfen', [
    el('p', 'prose small',
      'Drei Sortimente beschreiben teilweise dieselbe Pflanze, und nicht immer ' +
      'gleich. Wo sie sich widersprechen, steht beim Öl, was wer sagt — und ' +
      'hier steht alles zusammen, samt einem Text zum Weitergeben.'),
    checkButton(),
  ]));

  body.appendChild(card('Diese Version', [
    el('p', 'prose small', RELEASE.v + ' · ' + RELEASE.date),
    el('p', 'prose small', RELEASE.text),
    AppUpdate.ready ? updateCard() : null,
    Store.available ? null : el('p', 'prose small',
      'Achtung: dieses Gerät lässt den Speicher gerade nicht zu (' + Store.lastError +
      '). Was du eingibst, hält nur bis zum Schließen.'),
  ]));

  body.appendChild(changelogCard());
}

/* Counted off the data rather than written out, so the sentence cannot drift
   away from what is actually in src/data/ the next time a range is added. */
function rangeSentence() {
  var list = suppliers().map(function (s) { return s.n + ' von ' + s.id; });
  var last = list.pop();
  return list.length ? list.join(', ') + ' und ' + last : last;
}

function checkButton() {
  var b = el('button', 'btn quiet', 'Widersprüche ansehen');
  b.addEventListener('click', function () { location.hash = '#/pruefen'; });
  return b;
}

/* The current version in full above; a few before it in short, so "was hat
   sich geändert" doesn't mean leaving the app. Everything older than that is
   what CHANGELOG.md in the repository is for. */
function changelogCard() {
  var older = RELEASES.slice(1, 4);
  if (!older.length) return el('div');
  return card('Frühere Versionen', older.map(function (r) {
    return el('p', 'prose small', r.v + ' · ' + r.date + ' — ' + r.text);
  }).concat([
    linkP('Ganzer Changelog im Repository', 'https://github.com/JannikArndt/aufguss/blob/main/CHANGELOG.md'),
  ]));
}

/* Only shown once a new version has actually finished downloading in the
   background. Tapping it is the one thing that ever makes the worker skip
   its wait — see sw.js's 'message' handler. */
function updateCard() {
  var b = el('button', 'btn primary', 'Update jetzt laden');
  b.addEventListener('click', function () { AppUpdate.apply(); });
  return el('div', null, [
    el('p', 'prose small', 'Eine neue Version ist heruntergeladen und wartet.'),
    b,
  ]);
}

function prefsFields() {
  var p = Store.prefs();

  var venue = el('input');
  venue.type = 'text'; venue.value = p.venue;
  venue.addEventListener('change', function () { Store.setPref('venue', venue.value); });

  var ratio = el('select');
  RATIOS.forEach(function (r) {
    var o = new Option(r.label + ' — ' + r.de, r.id);
    if (p.ratio === r.id) o.selected = true;
    ratio.appendChild(o);
  });
  ratio.addEventListener('change', function () { Store.setPref('ratio', ratio.value); });

  var ml = el('input');
  ml.type = 'number'; ml.min = '0.5'; ml.max = '10'; ml.step = '0.5';
  ml.inputMode = 'decimal'; ml.value = String(p.defaultMl);
  ml.addEventListener('change', function () {
    var v = parseFloat(ml.value.replace(',', '.'));
    if (isFinite(v)) Store.setPref('defaultMl', v);
  });

  return [
    field('Sauna', venue),
    field('Verhältnis', ratio, 'Womit ein neuer Aufguss aufmacht.'),
    field('Menge pro Öl', ml, 'Millilitre, voreingestellt beim Hinzufügen. Üblich sind ' +
      DOSAGE.mlPerOil[0] + '–' + DOSAGE.mlPerOil[1] + '.'),
  ];
}

function exportButton(n) {
  var b = el('button', 'btn primary', 'Sicherung herunterladen');
  b.disabled = !n;
  b.addEventListener('click', function () {
    var data = Store.exportAll();
    var blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = el('a');
    a.href = url;
    a.download = 'aufguss-' + todayISO() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    notice(n + ' Aufgüsse gesichert.');
  });
  return b;
}

/* Import merges rather than replaces, so an old backup can never delete an
   Aufguss written since it was made. */
function importButton() {
  var input = el('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.style.display = 'none';
  input.addEventListener('change', function () {
    var f = input.files && input.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var res = Store.importAll(JSON.parse(String(r.result)));
        notice(res.added + ' neu, ' + res.updated + ' aktualisiert.');
        render();
      } catch (e) {
        notice(e && e.message ? e.message : 'Die Datei ließ sich nicht lesen.');
      }
      input.value = '';
    };
    r.onerror = function () { notice('Die Datei ließ sich nicht lesen.'); };
    r.readAsText(f);
  });
  var b = el('button', 'btn quiet', 'Sicherung einlesen');
  b.addEventListener('click', function () { input.click(); });
  return el('div', null, [b, input]);
}

function linkP(text, href) {
  var a = el('a', 'link small', text);
  a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
  return el('p', null, a);
}
