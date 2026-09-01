#!/usr/bin/env node
/**
 * Token lint — enforces the colour Laws in guidelines/Guidelines.md.
 *
 * Two kinds of check, deliberately:
 *
 *   ERRORS   rules the codebase already satisfies. Any new violation fails the
 *            build, so the sweeps that got them to zero cannot silently undo.
 *
 *   RATCHET  a rule with real outstanding debt (bracketed hex). Failing on all
 *            of it would just get the lint switched off, so instead the count
 *            is pinned: it may go down, never up. Lower BASELINE as you fix.
 *
 * Scope: src/app, excluding src/app/imports (generated Figma output, quarantined
 * per Guidelines §11.3).
 */
import fs from 'fs';
import path from 'path';

const ROOT = 'src/app';
const SKIP_DIRS = new Set(['imports']);

// Every Tailwind palette, not just the neutrals. The rulebook's own catch-grep
// named gray|slate|zinc only, which is exactly why 68 stray classes survived
// several passes — emerald, rose and blue are just as off-palette.
const TW_PALETTES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose',
].join('|');
const UTIL = 'text|bg|border|from|via|to|ring|divide|placeholder|outline|shadow|caret|accent|fill|stroke|decoration';

const RULES = [
  {
    id: 'L-C1',
    what: 'white or black (use --chalk / --midnight)',
    re: new RegExp(`\\b(${UTIL})-(white|black)(/[0-9]+)?\\b`, 'g'),
  },
  {
    id: 'L-C1',
    what: 'pure white/black literal',
    re: /#(?:fff|ffffff|000|000000)\b/gi,
    // chart.tsx matches recharts' own hardcoded output in attribute selectors
    // in order to override it — rewriting it would break the override.
    // Documented as an explicit exception in L-C1.
    allow: (file, line) =>
      file.endsWith('components/ui/chart.tsx') && /\[stroke='#(fff|ccc)'\]/.test(line),
  },
  {
    id: 'L-C2',
    what: 'Tailwind palette class (not the NXUS palette)',
    re: new RegExp(`\\b(${UTIL})-(${TW_PALETTES})-[0-9]{2,3}(/[0-9]+)?\\b`, 'g'),
  },
];

// Bracketed hex: correct colours are often written as literals here
// (text-[#1E88E5] IS --primary), so this is debt rather than breakage.
const HEX_UTIL = new RegExp(`\\b(${UTIL})-\\[#[0-9A-Fa-f]{3,8}\\]`, 'g');
const BASELINE = 662; // measured 2026-09-01 by this script. Only ever lower this.

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(f); continue; }
    if (/\.tsx?$/.test(e.name)) files.push(f);
  }
})(ROOT);

const errors = [];
let hexCount = 0;

for (const file of files) {
  const rel = file.split(path.sep).join('/');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line))) {
        if (rule.allow && rule.allow(rel, line)) continue;
        errors.push({ rel, n: i + 1, id: rule.id, what: rule.what, hit: m[0] });
      }
    }
    HEX_UTIL.lastIndex = 0;
    hexCount += (line.match(HEX_UTIL) || []).length;
  });
}

console.log(`token lint — ${files.length} files scanned (src/app, imports/ excluded)\n`);

if (errors.length) {
  console.log(`FAIL  ${errors.length} violation(s):\n`);
  for (const e of errors.slice(0, 40)) {
    console.log(`  ${e.rel}:${e.n}  [${e.id}] ${e.hit}  — ${e.what}`);
  }
  if (errors.length > 40) console.log(`  … and ${errors.length - 40} more`);
  console.log('');
} else {
  console.log('PASS  L-C1 (no white/black) · L-C2 (no Tailwind palettes)');
}

const delta = hexCount - BASELINE;
if (delta > 0) {
  console.log(`\nFAIL  L-G1 ratchet: ${hexCount} bracketed-hex utilities, baseline ${BASELINE} (+${delta}).`);
  console.log('      Bind a token instead of a literal, or lower the baseline if you');
  console.log('      genuinely removed some and re-measured.');
} else {
  const note = delta < 0
    ? `${-delta} below baseline — lower BASELINE in scripts/lint-tokens.mjs to lock it in`
    : 'at baseline';
  console.log(`\nRATCHET  L-G1: ${hexCount} bracketed-hex utilities (${note}).`);
}

process.exit(errors.length || delta > 0 ? 1 : 0);
