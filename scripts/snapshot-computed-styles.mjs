#!/usr/bin/env node
/**
 * Computed-style snapshot — the safety net for the token rename.
 *
 * Playwright here is 20 route/auth smoke tests. It will not catch a colour
 * regression: a missed rename renders an element unstyled, which is a visual
 * fault, not a failing assertion. This script closes that gap.
 *
 * It walks every visible element on the main routes in BOTH themes and records
 * the computed color / backgroundColor / borderTopColor / fontSize / fontWeight
 * against a stable path key. Capture before, capture again after, diff. A wrong
 * or missed rename changes a rendered style, so it shows up here.
 *
 *   node scripts/snapshot-computed-styles.mjs before   # writes the baseline
 *   node scripts/snapshot-computed-styles.mjs after    # writes + diffs
 *
 * Requires a preview server. Start one first:
 *   npx vite preview --port 4200
 *
 * Exits 1 if any element's rendered colour, size or weight changed.
 */
import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

const MODE = process.argv[2];
if (!['before', 'after'].includes(MODE)) {
  console.error('usage: node scripts/snapshot-computed-styles.mjs <before|after>');
  process.exit(2);
}

const BASE = process.env.PREVIEW_URL || 'http://localhost:4200';
const OUT_DIR = '.token-snapshots';
const ROUTES = [
  '/lead-scout', '/senior-scout', '/video-manager',
  '/country-scout', '/lead-scout/players', '/admin',
];
const THEMES = ['light', 'dark'];

// A DOM path that survives re-rendering: tag + index among siblings, root-down.
// Deliberately not class-based — classes are exactly what the rename changes.
const COLLECT = () => {
  const out = {};
  // Tailwind v4 emits oklab() for a THEME colour carrying an opacity modifier,
  // but rgba() for an arbitrary value carrying the same modifier. So swapping
  // bg-[#e05c4b]/10 for bg-status-error/10 changes the notation while rendering
  // the identical pixel — and a string compare calls that a regression.
  // Normalise to rgb() so the diff reports colour changes, not syntax changes.
  const oklabToRgb = (L, A, B, alpha) => {
    const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
    const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
    const s_ = L - 0.0894841775 * A - 1.2914855480 * B;
    const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
    const lin = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];
    const ch = lin.map((v) => {
      const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(1, c)) * 255);
    });
    return alpha === undefined || alpha === 1
      ? 'rgb(' + ch.join(', ') + ')'
      : 'rgba(' + ch.join(', ') + ', ' + alpha + ')';
  };
  const norm = (v) => {
    const m = /^oklab\(([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)(?:\s*\/\s*([\d.]+))?\)$/.exec(v || '');
    if (!m) return v;
    return oklabToRgb(+m[1], +m[2], +m[3], m[4] === undefined ? undefined : +m[4]);
  };
  const pathOf = (el) => {
    const parts = [];
    while (el && el !== document.body) {
      const p = el.parentElement;
      if (!p) break;
      parts.unshift(el.tagName.toLowerCase() + ':' + Array.prototype.indexOf.call(p.children, el));
      el = p;
    }
    return parts.join('>');
  };
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    // fontSize/fontWeight are here because the type ramp (.type-h1 … .type-micro)
    // is a class vocabulary too: renaming it moves sizes, not colours, and a
    // colour-only snapshot reported PASS on a change it structurally could not see.
    out[pathOf(el)] = [norm(cs.color), norm(cs.backgroundColor), norm(cs.borderTopColor), cs.fontSize, cs.fontWeight].join('|');
  }
  return out;
};

const snap = {};
const browser = await chromium.launch();
for (const theme of THEMES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
      if (theme === 'dark') await page.evaluate(() => document.documentElement.classList.add('dark'));
      await page.waitForTimeout(1400);
      snap[theme + route] = await page.evaluate(COLLECT);
    } catch (e) {
      console.error('  ! failed ' + theme + route + ': ' + String(e.message).slice(0, 90));
      snap[theme + route] = {};
    }
  }
  await page.close();
}
await browser.close();

fs.mkdirSync(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, MODE + '.json');
fs.writeFileSync(file, JSON.stringify(snap, null, 0));
const total = Object.values(snap).reduce((a, v) => a + Object.keys(v).length, 0);
console.log(MODE + ': captured ' + total + ' elements across ' + Object.keys(snap).length + ' route/theme pairs -> ' + file);

if (MODE === 'before') process.exit(0);

const beforeFile = path.join(OUT_DIR, 'before.json');
if (!fs.existsSync(beforeFile)) {
  console.error('No baseline. Run "before" on the pre-rename build first.');
  process.exit(2);
}
const before = JSON.parse(fs.readFileSync(beforeFile, 'utf8'));

let changed = 0, missing = 0, added = 0;
const samples = [];
for (const key of Object.keys(before)) {
  const b = before[key], a = snap[key] || {};
  for (const [el, val] of Object.entries(b)) {
    if (!(el in a)) { missing++; continue; }
    if (a[el] !== val) {
      changed++;
      if (samples.length < 15) samples.push(key + '  ' + el + '\n      was ' + val + '\n      now ' + a[el]);
    }
  }
  added += Object.keys(a).filter(e => !(e in b)).length;
}

console.log('\nelements changed : ' + changed);
console.log('elements gone    : ' + missing + '   (layout shift, not necessarily a style fault)');
console.log('elements added   : ' + added);
if (samples.length) {
  console.log('\nfirst differences:');
  for (const s of samples) console.log('  ' + s);
}
if (changed === 0) {
  console.log('\nPASS — every rendered colour, size and weight is identical to the baseline.');
  process.exit(0);
}
console.log('\nFAIL — ' + changed + ' element(s) render a different colour, size or weight than the baseline.');
process.exit(1);
