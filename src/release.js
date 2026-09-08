/* The version stamp. There is no build step, so this is what says which copy
   of the app a phone is running — and it has to match VERSION in sw.js, or the
   update never installs. tools/smoke.mjs asserts that they agree.

   Write the note for someone who has never read the code. */
export var RELEASE = {
  v: '0.2.0',
  date: '2026-09-08',
  text: 'Aufgüsse statt Journal. Öle gehen jetzt rundenweise auf die Eiskugel, ' +
        'Stärke wird in Kellen angezeigt, die Duftgruppen brechen um statt zu ' +
        'scrollen, und die Öl-Seite merkt sich die Scrollposition beim Zurückgehen.',
};
