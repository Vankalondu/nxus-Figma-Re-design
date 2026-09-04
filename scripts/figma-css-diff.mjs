#!/usr/bin/env node
/**
 * Figma ↔ CSS token diff.
 *
 * Reads the committed Figma snapshot (scripts/figma-tokens.json) and the live
 * CSS custom properties in src/styles/globals.css, and reports where they agree,
 * where they drift, and where one side has something the other does not.
 *
 * Governing principle (Vanessa, 2026-09-01):
 *   Figma is the guide for how things are NAMED, DERIVED and ORGANISED.
 *   The code and its Laws state WHAT SHOULD EXIST — the values.
 *
 * So a value mismatch is resolved in the code's favour by default, and a naming
 * mismatch is resolved in Figma's favour. Exceptions are called out inline.
 *
 * The step mapping is not an offset. Figma runs 100..500, Base, 600..1000 —
 * eleven steps with Base as the tonal anchor. CSS runs 50..950. So:
 *   Figma/100 -> --x-50 … Figma/500 -> --x-400 … Figma/Base -> --x-500 …
 *   Figma/600 -> --x-600 … Figma/1000 -> --x-950
 */
import fs from 'fs';

const SNAP = JSON.parse(fs.readFileSync('scripts/figma-tokens.json', 'utf8'));
const CSS = fs.readFileSync('src/styles/globals.css', 'utf8');

// Figma step -> CSS step. Base is the anchor, not a gap.
const STEP = {
  '100': '50', '200': '100', '300': '200', '400': '300', '500': '400',
  'Base': '500', '600': '600', '700': '700', '800': '800', '900': '900', '1000': '950',
};
const FAMILY = {
  'Colors/Blue': 'blue',
  'Colors/Light Blue': 'light',
  'Colors/Dark Blue': 'navy',
};
// Figma families with no CSS scale — the code has a single token instead.
const SINGLETON = {
  'Colors/Red': ['--scout-red', '--destructive'],
  'Colors/Amber': ['--scout-amber'],
  'Colors/Green': ['--scout-green'],
};

// --- parse the CSS :root block (light mode) ---
// Brace-match rather than searching for '.dark': line 1 of globals.css contains
// `@custom-variant dark (&:is(.dark *))`, so indexOf('.dark') lands at the top
// of the file and yields an empty block.
function blockAfter(src, marker, from = 0) {
  const start = src.indexOf(marker, from);
  if (start === -1) return '';
  const open = src.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(open + 1, i); }
  }
  return '';
}
const rootBlock = blockAfter(CSS, ':root');
const cssVars = {};
for (const m of rootBlock.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
  cssVars[m[1]] = m[2].trim().toLowerCase();
}

const rows = { match: [], valueDrift: [], figmaOnly: [], cssOnly: [], note: [] };
const norm = (v) => String(v).trim().toLowerCase();

// --- colour scales ---
for (const [figFam, cssFam] of Object.entries(FAMILY)) {
  for (const [figStep, cssStep] of Object.entries(STEP)) {
    const figVal = SNAP.Qaza[figFam]?.[figStep];
    const cssName = `--${cssFam}-${cssStep}`;
    const cssVal = cssVars[cssName];
    const figName = `${figFam}/${figStep}`;
    if (!figVal) continue;
    if (cssVal === undefined) { rows.figmaOnly.push([figName, figVal, cssName, '—']); continue; }
    (norm(figVal) === norm(cssVal) ? rows.match : rows.valueDrift).push([figName, figVal, cssName, cssVal]);
  }
}

// --- status colours: Figma family Base vs the CSS singleton ---
for (const [figFam, cssNames] of Object.entries(SINGLETON)) {
  const figVal = SNAP.Qaza[figFam]['Base'];
  for (const cssName of cssNames) {
    const cssVal = cssVars[cssName];
    if (cssVal === undefined) { rows.figmaOnly.push([`${figFam}/Base`, figVal, cssName, '—']); continue; }
    (norm(figVal) === norm(cssVal) ? rows.match : rows.valueDrift).push([`${figFam}/Base`, figVal, cssName, cssVal]);
  }
  const steps = Object.keys(SNAP.Qaza[figFam]).filter(s => s !== 'Base').length;
  rows.note.push(`${figFam} has ${steps} further steps (100…1000) with no CSS equivalent — the code carries only the Base value.`);
}

// --- responsive type ramp ---
const media = (min) => blockAfter(CSS, `@media (min-width: ${min}px)`);
const pick = (block, name) => {
  const m = block.match(new RegExp(`${name}\\s*:\\s*([0-9]+)px`));
  return m ? Number(m[1]) : undefined;
};
const RAMP = [
  ['Text/Headings/h1/text size', '--fs-h1'],
  ['Text/Headings/h2/text size', '--fs-h2'],
  ['Text/Headings/h3/text size', '--fs-h3'],
  ['Text/Body/lg/text size', '--fs-body-lg'],
  ['Text/Body/md/text size', '--fs-body'],
  ['Text/Body/sm/text size', '--fs-body-sm'],
  ['Text/Body/caption/text size', '--fs-caption'],
];
const tabletB = media(768), deskB = media(1024);
const ramp = [];
for (const [figName, cssName] of RAMP) {
  const fig = SNAP.Responsive[figName];
  if (!fig) continue;
  const mob = pick(rootBlock, cssName);
  const tab = pick(tabletB, cssName) ?? mob;
  const des = pick(deskB, cssName) ?? tab;
  const same = fig[0] === mob && fig[1] === tab && fig[2] === des;
  ramp.push([figName, fig.join('/'), cssName, [mob, tab, des].join('/'), same ? 'match' : 'DRIFT']);
}

// --- Mapped semantic layer vs the CSS semantic tokens ---
// Step 3 repointed Mapped to resolve to what the code renders. This keeps that
// honest: if either side moves, the pair stops matching here.
const darkBlock = blockAfter(CSS, '\n.dark {');
const darkVars = {};
for (const m of darkBlock.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) darkVars[m[1]] = m[2].trim().toLowerCase();

const mapped = [];
for (const [figName, cssName] of Object.entries(SNAP.Mapped._cssPair || {})) {
  const fig = SNAP.Mapped[figName];
  if (!fig) continue;
  const cl = cssVars[cssName];
  const cd = darkVars[cssName] ?? cl;
  if (cl === undefined) { mapped.push([figName, fig.join(' / '), cssName, 'not in CSS', 'MISSING']); continue; }
  const same = norm(fig[0]) === norm(cl) && norm(fig[1]) === norm(cd);
  mapped.push([figName, fig.join(' / '), cssName, [cl, cd].join(' / '), same ? 'match' : 'DRIFT']);
}

// --- report ---
const pad = (s, n) => String(s).padEnd(n);
const section = (title, list, cols) => {
  console.log(`\n${title}  (${list.length})`);
  if (!list.length) return;
  console.log('  ' + cols.map(([h, w]) => pad(h, w)).join(''));
  console.log('  ' + '-'.repeat(cols.reduce((a, [, w]) => a + w, 0)));
  for (const r of list) console.log('  ' + r.map((v, i) => pad(v, cols[i][1])).join(''));
};

const C = [['FIGMA', 30], ['VALUE', 12], ['CSS', 18], ['VALUE', 12]];
console.log('Figma ↔ CSS token diff        snapshot ' + SNAP.extractedAt);
console.log('Figma is the guide for naming and structure; the code states the values.');
section('MATCH — same value, Figma naming maps cleanly', rows.match, C);
section('VALUE DRIFT — code wins by default', rows.valueDrift, C);
section('FIGMA ONLY — exists in Figma, absent from the CSS', rows.figmaOnly, C);
section('RESPONSIVE TYPE RAMP', ramp, [['FIGMA', 30], ['M/T/D', 12], ['CSS', 18], ['M/T/D', 12], ['', 8]]);
section('MAPPED SEMANTIC LAYER — light / dark', mapped,
  [['FIGMA', 28], ['RESOLVES TO', 22], ['CSS', 22], ['VALUE', 22], ['', 8]]);

console.log('\nNOTES');
for (const n of rows.note) console.log('  · ' + n);
console.log('  · Mapped (36 vars, Light/Dark) is a richer semantic layer than the CSS has:');
console.log('    Surface/page|canvas|card|elevated|inverse|overlay, Border/subtle|default|strong|focus,');
console.log('    Text/heading|body|muted|placeholder|inverse|link|disabled, Button/*, Status/* + tints.');
console.log('    The CSS semantic set (--background, --card, --foreground, --muted-foreground, …) is');
console.log('    smaller and named differently. This is not drift — it is a layer never adopted.');

console.log('\nSUMMARY  match ' + rows.match.length +
  '  ·  drift ' + rows.valueDrift.length +
  '  ·  figma-only ' + rows.figmaOnly.length +
  '  ·  ramp drift ' + ramp.filter(r => r[4] === 'DRIFT').length + '/' + ramp.length);
