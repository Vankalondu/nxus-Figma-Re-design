#!/usr/bin/env node
/**
 * Turn a visual-test run into a pull-request summary the PM can decide from.
 *
 *   node scripts/visual-summary.mjs <results.json> <outDir> <imageBaseUrl> [lint.log] [drift.log]
 *
 * Writes <outDir>/summary.md (the PR comment), <outDir>/counts.json, and copies the
 * before / after / difference images of every changed screenshot into <outDir>/img/.
 * The workflow pushes img/ to the `visual-diffs` branch so the comment can show them:
 * a PR comment cannot embed images from a workflow artifact, but the repo is public, so
 * raw.githubusercontent.com URLs render inline.
 *
 * A difference is not a verdict. The check knows THAT something changed, not whether it
 * was meant to. That is the reviewer's call, which is why the summary says how to accept.
 */
import fs from 'fs';
import path from 'path';

const [resultsPath, outDir, base, lintLog, driftLog] = process.argv.slice(2);
const r = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
fs.mkdirSync(path.join(outDir, 'img'), { recursive: true });
const strip = (s) => String(s ?? '').replace(/\u001b\[[0-9;]*m/g, '');

const unchanged = [], changed = [], added = [], broken = [], retaken = [];
(function walk(suite) {
  for (const spec of suite.specs ?? []) {
    const res = spec.tests[0]?.results.at(-1); if (!res) continue;
    const title = spec.title.replace(/^(story|screen) /, '');
    if (res.status === 'passed') { unchanged.push(title); if (spec.tests[0].results.length > 1) retaken.push(title); continue; }
    const msg = strip(res.error?.message);
    const att = Object.fromEntries((res.attachments ?? []).filter((a) => a.path).map((a) => [a.name.replace(/.*-(expected|actual|diff)\.png$/, '$1'), a.path]));
    if (/doesn't exist|writing actual/i.test(msg)) { added.push({ title, att }); continue; }
    if (att.diff) { const px = msg.match(/([0-9]+) pixels/); changed.push({ title, att, px: px ? Number(px[1]) : null }); continue; }
    broken.push({ title, msg: msg.split('\n')[0].slice(0, 160) });
  }
  for (const s of suite.suites ?? []) walk(s);
})({ suites: r.suites });

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const img = (item, kind) => {
  const src = item.att[kind]; if (!src || !fs.existsSync(src)) return '';
  const name = `${slug(item.title)}-${kind}.png`;
  fs.copyFileSync(src, path.join(outDir, 'img', name));
  return `<img src="${base}/${name}" width="260" alt="${kind}">`;
};

const lint = lintLog && fs.existsSync(lintLog) ? strip(fs.readFileSync(lintLog, 'utf8')) : '';
const drift = driftLog && fs.existsSync(driftLog) ? strip(fs.readFileSync(driftLog, 'utf8')) : '';
const lintOk = lint ? !/^FAIL/m.test(lint) : null;
const driftOk = drift ? /PASS\s+no drift/.test(drift) : null;
const mark = (ok) => (ok === null ? '➖ not run' : ok ? '✅ passed' : '❌ failed');

const total = unchanged.length + changed.length + added.length + broken.length;
const clean = !changed.length && !added.length && !broken.length;
const verdict = clean && lintOk !== false && driftOk !== false
  ? '✅ **Nothing changed visually and every rule passed.** Safe to approve.'
  : broken.length ? '❌ **Some screens failed to render.** This needs a developer before review.'
  : '👀 **Visual changes need a decision.** Look at the images below: if every change is intended, accept them; if not, ask for a fix.';

let md = `<!-- nxus-visual-summary -->\n## Visual check\n\n${verdict}\n\n`;
md += `| Check | Result |\n|---|---|\n`;
md += `| Screenshots compared | ${total} (Storybook components + key screens at 390 / 834 / 1440) |\n`;
md += `| Unchanged | ${unchanged.length}${retaken.length ? ` (${retaken.length} re-taken after a one-off rendering blip)` : ''} |\n| Changed | ${changed.length ? '**' + changed.length + '**' : 0} |\n| New (no approved image yet) | ${added.length} |\n| Failed to render | ${broken.length} |\n`;
md += `| Design rules (token lint) | ${mark(lintOk)} |\n| Matches Figma tokens | ${mark(driftOk)} |\n\n`;

const SHOW = 12;
if (changed.length) {
  md += `### What changed\n\nApproved image · this pull request · differences in red\n\n`;
  for (const c of changed.slice(0, SHOW)) md += `**${c.title}**${c.px ? ` — ${c.px.toLocaleString('en')} pixels differ` : ''}\n\n${img(c, 'expected')} ${img(c, 'actual')} ${img(c, 'diff')}\n\n`;
  if (changed.length > SHOW) md += `<details><summary>${changed.length - SHOW} more changed</summary>\n\n${changed.slice(SHOW).map((c) => `- ${c.title}`).join('\n')}\n</details>\n\n`;
}
if (added.length) {
  md += `### New\n\n`;
  for (const a of added.slice(0, SHOW)) md += `**${a.title}**\n\n${img(a, 'actual')}\n\n`;
  if (added.length > SHOW) md += `…and ${added.length - SHOW} more.\n\n`;
}
if (broken.length) md += `### Failed to render\n\n${broken.map((b) => `- **${b.title}**: \`${b.msg}\``).join('\n')}\n\n`;
if (!clean) {
  md += `### How to decide\n\n- **All intended?** Add the label \`accept-visuals\` to this pull request. The approved images update and the check runs again.\n`;
  md += `- **Not intended?** Request changes and say which screen looks wrong.\n\n`;
}
md += `<sub>Full report with zoomable images: the \`visual-report\` artifact of this run. Screenshots are taken on GitHub's Linux runner with fonts loaded, the clock frozen and random data seeded, so a difference is a real difference.</sub>\n`;

fs.writeFileSync(path.join(outDir, 'summary.md'), md);
const counts = { total, retaken: retaken.length, unchanged: unchanged.length, changed: changed.length, added: added.length, broken: broken.length, lintOk, driftOk, clean };
fs.writeFileSync(path.join(outDir, 'counts.json'), JSON.stringify(counts));
console.log(JSON.stringify(counts));
