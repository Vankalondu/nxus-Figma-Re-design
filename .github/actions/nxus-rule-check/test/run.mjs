#!/usr/bin/env node
/**
 * Self-test for the NXUS rule checker. Run: npm run test:rule-check
 *   1. Every deliberate violation in fixtures/bad is found, with the right rule.
 *   2. fixtures/clean produces nothing (no false alarms on correct code).
 *   3. In a throwaway git repo, only lines CHANGED since the base are reported,
 *      and warn mode exits 0 while block mode exits 1.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { checkFile } from '../rules.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const checker = path.join(here, '..', 'check.mjs');
let failed = 0;
const ok = (cond, label) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`); if (!cond) failed++; };
const ids = (file) => checkFile(file, fs.readFileSync(file, 'utf8')).map((f) => `${f.line}:${f.id}`);

// 1. Bad fixtures — "line:rule" pairs that must be reported, and the total.
const expected = {
  'PlayerCard.vue': ['2:L-C1', '2:L-C2', '2:L-S1', '3:L-TY3', '3:L-TY1', '4:L-G1', '4:L-TY3', '5:L-C10', '5:L-S1',
    '12:L-G1', '17:L-G1', '18:L-C1', '19:L-S1', '20:L-TY3', '21:L-TY1'],
  'legacy.scss': ['1:L-G1', '3:L-G1', '4:L-S1', '5:L-TY3', '6:L-C1'],
  'Badge.tsx': ['2:L-C1', '2:L-TY5', '2:L-G1', '2:L-C1'],
};
for (const [name, want] of Object.entries(expected)) {
  const got = ids(path.join(here, 'fixtures', 'bad', name));
  const missing = want.filter((w) => !got.includes(w));
  ok(!missing.length && got.length === want.length,
    `${name}: ${got.length} found, ${want.length} expected${missing.length ? ` — missing ${missing.join(', ')}` : ''}${got.length !== want.length ? ` — got ${got.join(', ')}` : ''}`);
}
ok(!ids(path.join(here, 'fixtures', 'bad', 'PlayerCard.vue')).some((x) => x.startsWith('6:') || x.startsWith('11:') || x.startsWith('22:') || x.startsWith('24:')),
  'PlayerCard.vue: slot shorthand, comments, custom property and nxus-ignore line are not reported');

// 2. Clean fixtures.
for (const name of fs.readdirSync(path.join(here, 'fixtures', 'clean'))) {
  const got = ids(path.join(here, 'fixtures', 'clean', name));
  ok(got.length === 0, `clean/${name}: no issues${got.length ? ` — got ${got.join(', ')}` : ''}`);
}

// 3. Changed lines only.
const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'nxus-rule-check-'));
const g = (...a) => execFileSync('git', a, { cwd: repo, encoding: 'utf8' });
g('init', '-q'); g('config', 'core.autocrlf', 'false'); g('config', 'user.email', 'test@example.com'); g('config', 'user.name', 'test');
fs.writeFileSync(path.join(repo, 'old.scss'), '.a {\n  color: #123456;\n}\n');
g('add', '.'); g('commit', '-qm', 'base');
fs.writeFileSync(path.join(repo, 'old.scss'), '.a {\n  color: #123456;\n  padding: 10px;\n}\n');
fs.writeFileSync(path.join(repo, 'New.vue'), '<template>\n  <div class="text-gray-500">x</div>\n</template>\n');
g('add', '.'); g('commit', '-qm', 'change');
const run = (mode) => spawnSync(process.execPath, [checker, '--base', 'HEAD~1'], { cwd: repo, encoding: 'utf8', env: { ...process.env, NXUS_MODE: mode, GITHUB_ACTIONS: '' } });
const warn = run('warn');
ok(warn.stdout.includes('old.scss:3  [L-S1]') && warn.stdout.includes('New.vue:2  [L-C2]'), 'diff mode reports the two new lines');
ok(!warn.stdout.includes('old.scss:2'), 'diff mode ignores the old colour that was already there');
ok(warn.status === 0, 'warn mode exits 0 (never blocks)');
ok(run('block').status === 1, 'block mode exits 1 when something is found');
fs.rmSync(repo, { recursive: true, force: true });

console.log(failed ? `\n${failed} check(s) failed` : '\nAll rule-check self-tests passed');
process.exit(failed ? 1 : 0);
