/* The version stamp. There is no build step, so this is what says which copy
   of the app a phone is running — and RELEASES[0].v has to match VERSION in
   sw.js, or the update never installs. tools/smoke.mjs asserts that they
   agree.

   Newest first, same as the journal. Mehr shows the latest in full and a few
   before it in short — CHANGELOG.md has the whole history past that, since a
   phone screen is not the place for it.

   Write each note for someone who has never read the code. */
export var RELEASES = [
  { v: '0.4.0', date: '2026-09-10',
    text: '81 Öle von RBM kommen dazu, also 214 insgesamt. Auf jedem Öl steht ' +
          'jetzt, von wem es ist — beide Sortimente haben eine Zitrone, und das ' +
          'sind zwei Fläschchen, nicht eins. Bei den RBM-Ölen steht außerdem, ' +
          'wonach sie riechen und womit sie laut RBM zusammengehen. Unter Öle ' +
          'kannst du nach Anbieter filtern.' },
  { v: '0.3.1', date: '2026-09-10',
    text: 'Die Kopf-, Herz- und Kellen-Icons sind jetzt eigene Formen statt ' +
          'Emoji — ein Kopf, ein Herz, und die Kelle sieht jetzt auch wie eine ' +
          'aus.' },
  { v: '0.3.0', date: '2026-09-09',
    text: 'Die Öl-Liste ist aufgeräumt: kein ml-Feld mehr, Icons statt Wörtern ' +
          'für Kopf-, Herz- und Basisnote, ein Strich zwischen Kugeln statt ' +
          'zwischen jedem Öl. „Passende Öle vorschlagen“ fragt erst, statt sich ' +
          'aufzudrängen. Beim letzten Mal zeigt bis zu fünf frühere Male, nicht ' +
          'nur das letzte, und bleibt weg, wenn es keins gibt. Mischen ist raus — ' +
          'der Tab hat sich nie gelohnt. Stärke zeigt jetzt eine kleine Kelle ' +
          'statt eines Löffels. Und der Tastatur-Sprung beim Tippen ist kleiner.' },
  { v: '0.2.1', date: '2026-09-09',
    text: 'Update jetzt: unter Mehr wartet eine neue Version, statt bis zum ' +
          'nächsten Kaltstart, wenn du sie so haben willst. Und ein Changelog, ' +
          'falls dich interessiert, was sich seit wann geändert hat.' },
  { v: '0.2.0', date: '2026-09-08',
    text: 'Aufgüsse statt Journal. Öle gehen jetzt rundenweise auf die Eiskugel, ' +
          'Stärke wird in Kellen angezeigt, die Duftgruppen brechen um statt zu ' +
          'scrollen, und die Öl-Seite merkt sich die Scrollposition beim Zurückgehen.' },
  { v: '0.1.0', date: '2026-09-08',
    text: 'Erste Fassung. Journal, 133 Öle von Aromen mit Duftgruppe, Note und ' +
          'Beschreibung, 62 Aufguss-Themen aus Bäderlands Plänen, Vorschläge aus ' +
          'Note, Duftgruppe und deinem eigenen Journal.' },
];
export var RELEASE = RELEASES[0];
