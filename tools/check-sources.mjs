/* Are the sources still saying what sources/ says they said?

     node tools/check-sources.mjs

   A shop changes its range and a sauna changes its plan. Everything in
   src/data/ was read off a live page on 8 September 2026, and the only honest
   way to keep that true is to go and look again. This does not update
   anything — it reports, and a person decides.

   It is the one thing in this repository that touches the network, it is not
   part of the app, and it is not run by CI: it would fail on a bad day at
   Bäderland rather than on a bad commit. Run it when the data feels stale.

   No dependencies. The PDF part needs one — reading the intensity icons off
   the Aufgussplan means parsing PDF drawing operators — so it is not attempted
   here; the plan is checked for having changed at all, by its length and its
   "Stand:" line, which is what actually moves. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { OILS } = await import('../src/data/oils.js');

const CATEGORY = 'https://www.aromen.be/de/shop/category/atherische-ole-einzelole-26';
const PLAN = 'https://www.baederland.de/media/kaifu-bad_aufgussplan_web.pdf';

let notes = 0;
function say(line) { console.log(line); }
function flag(line) { notes++; console.log('  ! ' + line); }

/* ── The oils ────────────────────────────────────────────────────────────── */
say('Aromen — Einzelöle');
const seen = new Set();
for (let page = 1; page <= 30; page++) {
  const url = page === 1 ? CATEGORY + '?order=name+asc'
    : CATEGORY + '/page/' + page + '?order=name+asc';
  let html;
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'aufguss/check-sources' } });
    if (!res.ok) { flag('page ' + page + ' answered ' + res.status); break; }
    html = await res.text();
  } catch (e) {
    flag('could not reach the shop: ' + e.message);
    break;
  }
  const hrefs = [...html.matchAll(/href="\/de\/shop\/atherische-ole-einzelole-26\/([^"]+)"/g)]
    .map((m) => m[1]);
  if (!hrefs.length) break;
  for (const h of hrefs) {
    const slug = h
      .replace(/-(100ml|50ml|30ml|11ml|10ml|5ml|130gr)(-bio)?-\d+$/, '')
      .replace(/-\d+$/, '');
    seen.add(slug);
  }
  if (!/\/page\/(\d+)/.test(html) && page > 1) break;
}

if (seen.size) {
  const have = new Set(OILS.map((o) => o.id));
  /* The catalogue keeps one entry per article; the shop lists one URL per
     size, and a couple of articles differ only by a title variant. So a slug
     the catalogue does not carry is only interesting if nothing with the same
     article code is there either. */
  const codeOf = (slug) => (/^([a-z]+\d*[a-z]*)/.exec(slug) || [, slug])[1].toUpperCase();
  const codes = new Set(OILS.map((o) => o.code));
  const fresh = [...seen].filter((s) => !have.has(s) && !codes.has(codeOf(s)));
  const gone = [...have].filter((id) => !seen.has(id));
  say('  ' + seen.size + ' articles on the site, ' + OILS.length + ' oils in src/data/oils.js');
  if (fresh.length) flag('new since 8 September 2026: ' + fresh.join(', '));
  if (gone.length) flag('no longer listed: ' + gone.join(', '));
  if (!fresh.length && !gone.length) say('  nothing has moved');
}

/* ── The Kaifubad plan ───────────────────────────────────────────────────── */
say('');
say('Bäderland — Kaifubad Aufgussplan');
try {
  const res = await fetch(PLAN, { headers: { 'user-agent': 'aufguss/check-sources' } });
  if (!res.ok) {
    flag('the plan answered ' + res.status + ' — the file may have been renamed');
  } else {
    const buf = Buffer.from(await res.arrayBuffer());
    const KNOWN_BYTES = 274887;             /* the file as read on 8 Sep 2026 */
    const KNOWN_STAND = 'Stand: 05/2026';
    const ascii = buf.toString('latin1');
    const stand = /Stand: (\d\d\/\d{4})/.exec(ascii);
    say('  ' + buf.length + ' bytes' + (stand ? ', ' + stand[0] : ''));
    if (buf.length !== KNOWN_BYTES) {
      flag('the file has changed since sources/aufgussplan.md was written — ' +
        're-read it (render the page, then re-run the icon extraction described there)');
    }
    if (stand && stand[0] !== KNOWN_STAND) flag('the plan is now ' + stand[0]);
    if (buf.length === KNOWN_BYTES) say('  byte-identical to what was read');
  }
} catch (e) {
  flag('could not reach the plan: ' + e.message);
}

/* ── The blending pages ──────────────────────────────────────────────────── */
say('');
say('The blending sources');
const PAGES = [
  ['aroma1x1 — mixing order and 30-50-20', 'https://www.aroma1x1.com/aetherische-oele-mischen/'],
  ['Floria — ratios and the family table', 'https://www.floria-natural.com/blogs/wissen/atherische-ole-mischen'],
  ['Saunawelt OSO — drops per litre', 'https://saunawelt-oso.de/2025/03/05/mischen-von-saunaaufguessen/'],
  ['Maitreya Natura — which note a family is', 'https://www.maitreya-natura.com/de/aetherische-oele-duftnoten.html'],
];
for (const [what, url] of PAGES) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'aufguss/check-sources' } });
    say('  ' + (res.ok ? 'still there' : res.status + ' !') + '  ' + what);
    if (!res.ok) notes++;
  } catch (e) {
    flag('unreachable: ' + what + ' (' + e.message + ')');
  }
}

say('');
say(notes ? notes + ' thing(s) to look at. sources/ says what each was read for.'
          : 'Nothing has moved. sources/ is still true.');
