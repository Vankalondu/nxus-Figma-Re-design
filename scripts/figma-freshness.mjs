#!/usr/bin/env node
/**
 * Truthful staleness: ask Figma when the file last changed, and compare that to
 * when the committed snapshot was last verified.
 *
 * WHY THIS EXISTS
 * scripts/figma-css-diff.mjs compares the CSS against scripts/figma-tokens.json
 * — a COMMITTED SNAPSHOT of Figma. If someone edits a variable in Figma, that
 * diff keeps reporting "0 drift" until a human re-reads the file. It cannot see
 * its own blind spot. The age-based warning in that script is a proxy: it knows
 * how old the snapshot is, not whether Figma has moved. This closes that.
 *
 * WHAT IT NEEDS
 * A Figma personal access token in FIGMA_TOKEN, with the smallest scope that
 * can read file metadata. It reads ONLY the file's name and lastModified — no
 * node content, no variables.
 *
 * WHY IT NEVER FAILS THE BUILD ON A MISSING OR REJECTED TOKEN
 * The Variables REST API is Enterprise-gated and Lighthouse Sports is on Pro.
 * File metadata is a different endpoint and is expected to work, but that is
 * unverified until a real token exists — so a 401/403 reports the reason and
 * exits 0 rather than turning CI red over a plan limitation nobody can fix from
 * a pull request. Only a genuine "Figma is newer than the snapshot" fails.
 *
 *   node scripts/figma-freshness.mjs
 */
import fs from 'fs';

const SNAP_PATH = 'scripts/figma-tokens.json';
const snap = JSON.parse(fs.readFileSync(SNAP_PATH, 'utf8'));
const fileKey = snap.fileKey;
const token = process.env.FIGMA_TOKEN;

const stamp = String(snap._verified || snap.extractedAt || '').match(/^\d{4}-\d{2}-\d{2}/);
if (!stamp) {
  console.log('FRESHNESS  snapshot carries no _verified date — cannot compare.');
  process.exit(0);
}
const verifiedOn = stamp[0];

if (!token) {
  console.log('FRESHNESS  skipped — no FIGMA_TOKEN in the environment.');
  console.log(`           The snapshot says it was verified on ${verifiedOn}; without a token`);
  console.log('           that is a claim, not a check. See docs/figma-sync.md to enable it.');
  process.exit(0);
}
if (!fileKey) {
  console.log('FRESHNESS  skipped — figma-tokens.json has no fileKey.');
  process.exit(0);
}

// `/meta` is the light endpoint (name + lastModified, no document tree).
// `?depth=1` is the fallback if this deployment does not expose it: still the
// smallest possible read, one level of the document rather than all of it.
const ENDPOINTS = [
  `https://api.figma.com/v1/files/${fileKey}/meta`,
  `https://api.figma.com/v1/files/${fileKey}?depth=1`,
];

let lastModified = null;
let fileName = null;
const tried = [];

// Test seam. The comparison below is the only part that can fail the build, and
// without a token there is no way to exercise it — an untested failure path is
// the one that misbehaves the day it finally fires. Announces itself loudly so
// a value in CI logs is obvious rather than silently trusted.
if (process.env.FIGMA_LAST_MODIFIED_OVERRIDE) {
  lastModified = process.env.FIGMA_LAST_MODIFIED_OVERRIDE;
  fileName = '(override — no API call made)';
  console.log('FRESHNESS  *** using FIGMA_LAST_MODIFIED_OVERRIDE, this is a test run ***');
}

for (const url of lastModified ? [] : ENDPOINTS) {
  let res;
  try {
    res = await fetch(url, { headers: { 'X-Figma-Token': token } });
  } catch (e) {
    tried.push(`${url.split('/v1/')[1]} — network error: ${String(e.message).slice(0, 60)}`);
    continue;
  }
  if (!res.ok) {
    tried.push(`${url.split('/v1/')[1]} — HTTP ${res.status}`);
    // 401 = bad token, 403 = token lacks scope OR the plan gates this endpoint.
    // Both are configuration, not drift, so keep trying then exit clean.
    continue;
  }
  const body = await res.json();
  const f = body.file || body;
  lastModified = f.last_modified || f.lastModified || null;
  fileName = f.name || null;
  if (lastModified) break;
  tried.push(`${url.split('/v1/')[1]} — 200 but no lastModified field`);
}

if (!lastModified) {
  console.log('FRESHNESS  could not read the file timestamp. Not failing the build.');
  tried.forEach((t) => console.log('           · ' + t));
  console.log('           A 403 here most likely means the token lacks file-read scope, or');
  console.log('           this endpoint is gated on the plan. Either is a setup question,');
  console.log('           not a code problem — see docs/figma-sync.md.');
  process.exit(0);
}

const figmaDay = new Date(lastModified).toISOString().slice(0, 10);
console.log(`FRESHNESS  file "${fileName ?? fileKey}"`);
console.log(`           Figma last modified : ${figmaDay}  (${lastModified})`);
console.log(`           snapshot verified   : ${verifiedOn}`);

// Compare whole days. Figma records a timestamp; the snapshot records a date,
// so a same-day edit cannot be distinguished from the verification itself.
// Erring toward silence on the same day is deliberate: a check that cries wolf
// gets switched off, and then it protects nothing.
if (figmaDay > verifiedOn) {
  const days = Math.round((Date.parse(figmaDay) - Date.parse(verifiedOn)) / 86400000);
  console.log('');
  console.log(`FAIL  Figma changed ${days} day(s) after the snapshot was last verified.`);
  console.log('      Everything figma-css-diff reports is measured against that snapshot,');
  console.log('      so its "0 drift" is currently unproven. Re-read the variables, update');
  console.log(`      ${SNAP_PATH} and its _verified stamp, then re-run.`);
  process.exit(1);
}

console.log('');
console.log('PASS  the snapshot is at least as new as the Figma file.');
process.exit(0);
