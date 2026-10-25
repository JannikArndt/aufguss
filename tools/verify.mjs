// What CI's test job runs, with only what needs reading printed.
//   node tools/verify.mjs               all steps
//   node tools/verify.mjs smoke         some of them
// Every step runs even when an earlier one fails, so one call says
// everything. The last line is `VERIFY: PASS` or `VERIFY: FAIL (<steps>)`.
// (No npm: this app has no package.json, CLAUDE.md §2.)
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STEPS = {
  smoke: "node tools/smoke.mjs",
  contract: "node --test test/deploy-contract.test.mjs",
};

const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(STEPS);
const failed = [];
for (const step of wanted) {
  if (!STEPS[step]) { console.log(`✗ ${step} (no such step)`); failed.push(step); continue; }
  const started = Date.now();
  const r = spawnSync(STEPS[step], { shell: true, cwd: ROOT, encoding: "utf8", env: { ...process.env, FORCE_COLOR: "0" } });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (r.status === 0) { console.log(`✓ ${step} (${secs} s)`); continue; }
  failed.push(step);
  console.log(`✗ ${step} (${secs} s)`);
  const out = `${r.stdout}\n${r.stderr}`.split("\n");
  // For node --test: the failing tests' blocks only; otherwise the tail.
  const notOk = out.flatMap((l, i) => (/^\s*not ok /.test(l) ? out.slice(i, i + 25) : []));
  console.log((notOk.length ? notOk : out.slice(-40)).join("\n").trim());
}
console.log(failed.length ? `VERIFY: FAIL (${failed.join(" ")})` : "VERIFY: PASS");
process.exit(failed.length ? 1 : 0);
