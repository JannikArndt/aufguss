/* A DOM small enough to read and strict enough to be worth running.

   It exists so tools/smoke.mjs can load the whole app — src/main.js and
   everything under it — in Node, and drive it the way a finger does. What that
   catches is the wiring: an id that index.html no longer carries, a function
   that moved to another module, a control wired to its effect but not to the
   thing that saves it.

   Deliberately strict, and deliberately small:

     - getElementById returns null for an id the markup does not carry, so
       $('gone').textContent throws here exactly as it would in Safari;
     - a method the app does not call is not implemented, on purpose. A loud
       failure beats a stub quietly returning the wrong thing.

   It is not a browser. Layout, real fonts and actual Safari behaviour are only
   checkable on a phone. */

import fs from 'node:fs';

class Node {
  constructor(tag) {
    this.tagName = String(tag || '').toUpperCase();
    this.childNodes = [];
    this.parentNode = null;
    this.attributes = {};
    this._listeners = {};
    this._className = '';
    this._hidden = false;
    this.style = new Style();
    /* Nothing here has real layout, so these stay plain numbers rather than
       the read-only, clamped properties a browser gives — main.js and
       parts.js only ever add to scrollTop and read it back. */
    this.scrollTop = 0;
    this.clientHeight = 0;
  }
  get className() { return this._className; }
  set className(v) { this._className = String(v == null ? '' : v); }
  get hidden() { return this._hidden; }
  set hidden(v) { this._hidden = !!v; }

  get firstChild() { return this.childNodes[0] || null; }
  appendChild(n) {
    if (!n) throw new Error('appendChild(' + n + ')');
    if (n.parentNode) n.parentNode.removeChild(n);
    n.parentNode = this; this.childNodes.push(n); return n;
  }
  insertBefore(n, ref) {
    const i = this.childNodes.indexOf(ref);
    if (i < 0) return this.appendChild(n);
    if (n.parentNode) n.parentNode.removeChild(n);
    n.parentNode = this; this.childNodes.splice(i, 0, n); return n;
  }
  removeChild(n) {
    const i = this.childNodes.indexOf(n);
    if (i < 0) throw new Error('removeChild: not a child');
    this.childNodes.splice(i, 1); n.parentNode = null; return n;
  }
  replaceChild(fresh, old) {
    const i = this.childNodes.indexOf(old);
    if (i < 0) throw new Error('replaceChild: not a child');
    if (fresh.parentNode) fresh.parentNode.removeChild(fresh);
    this.childNodes[i] = fresh; fresh.parentNode = this; old.parentNode = null;
    return old;
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; }

  addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
  removeEventListener(type, fn) {
    const l = this._listeners[type]; if (!l) return;
    const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1);
  }
  dispatch(type, ev) {
    const l = (this._listeners[type] || []).slice();
    const event = Object.assign({ type, target: this, preventDefault() {}, stopPropagation() {} }, ev || {});
    for (const fn of l) fn.call(this, event);
    return l.length;
  }
  click() { this.dispatch('click'); }
  focus() { this.dispatch('focus'); }
  blur() { this.dispatch('blur'); }
  /* Nothing here has real layout, so a zeroed rect is all parts.js needs to
     see for its guards ("was this measurable at all?") to behave. */
  getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; }

  get textContent() {
    if (this.tagName === '#TEXT') return this._text;
    return this.childNodes.map((c) => c.textContent).join('');
  }
  set textContent(v) {
    this.childNodes.forEach((c) => { c.parentNode = null; });
    this.childNodes = [];
    if (v !== '' && v != null) this.appendChild(new Text(String(v)));
  }

  /* Only what the app and the test actually ask for: '#id', 'tag', '.class',
     and a space-separated descendant chain of those. */
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  querySelectorAll(sel) {
    const parts = String(sel).trim().split(/\s+/);
    let pool = [this];
    for (const part of parts) {
      const next = [];
      for (const node of pool) for (const d of descendants(node)) if (matches(d, part)) next.push(d);
      pool = next;
    }
    return pool;
  }
}

class Text extends Node {
  constructor(t) { super('#text'); this._text = String(t); }
}

class Style {
  constructor() { this._props = {}; }
  setProperty(k, v) { this._props[k] = v; }
  getPropertyValue(k) { return this._props[k] || ''; }
  set cssText(v) { this._props.cssText = v; }
  get cssText() { return this._props.cssText || ''; }
  set width(v) { this._props.width = v; }
  get width() { return this._props.width || ''; }
  set display(v) { this._props.display = v; }
  get display() { return this._props.display || ''; }
  set maxHeight(v) { this._props.maxHeight = v; }
  get maxHeight() { return this._props.maxHeight || ''; }
  set marginBottom(v) { this._props.marginBottom = v; }
  get marginBottom() { return this._props.marginBottom || ''; }
  set textAlign(v) { this._props.textAlign = v; }
  set paddingRight(v) { this._props.paddingRight = v; }
  set marginTop(v) { this._props.marginTop = v; }
}

function isAttached(node, root) {
  let n = node;
  while (n) { if (n === root) return true; n = n.parentNode; }
  return false;
}
function* descendants(node) {
  for (const c of node.childNodes) { yield c; yield* descendants(c); }
}
function matches(node, part) {
  if (node.tagName === '#TEXT') return false;
  if (part.startsWith('#')) return node.attributes.id === part.slice(1);
  if (part.startsWith('.')) return String(node.className).split(/\s+/).indexOf(part.slice(1)) >= 0;
  if (part.includes('[')) {
    const [tag, rest] = part.split('[');
    const m = /^([\w-]+)(?:([~^$*]?=)"?([^"\]]*)"?)?\]$/.exec(rest);
    if (!m) return false;
    if (tag && node.tagName !== tag.toUpperCase()) return false;
    const have = node.attributes[m[1]] != null ? node.attributes[m[1]] : node[m[1]];
    if (!m[2]) return have != null;
    if (m[2] === '=') return String(have) === m[3];
    if (m[2] === '^=') return String(have || '').startsWith(m[3]);
    return String(have || '').includes(m[3]);
  }
  return node.tagName === part.toUpperCase();
}

/* Inputs keep .value, .type, .placeholder and friends as plain properties,
   which is what the app uses; setAttribute('id', …) is what the parser uses. */
class Element extends Node {
  constructor(tag) {
    super(tag);
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(this.tagName)) {
      this.value = ''; this.type = 'text'; this.placeholder = '';
      this.disabled = false; this.checked = false;
      if (this.tagName === 'SELECT') { this.options = []; this.selectedIndex = -1; }
    }
    if (this.tagName === 'BUTTON') this.disabled = false;
  }
  get id() { return this.attributes.id || ''; }
  set id(v) { this.attributes.id = String(v); }
  appendChild(n) {
    const r = super.appendChild(n);
    if (this.tagName === 'SELECT' && n.tagName === 'OPTION') {
      this.options.push(n);
      if (n.selected) this.selectedIndex = this.options.length - 1;
      else if (this.selectedIndex < 0) this.selectedIndex = 0;
    }
    return r;
  }
}

/* index.html is parsed just far enough to give every element with an id its
   place in a tree, with its classes and its input attributes. The app only
   ever reaches the markup through getElementById and querySelector, so that
   is enough — and a real parser would be a dependency. */
export function buildDocument(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const body = html.slice(html.indexOf('<body'), html.indexOf('</body>'));
  const root = new Element('body');
  const stack = [root];
  const byId = {};
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(body))) {
    if (m[5] != null) {
      const t = m[5].replace(/\s+/g, ' ');
      if (t.trim()) stack[stack.length - 1].appendChild(new Text(t));
      continue;
    }
    const [, close, tag, attrs, selfClose] = m;
    if (close) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const node = new Element(tag);
    for (const a of attrs.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      const k = a[1], v = a[2] == null ? '' : a[2];
      if (k === 'class') node.className = v;
      else if (k === 'hidden') node.hidden = true;
      else if (['type', 'placeholder', 'value', 'step'].includes(k)) { node[k] = v; node.attributes[k] = v; }
      else node.attributes[k] = v;
    }
    stack[stack.length - 1].appendChild(node);
    if (node.attributes.id) byId[node.attributes.id] = node;
    const VOID = ['meta', 'link', 'input', 'br', 'img', 'hr'];
    if (!selfClose && !VOID.includes(tag.toLowerCase())) stack.push(node);
  }
  return { root, byId };
}

/* A localStorage that behaves like one, including throwing when it is told to
   — which is the only way to test that the app survives a phone with storage
   switched off. */
export function makeStorage() {
  const data = new Map();
  return {
    blocked: false,
    get length() { return data.size; },
    getItem(k) { if (this.blocked) throw domError('SecurityError'); return data.has(k) ? data.get(k) : null; },
    setItem(k, v) { if (this.blocked) throw domError('QuotaExceededError'); data.set(k, String(v)); },
    removeItem(k) { data.delete(k); },
    clear() { data.clear(); },
    _dump() { return Object.fromEntries(data); },
  };
}
function domError(name) { const e = new Error(name); e.name = name; return e; }

export function install(htmlPath) {
  const { root, byId } = buildDocument(htmlPath);
  const documentElement = new Element('html');

  const doc = {
    body: root,
    documentElement,
    /* Nothing in this stub ever calls focus()/blur() on the app's behalf —
       tools/smoke.mjs drives the app by calling its exported functions and
       clicking buttons, not by moving real focus — so this stays null. It
       exists so code that reads it (entry.js's focusout handler) doesn't
       throw for want of the property. */
    activeElement: null,
    /* The markup's own ids are in the map; anything the app creates and gives
       an id to has to be found by walking, because that is what a browser
       does and the app relies on it (#setCard and #lastTime are built at
       render time and then replaced in place). */
    getElementById(id) {
      const fromMarkup = Object.prototype.hasOwnProperty.call(byId, id) ? byId[id] : null;
      if (fromMarkup && isAttached(fromMarkup, root)) return fromMarkup;
      for (const n of descendants(root)) if (n.attributes && n.attributes.id === id) return n;
      return fromMarkup;
    },
    querySelector: (s) => root.querySelector(s),
    querySelectorAll: (s) => root.querySelectorAll(s),
    createElement: (t) => new Element(t),
    /* The namespace itself is not modelled — this stub has one kind of
       element — but the app's one bit of inline SVG (the Kellen icon in
       ui/parts.js) needs the call to exist at all, or loading it in Node
       throws before a single check runs. */
    createElementNS: (ns, t) => new Element(t),
    createTextNode: (t) => new Text(t),
  };

  const listeners = {};
  const win = {
    document: doc,
    innerHeight: 844,
    visualViewport: null,
    location: { hash: '', protocol: 'http:', hostname: 'localhost', pathname: '/' },
    localStorage: makeStorage(),
    navigator: {},
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    dispatch(t, ev) { (listeners[t] || []).slice().forEach((fn) => fn(ev || { type: t })); },
    confirm: () => true,
    prompt: () => null,
    setTimeout, clearTimeout,
    /* fitHeight's undo-iOS's-scroll guard needs both to exist and to be
       settable; nothing here ever really scrolls, so this just has to be a
       number scrollTo can zero back out. */
    scrollY: 0,
    scrollTo(x, y) { this.scrollY = arguments.length > 1 ? y : 0; },
    URL: { createObjectURL: () => 'blob:stub', revokeObjectURL() {} },
    /* No layout, so no real computed style — just enough that reading
       --app-h off the root (parts.js's autocomplete sizing) doesn't throw;
       an empty string fails the finite-number check the same way a missing
       custom property would in a real browser. */
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
  };

  /* A hash that fires hashchange the way a browser does, since the whole
     router hangs off it. */
  let hash = '';
  Object.defineProperty(win.location, 'hash', {
    get: () => hash,
    set(v) {
      const next = String(v);
      if (next === hash) return;
      hash = next;
      win.dispatch('hashchange');
    },
  });

  /* Node already owns `navigator` and `location` as getter-only globals, so
     they are defined over rather than assigned. */
  globalThis.window = win;
  globalThis.document = doc;
  globalThis.localStorage = win.localStorage;
  globalThis.confirm = win.confirm;
  globalThis.prompt = win.prompt;
  for (const [k, v] of [['location', win.location], ['navigator', win.navigator]]) {
    Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true });
  }
  globalThis.Option = function Option(text, value) {
    const o = new Element('option');
    o.textContent = text; o.value = value == null ? text : value; o.selected = false;
    return o;
  };
  globalThis.Blob = class Blob { constructor(parts) { this.parts = parts; this.size = String(parts[0] || '').length; } };
  if (!globalThis.URL.createObjectURL) {
    globalThis.URL.createObjectURL = () => 'blob:stub';
    globalThis.URL.revokeObjectURL = () => {};
  }
  globalThis.FileReader = class FileReader {
    readAsText(file) { this.result = file._text; if (this.onload) this.onload(); }
  };

  return { win, doc, byId };
}
