/* The version stamp. There is no build step, so this is what says which copy
   of the app a phone is running — and RELEASES[0].v has to match VERSION in
   sw.js, or the update never installs. tools/smoke.mjs asserts that they
   agree.

   Newest first, same as the journal. Mehr shows the latest in full and a few
   before it in short — CHANGELOG.md has the whole history past that, since a
   phone screen is not the place for it.

   Write each note for someone who has never read the code. */
export var RELEASES = [
  { v: '0.9.0', date: '2026-09-12',
    text: 'Das Öl heißt jetzt so, wie du es nennst. „Spearmint“, „Grüne ' +
          'Minze“, „Mentha spicata“ und „Ährige Minze“ finden alle dieselbe ' +
          'Krauseminze, und die drei Minzen bleiben drei — Pfefferminze, ' +
          'Krauseminze und die schlichte Minze sind botanisch drei Arten, und ' +
          'danach sind sie sortiert. 25 botanische Namen waren bei den ' +
          'Anbietern schlicht falsch: RBM führte sein chinesisches Zedernholz ' +
          'als Weihrauch. Die stehen jetzt richtig da, mit „korrigiert“ ' +
          'dahinter. Neu als Chip: Bio, bei den 70 Aromen-Ölen, die selbst so ' +
          'heißen. Weg sind die Mischverhältnisse — vier Seiten empfahlen vier ' +
          'verschiedene, und keins davon hat je geholfen, einen Aufguss ' +
          'aufzuschreiben.' },
  { v: '0.8.0', date: '2026-09-11',
    text: 'Ein drittes Sortiment ist dazugekommen: Purelia, 40 Öle und 7 ' +
          'Mischungen. Purelia schreibt zu seinen Ölen nichts weiter — keine ' +
          'Duftgruppe, keine Note, keinen botanischen Namen — und das steht ' +
          'jetzt so da, statt dass irgendwer es sich ausdenkt. Dafür weiß ' +
          'jede Flasche jetzt selbst, welche Pflanze sie ist und was an ihr ' +
          'die Sorte ist: Herkunft, Reife, Gewinnung. Du suchst den Namen, ' +
          'siehst darunter die Sorten („Grün | Orange | Rot“) und tippst ' +
          'danach Sorte und Anbieter an, wenn du magst. Die Mischung als ' +
          'eigener Abschnitt ist weg, und der Satz über die Kelle auch. Neu ' +
          'unter Mehr: Daten prüfen — dort steht jeder Widerspruch zwischen ' +
          'den drei Anbietern, mit einem Text zum Weitergeben.' },
  { v: '0.7.0', date: '2026-09-11',
    text: 'Du suchst jetzt das Öl, nicht die Flasche. „Mandarine“ steht einmal ' +
          'in der Liste statt dreimal, und das reicht auch — Sorte und Anbieter ' +
          'kannst du danach unter dem Öl antippen, musst du aber nicht. Aus 239 ' +
          'Einträgen sind so 172 geworden. Wo Aromen und RBM sich uneinig sind, ' +
          'steht das jetzt da: Kampfer ist bei Aromen eine Kopfnote und bei RBM ' +
          'eine Herznote, und das Öl sagt beides, statt sich für eins zu ' +
          'entscheiden. Aufgüsse, die du vorher aufgeschrieben hast, zeigen ' +
          'weiterhin genau die Flasche, die drin stand.' },
  { v: '0.6.1', date: '2026-09-11',
    text: 'Das Suchfeld rutschte beim Antippen unter den Notch und ließ ein ' +
          'leeres Stück über der Tastatur stehen — iOS hat die Seite selbst ' +
          'gescrollt, obwohl sie das nicht soll. Jetzt bewegt sich nur noch ' +
          'die Liste, und nur so weit, wie das, was gefunden wurde, auch ' +
          'wirklich braucht.' },
  { v: '0.6.0', date: '2026-09-11',
    text: 'Die Ölsuche im Aufguss hat jetzt Platz. Fertig geht zur Seite, ' +
          'solange du tippst — Zurück oben macht dasselbe —, das Suchfeld ' +
          'rutscht nach oben, und die Vorschläge bekommen alles darunter statt ' +
          'zwei Zeilen über der Tastatur. Zwölf Treffer statt acht. Und wo es ' +
          'etwas zu wählen gibt, stehen über der Liste Knöpfe dafür: bei ' +
          '„Minze“ chinesisch, indisch, japanisch, bei „Zitrone“ Aromen und ' +
          'RBM. Tippen grenzt ein, nochmal tippen nimmt es zurück, und wer ' +
          'nichts antippt, sieht wie immer alles.' },
  { v: '0.5.1', date: '2026-09-10',
    text: 'Aromen hat sein Sortiment geändert: Kampfer gibt es dort wieder, und ' +
          'aus „Krauseminze / Grüne Minze“ sind zwei Öle geworden. Beides ist ' +
          'jetzt drin, also 239 Einträge. Aufgüsse, in denen die alte Krauseminze ' +
          'steht, zeigen sie weiterhin an.' },
  { v: '0.5.0', date: '2026-09-10',
    text: 'Die 23 fertigen Mischungen von RBM sind jetzt auch dabei — 1001 Nacht, ' +
          'Blue Ice, Heublume und die anderen —, mit der Zusammensetzung, wie RBM ' +
          'sie angibt. Eine Note haben sie nicht: RBM gibt für Mischungen keine ' +
          'an, und geraten wird hier nichts. Sie zählen deshalb in der Verteilung ' +
          'nicht mit, stehen als „ohne Note“ neben dem Balken und kommen zuletzt ' +
          'in die Kelle.' },
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
