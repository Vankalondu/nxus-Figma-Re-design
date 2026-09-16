#!/usr/bin/env node
/**
 * Merge a plugin export into scripts/figma-tokens.json.
 *
 *   node scripts/figma-merge.mjs export.json
 *   cat export.json | node scripts/figma-merge.mjs
 *   node scripts/figma-merge.mjs export.json --check   # exit 1 if it would change anything
 *
 * WHY A MERGE RATHER THAN AN OVERWRITE
 * figma-tokens.json is two things in one file: data extracted from Figma
 * (Qaza, Mapped, Responsive) and human-written curation that no plugin can
 * reproduce — the `_cssPair` map the diff depends on, the `_role` notes, the
 * Allias family map, the `_verified` provenance. An overwrite would destroy the
 * curation; this replaces ONLY the three extracted sections and leaves
 * everything else untouched.
 *
 * WHY THE OUTPUT IS SORTED
 * Figma returns variables in internal order, which is not stable across edits.
 * Serialising in that order would make every export produce a diff full of
 * moved lines with no changed values — and a PR nobody can read is a PR nobody
 * reviews. Keys are sorted; ARRAYS are left alone, because for a weight list or
 * a [mobile, tablet, desktop] triple the order IS the data.
 */
import fs from 'fs';

const SNAP = 'scripts/figma-tokens.json';
const EXTRACTED = ['Qaza', 'Mapped', 'Responsive'];
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const file = args.find((a) => !a.startsWith('--'));

const readStdin = () => new Promise((res) => {
  let d = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => { d += c; });
  process.stdin.on('end', () => res(d));
});

const raw = file ? fs.readFileSync(file, 'utf8') : await readStdin();
if (!raw.trim()) {
  console.error('No export given. Pass a file path or pipe JSON on stdin.');
  process.exit(2);
}

let incoming;
try {
  incoming = JSON.parse(raw);
} catch (e) {
  console.error('Export is not valid JSON: ' + e.message);
  process.exit(2);
}
// The plugin wraps its payload; accept either shape.
if (incoming.data && !incoming.Qaza) incoming = incoming.data;

const missing = EXTRACTED.filter((s) => !incoming[s] || typeof incoming[s] !== 'object');
if (missing.length) {
  console.error('Export is missing section(s): ' + missing.join(', '));
  console.error('Refusing to merge a partial export — it would look like mass deletion.');
  process.exit(2);
}

const snap = JSON.parse(fs.readFileSync(SNAP, 'utf8'));

// Sort keys; leave arrays in their given order.
const sortKeys = (v) => Array.isArray(v)
  ? v
  : (v && typeof v === 'object')
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]))
      : v;

const before = JSON.stringify(snap, null, 1);
let changed = [];

for (const section of EXTRACTED) {
  // Curated `_`-prefixed notes live INSIDE these sections too (Qaza._role,
  // Mapped._cssPair, Responsive._updated). Keep them; replace only the data.
  const curated = Object.fromEntries(
    Object.entries(snap[section] || {}).filter(([k]) => k.startsWith('_')),
  );
  const incomingData = Object.fromEntries(
    Object.entries(incoming[section]).filter(([k]) => !k.startsWith('_')),
  );
  const oldData = Object.fromEntries(
    Object.entries(snap[section] || {}).filter(([k]) => !k.startsWith('_')),
  );

  const a = JSON.stringify(sortKeys(oldData));
  const b = JSON.stringify(sortKeys(incomingData));
  if (a !== b) {
    const keys = new Set([...Object.keys(oldData), ...Object.keys(incomingData)]);
    for (const k of [...keys].sort()) {
      const av = JSON.stringify(sortKeys(oldData[k]));
      const bv = JSON.stringify(sortKeys(incomingData[k]));
      if (av !== bv) changed.push(`${section}/${k}`);
    }
  }
  snap[section] = { ...curated, ...sortKeys(incomingData) };
}

snap.extractedAt = new Date().toISOString().slice(0, 10);

// --stamp-verified is for the automated path only. An export IS a verification
// — the values came out of Figma seconds earlier — so leaving the old stamp
// would make the freshness check fail on a snapshot that is demonstrably
// current. It stays opt-in rather than automatic because on a manual run a
// human should be the one asserting they looked.
if (args.includes('--stamp-verified')) {
  const today = new Date().toISOString().slice(0, 10);
  const why = args[args.indexOf('--stamp-verified') + 1];
  snap._verified = `${today} — ${why && !why.startsWith('--') ? why : 'produced by the export plugin and merged automatically'}`
    + '. Re-verify after any Figma edit: the diff script trusts this file and cannot detect its own staleness.';
}

const after = JSON.stringify(snap, null, 1) + '\n';

if (checkOnly) {
  // Deliberately keyed on VALUE changes, not on whether the file text differs.
  // The text always differs — extractedAt is stamped with today's date, and the
  // first merge also normalises key order. Exiting non-zero for that would make
  // --check permanently red and therefore useless.
  if (!changed.length) {
    console.log('CHECK  no token values changed — the export matches the committed snapshot.');
    if (before + '\n' !== after) {
      console.log('       (the file text would still move: date stamp and/or key ordering)');
    }
    process.exit(0);
  }
  console.log(`CHECK  ${changed.length} token value(s) would change:`);
  changed.forEach((c) => console.log('  ' + c));
  process.exit(1);
}

fs.writeFileSync(SNAP, after);
if (!changed.length) {
  console.log('MERGED  no token values changed (ordering/date normalised only).');
} else {
  console.log(`MERGED  ${changed.length} entr(ies) changed:`);
  changed.forEach((c) => console.log('  ' + c));
  console.log('\nNext: update _verified in ' + SNAP + ' once you have confirmed the change');
  console.log('is intended, then run `npm run verify:figma` to see the effect on the CSS.');
}
