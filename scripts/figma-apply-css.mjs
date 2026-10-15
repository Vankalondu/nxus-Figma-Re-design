#!/usr/bin/env node
/**
 * Write Figma's token values into src/styles/globals.css, so the sync PR changes
 * what the app renders — not only the record of Figma.
 *
 *   node scripts/figma-apply-css.mjs          # edit globals.css in place, print what moved
 *   node scripts/figma-apply-css.mjs --dry    # print only
 *
 * Runs in .github/workflows/figma-sync.yml right after figma-merge.mjs. Nothing
 * reaches main without a person merging the PR, so "code wins by default" became
 * "the reviewer decides": the PR now carries the CSS edit for them to accept or
 * reject (decided with Vanessa, 15 Oct 2026).
 *
 * WHAT IT WRITES — the same three layers figma-css-diff.mjs compares:
 *   1. Qaza colour primitives -> --blue-500 etc. in the base :root (literal hex)
 *   2. Mapped roles (via Mapped._cssPair) -> the role variable, light in :root and
 *      dark in .dark. Prefers pointing at a primitive that holds the new value
 *      (`var(--blue-600)`) so the alias chain survives; a literal only if none does.
 *   3. The responsive type ramp -> --fs-* in :root and the 768 / 1024 blocks.
 *
 * WHAT IT DOES NOT DO
 *   - Add tokens that exist only in Figma, or delete ones that exist only in CSS.
 *     A new or removed token is a structural decision; it is reported for a human.
 *   - Follow renames (a rename looks like delete + add — see docs/figma-sync.md).
 */
import fs from 'fs';

const CSS_PATH = 'src/styles/globals.css';
const SNAP = JSON.parse(fs.readFileSync('scripts/figma-tokens.json', 'utf8'));
const dry = process.argv.includes('--dry');
let css = fs.readFileSync(CSS_PATH, 'utf8');

// Keep in step with figma-css-diff.mjs.
const STEP = { '100': '50', '200': '100', '300': '200', '400': '300', '500': '400', 'Base': '500', '600': '600', '700': '700', '800': '800', '900': '900', '1000': '950' };
const FAMILY = { 'Colors/Blue': 'blue', 'Colors/Light Blue': 'light', 'Colors/Dark Blue': 'navy', 'Colors/Red': 'red', 'Colors/Amber': 'amber', 'Colors/Green': 'green', 'Colors/Cyan': 'cyan', 'Colors/Violet': 'violet' };
const RAMP = [
  ['Text/Headings/h1/text size', '--fs-h1'], ['Text/Headings/h2/text size', '--fs-h2'], ['Text/Headings/h3/text size', '--fs-h3'],
  ['Text/Body/lg/text size', '--fs-body-lg'], ['Text/Body/md/text size', '--fs-body'], ['Text/Body/sm/text size', '--fs-body-sm'],
  ['Text/Body/caption/text size', '--fs-caption'],
];

// A block is located fresh each time, because every edit shifts later offsets.
// Brace-matched, like figma-css-diff.mjs: `.dark` also appears in line 1's @custom-variant.
function block(marker) {
  const start = css.indexOf(marker);
  if (start === -1) return null;
  const open = css.indexOf('{', start + (marker.endsWith('{') ? marker.length - 1 : 0));
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return { open: open + 1, close: i };
  }
  return null;
}
const BLOCKS = {
  base: () => block(':root'),
  dark: () => block('\n.dark {'),
  tablet: () => { const m = block('@media (min-width: 768px)'); return m && innerRoot(m); },
  desktop: () => { const m = block('@media (min-width: 1024px)'); return m && innerRoot(m); },
};
function innerRoot(m) {
  const s = css.indexOf(':root', m.open);
  const open = css.indexOf('{', s) + 1; let depth = 1;
  for (let i = open; i < m.close; i++) { if (css[i] === '{') depth++; else if (css[i] === '}' && --depth === 0) return { open, close: i }; }
  return null;
}
const declRe = (name) => new RegExp(`(^|[\\s;{])(${name.replace(/[-]/g, '\\-')})(\\s*:\\s*)([^;]+)(;)`);
function read(where, name) {
  const b = BLOCKS[where](); if (!b) return undefined;
  const m = css.slice(b.open, b.close).match(declRe(name));
  return m ? m[4].trim() : undefined;
}
const changes = [];
function write(where, name, value, why) {
  const b = BLOCKS[where](); if (!b) return false;
  const body = css.slice(b.open, b.close);
  const m = body.match(declRe(name));
  if (m) {
    if (m[4].trim().toLowerCase() === value.toLowerCase()) return false;
    const next = body.replace(declRe(name), `$1$2$3${value}$5`);
    css = css.slice(0, b.open) + next + css.slice(b.close);
    changes.push(`${where.padEnd(7)} ${name}: ${m[4].trim()} -> ${value}   (${why})`);
  } else {
    css = css.slice(0, b.close) + `  ${name}: ${value};\n` + css.slice(b.close);
    changes.push(`${where.padEnd(7)} ${name}: (inherited) -> ${value}   (${why})`);
  }
  return true;
}
const norm = (v) => { const s = String(v ?? '').trim().toLowerCase(); return (s === 'transparent' || /^#[0-9a-f]{6}00$/.test(s)) ? 'transparent' : s; };
function vars(where) {
  const b = BLOCKS[where](); const out = {}; if (!b) return out;
  for (const m of css.slice(b.open, b.close).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) out[m[1]] = m[2].trim();
  return out;
}
function deref(val, tbl) {
  let v = val, g = 0;
  while (v && /^var\(/.test(v) && g++ < 12) { const n = v.match(/var\(\s*(--[a-z0-9-]+)/); if (!n) break; v = tbl[n[1]]; }
  return v;
}

// 1. primitives
for (const [fam, cssFam] of Object.entries(FAMILY)) for (const [step, cssStep] of Object.entries(STEP)) {
  const fig = SNAP.Qaza[fam]?.[step]; if (!fig) continue;
  const name = `--${cssFam}-${cssStep}`;
  const cur = read('base', name); if (cur === undefined) continue;
  if (norm(cur) !== norm(fig)) write('base', name, fig.toLowerCase(), `${fam}/${step}`);
}

// 2. roles — after primitives, so a role that follows a moved primitive needs no edit
const PRIMS = Object.values(FAMILY);
function pointer(hex, tbl) {
  if (norm(hex) === 'transparent') return 'transparent';
  const hit = Object.entries(tbl).find(([n, v]) => PRIMS.some((p) => n.startsWith(`--${p}-`)) && norm(v) === norm(hex));
  return hit ? `var(${hit[0]})` : hex.toLowerCase();
}
for (const [figName, cssName] of Object.entries(SNAP.Mapped._cssPair || {})) {
  const fig = SNAP.Mapped[figName]; if (!fig) continue;
  const base = vars('base'), dark = vars('dark');
  if (base[cssName] === undefined) continue;
  if (norm(deref(base[cssName], base)) !== norm(fig[0])) write('base', cssName, pointer(fig[0], base), `${figName} light`);
  const both = { ...vars('base'), ...vars('dark') };
  const darkVal = vars('dark')[cssName] ?? vars('base')[cssName];
  if (fig[1] && norm(deref(darkVal, both)) !== norm(fig[1])) write('dark', cssName, pointer(fig[1], both), `${figName} dark`);
}

// 3. responsive type ramp
for (const [figName, cssName] of RAMP) {
  const fig = SNAP.Responsive[figName]; if (!fig) continue;
  const [m, t, d] = fig.map((n) => `${n}px`);
  if (read('base', cssName) !== undefined && read('base', cssName) !== m) write('base', cssName, m, `${figName} mobile`);
  const tab = read('tablet', cssName) ?? read('base', cssName);
  if (tab !== t) write('tablet', cssName, t, `${figName} tablet`);
  const desk = read('desktop', cssName) ?? read('tablet', cssName) ?? read('base', cssName);
  if (desk !== d) write('desktop', cssName, d, `${figName} desktop`);
}

if (!changes.length) { console.log('APPLY  globals.css already matches Figma — nothing written.'); process.exit(0); }
console.log(`APPLY  ${changes.length} CSS value(s) ${dry ? 'would change' : 'written to ' + CSS_PATH}:`);
for (const c of changes) console.log('  ' + c);
if (!dry) fs.writeFileSync(CSS_PATH, css);
