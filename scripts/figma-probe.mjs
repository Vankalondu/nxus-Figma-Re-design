#!/usr/bin/env node
/**
 * ONE-OFF DIAGNOSTIC — delete this file once it has answered its question.
 *
 * Question: can this account's token read Figma VARIABLES over REST?
 *
 * It matters because it decides the shape of the whole sync:
 *   200 -> a nightly GitHub Action can pull variables directly. No plugin
 *          needed, and steps 3-5 of docs/figma-sync.md disappear.
 *   403 -> the Enterprise gate is real, and the Figma-plugin push is the only
 *          route on a Pro plan.
 *
 * Worth actually testing rather than reasoning from the docs: file metadata was
 * assumed to be gated too, and it turned out not to be.
 *
 * Prints STATUS CODES and COUNTS ONLY — never a token, never variable values.
 * Always exits 0. A diagnostic that can fail the build is a liability.
 */
const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.log('PROBE  skipped — no FIGMA_TOKEN.');
  process.exit(0);
}

import fs from 'fs';
const { fileKey } = JSON.parse(fs.readFileSync('scripts/figma-tokens.json', 'utf8'));

const TARGETS = [
  ['whoami / token identity', 'https://api.figma.com/v1/me'],
  ['file metadata (known good)', `https://api.figma.com/v1/files/${fileKey}/meta`],
  ['VARIABLES — local', `https://api.figma.com/v1/files/${fileKey}/variables/local`],
  ['VARIABLES — published', `https://api.figma.com/v1/files/${fileKey}/variables/published`],
];

console.log('PROBE  which Figma REST endpoints does this token reach?\n');
let variablesOk = false;

for (const [label, url] of TARGETS) {
  let res;
  try {
    res = await fetch(url, { headers: { 'X-Figma-Token': token } });
  } catch (e) {
    console.log(`  ${label.padEnd(28)} network error: ${String(e.message).slice(0, 50)}`);
    continue;
  }
  let detail = '';
  if (res.ok) {
    try {
      const b = await res.json();
      if (b.meta && b.meta.variables) {
        const n = Object.keys(b.meta.variables).length;
        const c = Object.keys(b.meta.variableCollections || {}).length;
        detail = `  -> ${n} variables in ${c} collections`;
        variablesOk = variablesOk || label.startsWith('VARIABLES');
      } else if (b.email) {
        detail = `  -> authenticated`;
      } else if (b.file || b.name) {
        detail = `  -> ${(b.file || b).name ?? 'file readable'}`;
      }
    } catch { /* body shape is not the point; the status code is */ }
  } else {
    // Figma puts a human-readable reason in the body for 4xx.
    try {
      const b = await res.json();
      if (b.message) detail = `  -> ${String(b.message).slice(0, 80)}`;
    } catch { /* no body, status is enough */ }
  }
  console.log(`  ${label.padEnd(28)} HTTP ${res.status}${detail}`);
}

console.log('');
if (variablesOk) {
  console.log('RESULT  Variables ARE readable over REST on this plan.');
  console.log('        The nightly-pull design is available — a scheduled Action can');
  console.log('        regenerate the snapshot and open the PR, and the Figma plugin');
  console.log('        (steps 3-5 of docs/figma-sync.md) is not needed.');
} else {
  console.log('RESULT  Variables are NOT readable over REST with this token.');
  console.log('        Either the Enterprise gate is real, or the token lacks a variables');
  console.log('        scope. Check whether Figma even OFFERS that scope box on this plan —');
  console.log('        if it does not, that is the answer. Otherwise the plugin push is the');
  console.log('        route, and it works on Pro.');
}
process.exit(0);
