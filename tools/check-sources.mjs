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
const { OILS_RBM } = await import('../src/data/oils-rbm.js');

const CATEGORY = 'https://www.aromen.be/de/shop/category/atherische-ole-einzelole-26';
const PLAN = 'https://www.baederland.de/media/kaifu-bad_aufgussplan_web.pdf';
const RBM_SITEMAP = 'https://www.rbm-wellness.de/sitemap.xml';
const RBM_API = 'https://eu-fra4-storefront-api.ecwid.com/storefront/api/v1/75784548/catalog/products';
/* The six RBM categories the app carries. "Sonstiges" is hardware and courses
   and is not in the catalogue — see sources/oils-rbm.md. */
const RBM_CATS = new Set(['Hölzer', 'Kräuter', 'Citrus', 'Gewürze', 'Blumen', 'Mischungen']);
/* Two names that would otherwise be reported every single run, both explained
   in sources/oils-rbm.md and sources/open-questions.md. */
const RBM_ONE_BLEND_TWO_LISTINGS = 'Kolanuss-Orange';   /* the 1000 ml page of Kola-Nuss-Orange */
const RBM_PRICE_LIST_ONLY = 'Ringelblume';              /* on the price list, not in the shop */

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

/* ── The RBM oils ────────────────────────────────────────────────────────── */
/* Their shop is a JavaScript storefront: the product pages carry nothing a
   fetch can read. What does answer is the storefront's own product endpoint,
   which takes a list of product ids and gives back the description each page
   renders. The ids come out of the site's sitemap, which is plain XML. */
say('');
say('RBM — Naturreine ätherische Öle');
try {
  const xml = await (await fetch(RBM_SITEMAP, { headers: { 'user-agent': 'aufguss/check-sources' } })).text();
  const ids = [...new Set([...xml.matchAll(/<loc>[^<]*-p(\d+)<\/loc>/g)].map((m) => Number(m[1])))];
  if (!ids.length) throw new Error('the sitemap listed no products');

  const items = [];
  for (let i = 0; i < ids.length; i += 25) {
    const res = await fetch(RBM_API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'user-agent': 'aufguss/check-sources' },
      body: JSON.stringify({ lang: 'de', productIds: ids.slice(i, i + 25) }),
    });
    if (!res.ok) throw new Error('the storefront answered ' + res.status);
    items.push(...((await res.json()).items || []));
  }

  /* One product per size, so the same oil comes back three or four times. */
  const onSite = new Map();
  for (const it of items) {
    const path = (it.categoryPaths?.[0]?.categoryPath || []).map((c) => c.name).filter(Boolean);
    if (!RBM_CATS.has(path[path.length - 1])) continue;
    const name = it.name.trim();
    if (name === RBM_ONE_BLEND_TWO_LISTINGS) continue;
    onSite.set(name, it.description || '');
  }
  const have = new Map(OILS_RBM.map((o) => [o.de, o]));
  const fresh = [...onSite.keys()].filter((n) => !have.has(n));
  const gone = [...have.keys()].filter((n) => !onSite.has(n) && n !== RBM_PRICE_LIST_ONLY);
  const singles = OILS_RBM.filter((o) => !o.blend).length;
  say('  ' + onSite.size + ' entries on the site, ' + singles + ' single oils and ' +
      (OILS_RBM.length - singles) + ' Mischungen in src/data/oils-rbm.js');
  if (fresh.length) flag('new since 10 September 2026: ' + fresh.join(', '));
  if (gone.length) flag('no longer listed: ' + gone.join(', '));
  /* Ringelblume is only in the app because the price list has it. If it turns
     up in the shop, it can stop being the one entry without a URL. */
  if (onSite.has(RBM_PRICE_LIST_ONLY)) {
    flag(RBM_PRICE_LIST_ONLY + ' is in the shop now — it can get a URL and a Zusammensetzung');
  }

  /* The note and the botanical name of a single oil are read out of its
     description, and a Mischung is nothing but its Zusammensetzung line, so a
     rewritten description is worth knowing about even when the range has not
     moved. */
  const drift = [];
  for (const [name, oil] of have) {
    const d = onSite.get(name);
    if (d == null) continue;
    /* Their labelled fields are one per line, so the line breaks have to
       survive the tag stripping — flattening first turns Nautilust's two
       composition lines into one and reports a change every run. */
    const lines = d
      .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (oil.blend) {
      const comp = lines.filter((l) => /^(Zusammensetzung|Besteht aus|Bestehend aus)\s*:?/i.test(l));
      const now = comp.length
        ? comp[comp.length - 1].replace(/^(Zusammensetzung|Besteht aus|Bestehend aus)\s*:?\s*/i, '').trim()
        : '';
      if (now !== oil.parts) {
        drift.push(name + ': Zusammensetzung now "' + now + '", was "' + oil.parts + '"');
      }
      continue;
    }
    const line = lines.find((l) => /^Botanischer Name\s*:?/i.test(l)) || '';
    const latin = line.replace(/^Botanischer Name\s*:?\s*/i, '').trim();
    if (latin !== oil.latin) {
      drift.push(name + ': botanisch now "' + latin + '", was "' + oil.latin + '"');
    }
  }
  if (drift.length) flag('descriptions have been edited: ' + drift.join('; '));
  if (!fresh.length && !gone.length && !drift.length) say('  nothing has moved');
} catch (e) {
  flag('could not read the RBM range: ' + e.message);
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
