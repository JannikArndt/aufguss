/* The version stamp. There is no build step, so this is what says which copy
   of the app a phone is running — and it has to match VERSION in sw.js, or the
   update never installs. tools/smoke.mjs asserts that they agree.

   Write the note for someone who has never read the code. */
export var RELEASE = {
  v: '0.1.0',
  date: '2026-09-08',
  text: 'Erste Fassung. Journal, 133 Öle von Aromen mit Duftgruppe, Note und ' +
        'Beschreibung, 62 Aufguss-Themen aus Bäderlands Plänen, Vorschläge aus ' +
        'Note, Duftgruppe und deinem eigenen Journal.',
};
