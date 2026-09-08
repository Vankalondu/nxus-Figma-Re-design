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
 * WHEN IT FAILS THE BUILD, AND WHEN IT DOES NOT
 * The distinction is whether a human can act on it.
 *
 *   no token   -> skip, exit 0. Nothing is configured yet; that is not a fault.
 *   403        -> report, exit 0. The scope or the plan forbids this endpoint,
 *                 and no pull request can change that. The Variables REST API is
 *                 Enterprise-gated and this account is Pro, so a 403 on a
 *                 metadata endpoint is plausible too.
 *   401        -> FAIL. The token is wrong or expired. Somebody can fix that,
 *                 and skipping would leave freshness unchecked while CI stayed
 *                 green — the exact silence this script exists to remove.
 *   Figma newer than the snapshot -> FAIL. The real signal.
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
let unauthorized = false;
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
    if (res.status === 401) unauthorized = true;
    // 401 and 403 are NOT the same problem, and treating them the same was a
    // mistake. 403 means the scope or the plan forbids this — nobody can fix
    // that from a pull request, so it must not fail the build. 401 means the
    // token is wrong or EXPIRED, which somebody can and should fix. Exiting 0
    // on an expired token would quietly stop checking freshness while still
    // showing green — the exact silence this script exists to remove.
    continue;
  }
  const body = await res.json();
  const f = body.file || body;
  lastModified = f.last_modified || f.lastModified || null;
  fileName = f.name || null;
  if (lastModified) break;
  tried.push(`${url.split('/v1/')[1]} — 200 but no lastModified field`);
}

if (!lastModified && unauthorized) {
  console.log('FRESHNESS  the Figma token was REJECTED (401).');
  tried.forEach((t) => console.log('           · ' + t));
  console.log('');
  console.log('FAIL  the token is invalid or has expired, so nothing is checking whether');
  console.log('      the snapshot still matches Figma. That is fixable: regenerate the');
  console.log('      token in Figma and update the FIGMA_TOKEN secret. Failing rather');
  console.log('      than skipping, because an expired token would otherwise go quiet');
  console.log('      while CI stayed green — the silence this script exists to remove.');
  process.exit(1);
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
