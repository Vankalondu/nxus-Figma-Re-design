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
  // Red/Amber/Green were singletons here until the code carried only each
  // family's Base value. All 11 steps now exist in globals.css, so they are
  // full families and get compared step by step like the others.
  'Colors/Red': 'red',
  'Colors/Amber': 'amber',
  'Colors/Green': 'green',
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
// `transparent` and a palette colour at zero alpha render identically. Figma
// variables must carry a concrete RGBA, so Border/input light is stored as
// #061b2e00 (navy at 0 — not #00000000, which would break L-C1) against the
// CSS keyword. Same pixel, different spelling; not drift.
const norm = (v) => {
  const s = String(v).trim().toLowerCase();
  if (s === 'transparent' || /^#[0-9a-f]{6}00$/.test(s)) return 'transparent';
  return s;
};

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

// Roles resolve through the alias scale now (--text-heading: var(--navy-500)),
// so a literal string compare against Figma's resolved hex reports drift on
// every row. Follow the chain to a value before comparing. Dark mode reads
// .dark first and falls back to :root, matching the cascade.
function deref(val, mode) {
  const tbl = mode === 'dark' ? { ...cssVars, ...darkVars } : cssVars;
  let v = val, guard = 0;
  while (v && /^var\(/.test(v) && guard++ < 12) {
    const inner = v.match(/var\(\s*(--[a-z0-9-]+)/);
    if (!inner) break;
    v = tbl[inner[1]];
  }
  return v;
}

const mapped = [];
for (const [figName, cssName] of Object.entries(SNAP.Mapped._cssPair || {})) {
  const fig = SNAP.Mapped[figName];
  if (!fig) continue;
  const cl = deref(cssVars[cssName], 'light');
  const cd = deref(darkVars[cssName] ?? cssVars[cssName], 'dark');
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
console.log('  · Mapped is 52 vars and the CSS now carries a counterpart for all 39 colour roles,');
console.log('    resolving Qaza -> Allias -> Mapped on both sides. The layer that was "never');
console.log('    adopted" in earlier runs of this script is adopted: --background/--card/');
console.log('    --foreground and the rest were retired in step 4.3.');
console.log('  · Still asymmetric, on purpose: Status/info + info-tint are Figma-only (nothing');
console.log('    renders an info state) and --text-muted is code-only-and-unused. Both are OR-5.');
console.log('    Button/* (11 vars) is a component layer the code expresses as utilities, not tokens.');

console.log('\nSUMMARY  match ' + rows.match.length +
  '  ·  drift ' + rows.valueDrift.length +
  '  ·  figma-only ' + rows.figmaOnly.length +
  '  ·  ramp drift ' + ramp.filter(r => r[4] === 'DRIFT').length + '/' + ramp.length);
