/* The version stamp. There is no build step, so this is what says which copy
   of the app a phone is running — and it has to match VERSION in sw.js, or the
   update never installs. tools/smoke.mjs asserts that they agree.

   Write the note for someone who has never read the code. */
export var RELEASE = {
  v: '0.2.1',
  date: '2026-09-09',
  text: 'Update jetzt: unter Mehr wartet eine neue Version, statt bis zum ' +
        'nächsten Kaltstart, wenn du sie so haben willst. Und ein Changelog, ' +
        'falls dich interessiert, was sich seit wann geändert hat.',
};
