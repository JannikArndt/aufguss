/* 0. The small things everything else uses. */

export function $(id) { return document.getElementById(id); }

/* Build an element from a tag, an optional class, and children that are either
   strings or elements. Terser than innerHTML and it cannot be fooled by an oil
   whose name happens to contain a bracket. */
export function el(tag, cls, kids) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (kids == null) return n;
  if (!Array.isArray(kids)) kids = [kids];
  for (var i = 0; i < kids.length; i++) {
    var k = kids[i];
    if (k == null || k === false) continue;
    n.appendChild(typeof k === 'string' || typeof k === 'number'
      ? document.createTextNode(String(k)) : k);
  }
  return n;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

/* Search has to survive how people actually type: "zitrone" must find Zitrone,
   "rosmarin ct cineol" must find "Rosmarin ct. Cineol", and someone typing on a
   phone will not reach for ×, é or ß. So everything — the haystack and the
   needle — goes through here first. */
export function fold(s) {
  if (!s) return '';
  return String(s).toLowerCase()
    .replace(/\u00e4/g, 'ae').replace(/\u00f6/g, 'oe').replace(/\u00fc/g, 'ue')
    .replace(/\u00df/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/* A tiny id. Journal entries never leave the phone, so this only has to be
   unique against the entries already on it. */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

var DAYS = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
var MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
              'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/* Dates are stored as 'YYYY-MM-DD' and read back with the parts, never with
   new Date(string) — that parses as UTC and turns an evening Aufguss into the
   day before for anyone east of Greenwich. */
export function partsOf(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return null;
  return { y: +m[1], m: +m[2], d: +m[3] };
}
export function weekdayOf(iso) {
  var p = partsOf(iso); if (!p) return '';
  return DAYS[new Date(p.y, p.m - 1, p.d).getDay()];
}
export function longDate(iso) {
  var p = partsOf(iso); if (!p) return iso || '';
  return weekdayOf(iso) + ', ' + p.d + '. ' + MONTHS[p.m - 1] + ' ' + p.y;
}
export function shortDate(iso) {
  var p = partsOf(iso); if (!p) return iso || '';
  return p.d + '. ' + MONTHS[p.m - 1].slice(0, 3) + ' ' + p.y;
}
export function todayISO(now) {
  var d = now || new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
/* Aufgüsse are on the hour, so the time field opens on the hour — the nearest
   one, not the one just gone: at 15:52 you are getting ready for 16:00. */
export function nearestHour(now) {
  var d = now || new Date();
  var h = d.getHours() + (d.getMinutes() >= 30 ? 1 : 0);
  return pad(h % 24) + ':00';
}
function pad(n) { return (n < 10 ? '0' : '') + n; }

export function daysBetween(isoA, isoB) {
  var a = partsOf(isoA), b = partsOf(isoB);
  if (!a || !b) return null;
  var da = Date.UTC(a.y, a.m - 1, a.d), db = Date.UTC(b.y, b.m - 1, b.d);
  return Math.round((db - da) / 86400000);
}
/* "gestern", "vor 3 Tagen" — how long ago reads better than a date when it was
   recently, and worse when it was months ago, so it switches over. */
export function agoText(iso, today) {
  var n = daysBetween(iso, today || todayISO());
  if (n === null) return shortDate(iso);
  if (n === 0) return 'heute';
  if (n === 1) return 'gestern';
  if (n < 14) return 'vor ' + n + ' Tagen';
  return shortDate(iso);
}

var noticeTimer = null;
export function notice(text) {
  var n = $('notice'); if (!n) return;
  n.textContent = text; n.className = 'on';
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () { n.className = ''; }, 2600);
}
