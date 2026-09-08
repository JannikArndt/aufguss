/* 1. Everything the app remembers.

   It remembers it here, on this phone, and nowhere else. There is no account,
   no sync and no request to any other origin — the only thing this app ever
   fetches is its own files, through the service worker. What that costs is
   real and is the reason Mehr → Sichern exists: clear the site data, or lose
   the phone, and the journal is gone. Export is a file you keep.

   localStorage rather than IndexedDB because the whole journal is text: a
   thousand Aufgüsse with notes is well under a megabyte, and a synchronous
   read that cannot fail halfway is worth more here than the headroom. If a
   journal ever gets near the quota, that is the moment to move — not before.

   Every read tolerates the store being unavailable (a private window, storage
   turned off) and returns empty. The app then works for the session and says
   so on the Mehr screen; it never throws in the middle of writing an Aufguss
   down. */

var K = {
  entries: 'aufguss.entries.v1',
  custom:  'aufguss.customOils.v1',
  personal:'aufguss.oilNotes.v1',
  prefs:   'aufguss.prefs.v1',
};

export var Store = {
  available: true,
  lastError: '',

  _read: function (key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch (e) {
      this.available = false; this.lastError = String(e && e.name || e);
      return fallback;
    }
  },
  _write: function (key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) {
      this.available = false; this.lastError = String(e && e.name || e);
      return false;
    }
  },

  /* ── The journal ──────────────────────────────────────────────────────
     Kept newest first, which is the order every screen wants it in. */
  entries: function () {
    var list = this._read(K.entries, []);
    return Array.isArray(list) ? list.slice().sort(cmpEntry) : [];
  },
  entry: function (id) {
    var all = this.entries();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  },
  putEntry: function (entry) {
    var all = this._read(K.entries, []);
    if (!Array.isArray(all)) all = [];
    var found = false;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === entry.id) { all[i] = entry; found = true; break; }
    }
    if (!found) all.push(entry);
    return this._write(K.entries, all);
  },
  removeEntry: function (id) {
    var all = this._read(K.entries, []).filter(function (e) { return e.id !== id; });
    return this._write(K.entries, all);
  },

  /* ── Oils you added yourself ──────────────────────────────────────────
     Stored apart from the catalogue so an update to src/data/oils.js can
     never touch them, and so an export carries them along with the entries
     that use them. */
  customOils: function () { return this._read(K.custom, []); },
  putCustomOil: function (oil) {
    var all = this.customOils(), found = false;
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === oil.id) { all[i] = oil; found = true; break; }
    }
    if (!found) all.push(oil);
    return this._write(K.custom, all);
  },
  removeCustomOil: function (id) {
    return this._write(K.custom, this.customOils().filter(function (o) { return o.id !== id; }));
  },

  /* ── What you think of an oil ─────────────────────────────────────────
     A favourite flag and your own note, keyed by oil id, for catalogue oils
     and custom ones alike. */
  personal: function () { return this._read(K.personal, {}); },
  personalFor: function (id) {
    var p = this.personal()[id];
    return { fav: !!(p && p.fav), note: (p && p.note) || '' };
  },
  setPersonal: function (id, patch) {
    var all = this.personal();
    var cur = all[id] || { fav: false, note: '' };
    if (patch.hasOwnProperty('fav')) cur.fav = !!patch.fav;
    if (patch.hasOwnProperty('note')) cur.note = String(patch.note || '');
    if (!cur.fav && !cur.note) delete all[id]; else all[id] = cur;
    return this._write(K.personal, all);
  },
  favourites: function () {
    var all = this.personal(), out = [];
    for (var id in all) if (all[id] && all[id].fav) out.push(id);
    return out;
  },

  /* ── Settings ─────────────────────────────────────────────────────────── */
  prefs: function () {
    var p = this._read(K.prefs, {});
    return {
      venue: p.venue || 'Kaifubad',
      ratio: p.ratio || '30-50-20',
      defaultMl: typeof p.defaultMl === 'number' ? p.defaultMl : 2,
    };
  },
  setPref: function (key, value) {
    var p = this._read(K.prefs, {}); p[key] = value;
    return this._write(K.prefs, p);
  },

  /* ── Out and back in ──────────────────────────────────────────────────
     One file with everything in it. Import merges by id rather than
     replacing, so importing the same file twice is a no-op and importing an
     older backup cannot delete an Aufguss written since. */
  exportAll: function () {
    return {
      format: 'aufguss-journal/1',
      exported: new Date().toISOString(),
      entries: this.entries(),
      customOils: this.customOils(),
      personal: this.personal(),
      prefs: this._read(K.prefs, {}),
    };
  },
  importAll: function (data) {
    if (!data || data.format !== 'aufguss-journal/1') {
      throw new Error('Das ist keine Aufguss-Sicherung.');
    }
    var added = 0, updated = 0;
    var mine = this._read(K.entries, []);
    if (!Array.isArray(mine)) mine = [];
    var byId = {};
    for (var i = 0; i < mine.length; i++) byId[mine[i].id] = i;
    var incoming = Array.isArray(data.entries) ? data.entries : [];
    for (var j = 0; j < incoming.length; j++) {
      var e = incoming[j];
      if (!e || !e.id) continue;
      if (byId.hasOwnProperty(e.id)) { mine[byId[e.id]] = e; updated++; }
      else { mine.push(e); added++; }
    }
    this._write(K.entries, mine);

    var cust = Array.isArray(data.customOils) ? data.customOils : [];
    for (var k = 0; k < cust.length; k++) if (cust[k] && cust[k].id) this.putCustomOil(cust[k]);

    if (data.personal && typeof data.personal === 'object') {
      var p = this.personal();
      for (var id in data.personal) if (!p[id]) p[id] = data.personal[id];
      this._write(K.personal, p);
    }
    return { added: added, updated: updated, oils: cust.length };
  },
};

/* Newest first: by date, then by time, then by when it was written down — so
   two Aufgüsse at 18:00 on the same day keep the order they were entered in. */
function cmpEntry(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  var at = a.time || '', bt = b.time || '';
  if (at !== bt) return at < bt ? 1 : -1;
  return (b.written || '') < (a.written || '') ? -1 : 1;
}
