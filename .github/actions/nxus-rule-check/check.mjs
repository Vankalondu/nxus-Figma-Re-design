#!/usr/bin/env node
/**
 * NXUS rule checker — runner.
 *
 * In a pull request (GitHub Actions): checks only the lines the pull request adds or changes,
 * prints a warning annotation on each one, writes the job summary, and keeps ONE comment on
 * the pull request up to date. In `warn` mode (the default) it always exits 0 — it never
 * blocks a merge. `block` mode exits 1 when it finds something.
 *
 * Locally:
 *   node check.mjs --all <file-or-dir> …     every line of these files
 *   node check.mjs --base origin/main         only lines changed since that ref
 *
 * No dependencies: Node 18+ and git, both already on GitHub's runners.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { RULES, checkFile, EXTENSIONS } from './rules.mjs';

const env = process.env;
const MODE = (env.NXUS_MODE || 'warn').toLowerCase() === 'block' ? 'block' : 'warn';
const FIGMA_URL = env.NXUS_FIGMA_URL || 'https://www.figma.com/design/qefpAyr3MEEklQRV96YlSv';
const RULEBOOK_URL = env.NXUS_RULEBOOK_URL || 'https://github.com/Vankalondu/nxus-Figma-Re-design/blob/main/guidelines/Guidelines.md';
const IGNORE = (env.NXUS_IGNORE || 'node_modules/,dist/,build/,coverage/,vendor/')
  .split(',').map((s) => s.trim()).filter(Boolean);
const MARKER = '<!-- nxus-rule-check -->';
const SHOWN_IN_COMMENT = 50;

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const ignored = (f) => IGNORE.some((p) => f.startsWith(p) || f.includes(`/${p}`));

/** { file: Set<lineNumber> } of lines added or changed since `base`. */
function changedLines(base) {
  const diff = git('diff', '--unified=0', '--no-color', '--diff-filter=AMR', `${base}...HEAD`);
  const map = new Map();
  let file = null;
  for (const l of diff.split('\n')) {
    if (l.startsWith('+++ ')) {
      file = l === '+++ /dev/null' ? null : l.slice(6);
      if (file && (!EXTENSIONS.test(file) || ignored(file))) file = null;
      if (file && !map.has(file)) map.set(file, new Set());
      continue;
    }
    const h = file && l.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (h) {
      const start = Number(h[1]);
      const count = h[2] === undefined ? 1 : Number(h[2]);
      for (let n = start; n < start + count; n++) map.get(file).add(n);
    }
  }
  return map;
}

function walk(p, out) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p)) {
      const f = path.join(p, e);
      if (!ignored(f.split(path.sep).join('/') + (fs.statSync(f).isDirectory() ? '/' : ''))) walk(f, out);
    }
  } else if (EXTENSIONS.test(p)) out.push(p.split(path.sep).join('/'));
  return out;
}

function collect() {
  const args = process.argv.slice(2);
  const all = args.indexOf('--all');
  if (all !== -1) {
    const files = args.slice(all + 1).flatMap((p) => walk(p, []));
    return new Map(files.map((f) => [f, null])); // null = every line
  }
  const b = args.indexOf('--base');
  let base = b !== -1 ? args[b + 1] : env.NXUS_BASE;
  if (!base && env.GITHUB_EVENT_PATH) {
    const ev = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
    base = ev.pull_request?.base?.sha;
  }
  if (!base) throw new Error('No base to compare with. Run on a pull_request event, or pass --base <ref> / --all <paths>.');
  return changedLines(base);
}

const escData = (s) => s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escProp = (s) => escData(s).replace(/:/g, '%3A').replace(/,/g, '%2C');
const message = (f) => `Breaks ${f.id} (${RULES[f.id].title}): \`${f.hit}\` — ${RULES[f.id].fix}.`;

function summaryMarkdown(findings, fileCount) {
  const intro = `${MARKER}\n### NXUS rule check\n\n`;
  if (!findings.length) {
    return `${intro}✅ No NXUS rule issues in the lines this pull request changes (${fileCount} file${fileCount === 1 ? '' : 's'} checked).\n`;
  }
  const byRule = {};
  for (const f of findings) byRule[f.id] = (byRule[f.id] || 0) + 1;
  const counts = Object.entries(byRule).map(([id, n]) => `**${id}** ${RULES[id].title} — ${n}`).join('  \n');
  const rows = findings.slice(0, SHOWN_IN_COMMENT)
    .map((f) => `| \`${f.file}:${f.line}\` | ${f.id} | \`${f.hit.replace(/\|/g, '\\|')}\` | ${RULES[f.id].fix} |`).join('\n');
  const more = findings.length > SHOWN_IN_COMMENT ? `\n\n…and ${findings.length - SHOWN_IN_COMMENT} more — see the job log.` : '';
  const verdict = MODE === 'block'
    ? '⛔ **This check is set to block** — fix these or ask the designer for an exception.'
    : '⚠️ **Warning only — this does not block the merge.** Please fix these, or, if a value is deliberate (for example colour that is data, like a team kit), add `nxus-ignore` in a comment on that line and say why.';
  return `${intro}${verdict}\n\n${findings.length} issue${findings.length === 1 ? '' : 's'} in the changed lines:\n\n${counts}\n\n`
    + `| Where | Rule | Found | What to do |\n|---|---|---|---|\n${rows}${more}\n\n`
    + `The rules are in the [NXUS rulebook](${RULEBOOK_URL}). The design is the source of truth: [NXUS Figma file](${FIGMA_URL}).\n`;
}

async function upsertComment(body, hasFindings) {
  const token = env.NXUS_GITHUB_TOKEN || env.GITHUB_TOKEN;
  if (env.NXUS_COMMENT === 'false' || !token || !env.GITHUB_EVENT_PATH || !env.GITHUB_REPOSITORY) return;
  const ev = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
  const pr = ev.pull_request?.number;
  if (!pr) return;
  const api = `${env.GITHUB_API_URL || 'https://api.github.com'}/repos/${env.GITHUB_REPOSITORY}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  let existing = null;
  for (let page = 1; page <= 10 && !existing; page++) {
    const r = await fetch(`${api}/issues/${pr}/comments?per_page=100&page=${page}`, { headers });
    if (!r.ok) throw new Error(`listing comments: HTTP ${r.status}`);
    const list = await r.json();
    existing = list.find((c) => c.body?.includes(MARKER));
    if (list.length < 100) break;
  }
  // Nothing to say and nothing said before: stay quiet rather than post an "all clear".
  if (!existing && !hasFindings) return;
  const r = existing
    ? await fetch(`${api}/issues/comments/${existing.id}`, { method: 'PATCH', headers, body: JSON.stringify({ body }) })
    : await fetch(`${api}/issues/${pr}/comments`, { method: 'POST', headers, body: JSON.stringify({ body }) });
  if (!r.ok) throw new Error(`${existing ? 'updating' : 'posting'} the comment: HTTP ${r.status}`);
}

async function main() {
  const targets = collect();
  const findings = [];
  for (const [file, lines] of targets) {
    if (!fs.existsSync(file)) continue;
    for (const f of checkFile(file, fs.readFileSync(file, 'utf8'))) {
      if (lines === null || lines.has(f.line)) findings.push({ file, ...f });
    }
  }

  console.log(`NXUS rule check (${MODE} mode) — ${targets.size} file(s), ${findings.length} issue(s)\n`);
  for (const f of findings) {
    console.log(`  ${f.file}:${f.line}  [${f.id}] ${f.hit}`);
    if (env.GITHUB_ACTIONS) {
      const level = MODE === 'block' ? 'error' : 'warning';
      console.log(`::${level} file=${escProp(f.file)},line=${f.line},title=${escProp(`NXUS ${f.id}`)}::${escData(`${message(f)} See the Figma file: ${FIGMA_URL}`)}`);
    }
  }

  const md = summaryMarkdown(findings, targets.size);
  if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, md);
  try {
    await upsertComment(md, findings.length > 0);
  } catch (e) {
    // A pull request from a fork gets a read-only token, so commenting can fail. The
    // annotations and job summary above still show everything.
    console.log(`::warning title=NXUS rule check::Could not post the summary comment (${e.message}). The issues are listed in this job's summary.`);
  }
  return findings.length;
}

main().then(
  (n) => process.exit(MODE === 'block' && n > 0 ? 1 : 0),
  (e) => {
    // The checker itself must never be the reason a merge is blocked in warn mode.
    console.log(`::warning title=NXUS rule check::The checker could not run: ${escData(e.message)}`);
    process.exit(MODE === 'block' ? 1 : 0);
  },
);
