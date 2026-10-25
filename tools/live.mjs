// Is this tree's version what GitHub Pages serves right now?
//   node tools/live.mjs                 answers now (exit 1 if not)
//   node tools/live.mjs --wait          polls every 5 s, up to 10 min
//   node tools/live.mjs --url <base>    another host
// Last line: `LIVE: <VERSION>` or `NOT LIVE: want <a>, <url> serves <b>`.
//
// The build id of a branch-served app is the VERSION in sw.js (CLAUDE.md §8):
// the worker's cache is named for it, so a phone only updates when it moves.
// The query string defeats Pages' ten-minute CDN cache.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DEFAULT_URL = "https://jannikarndt.github.io/aufguss";
const versionOf = (text) => /VERSION\s*=\s*['"]([^'"]+)/.exec(text)?.[1];
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const base = (arg("--url") || process.env.APP_URL || DEFAULT_URL).replace(/\/$/, "");
const wait = process.argv.includes("--wait");
const want = versionOf(readFileSync(fileURLToPath(new URL("../sw.js", import.meta.url)), "utf8"));
const started = Date.now();

async function served() {
  try {
    const res = await fetch(`${base}/sw.js?t=${Date.now()}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return `HTTP ${res.status}`;
    return versionOf(await res.text()) || "no VERSION in sw.js";
  } catch (err) {
    return err.cause?.code || err.name;
  }
}

let last = "";
for (;;) {
  const got = await served();
  if (got === want) { console.log(`LIVE: ${want}`); process.exit(0); }
  const secs = Math.round((Date.now() - started) / 1000);
  if (!wait || secs > 600) { console.log(`NOT LIVE: want ${want}, ${base} serves ${got}`); process.exit(1); }
  if (got !== last) { console.log(`  ${secs} s: ${base} serves ${got}`); last = got; }
  await new Promise((r) => setTimeout(r, 5000));
}
