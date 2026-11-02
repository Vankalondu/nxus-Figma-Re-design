/**
 * NXUS rule checker — the rules.
 *
 * These are the rulebook laws (guidelines/Guidelines.md) that can be checked by reading code.
 * They mirror scripts/lint-tokens.mjs, widened for a Vue + SCSS + Tailwind codebase: that
 * script only has to police Tailwind classes in React, the devs' app also writes plain CSS.
 *
 * Nothing here can tell whether a screen LOOKS like the Figma file. It catches raw values —
 * colours, sizes, fonts and spacing that bypass the tokens — which is the one defect a
 * screenshot review cannot see.
 */

// ── Tailwind vocabulary (same lists as scripts/lint-tokens.mjs) ──────────────────────────
const TW_PALETTES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose',
].join('|');
const UTIL = 'text|bg|border|from|via|to|ring|divide|placeholder|outline|shadow|caret|accent|fill|stroke|decoration';
const LEGACY_NAMES = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'border', 'ring',
  'input-background', 'switch-background', 'chalk', 'midnight', 'canvas', 'midtone',
  'ember', 'ember-hover', 'ember-light', 'scout-green', 'scout-red', 'scout-amber',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-accent',
  'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
].sort((a, b) => b.length - a.length).join('|');

// The two typefaces of L-TY1, plus the keywords and generic families a font stack may end on.
const FONTS_OK = new Set([
  'figtree', 'plus jakarta sans', 'inherit', 'initial', 'unset', 'revert',
  'sans-serif', 'serif', 'monospace', 'system-ui', 'ui-sans-serif', 'ui-monospace',
  '-apple-system', 'blinkmacsystemfont', 'segoe ui', 'roboto', 'helvetica neue', 'arial',
  'apple color emoji', 'segoe ui emoji', 'noto color emoji',
]);
// Fallbacks above are tolerated only AFTER an NXUS face; a stack that starts with Arial is
// still a third font. checkFontStack enforces that order.

// L-S1: multiples of 4, plus the intra-atom exception (2px steps at or below 8px) and hairlines.
const SPACING_OK = (px) => px === 0 || px === 1 || px === 2 || px === 6 || px % 4 === 0;

export const RULES = {
  'L-G1': { title: 'Bind tokens, never raw values', fix: 'use an NXUS colour token (var(--…) from nxus-tokens, or the NXUS Tailwind class) instead of a literal colour' },
  'L-C1': { title: 'Light and dark come from the palette, never white or black', fix: 'use the NXUS light/dark tokens instead of white or black' },
  'L-C2': { title: 'No colour from outside the system', fix: "Tailwind's own palette is not NXUS — use an NXUS colour class or token" },
  'L-C10': { title: 'Retired token name', fix: 'this token no longer exists — use the current NXUS role name' },
  'L-TY1': { title: 'Two typefaces, no exceptions', fix: 'use Figtree (headings) or Plus Jakarta Sans (body and numbers)' },
  'L-TY3': { title: 'Use the ramp classes, not literal sizes', fix: 'use a type ramp class (.type-h1 … .type-micro) or its token instead of a fixed size' },
  'L-TY5': { title: 'Size is type-*, colour is text-*', fix: 'size classes are type-*, not text-*' },
  'L-S1': { title: '4-point grid for layout', fix: 'use a multiple of 4px from the NXUS spacing scale (2px steps are only allowed inside a pill or badge, at 8px or less)' },
};

// ── helpers ──────────────────────────────────────────────────────────────────────────────
const toPx = (num, unit) => (unit === 'rem' || unit === 'em' ? num * 16 : num);

function checkFontStack(stack) {
  const fonts = stack.split(',').map((f) => f.trim().replace(/^['"]|['"]$/g, '').toLowerCase()).filter(Boolean);
  if (!fonts.length || fonts[0].startsWith('var(') || fonts[0].startsWith('$')) return null;
  if (fonts[0] === 'figtree' || fonts[0] === 'plus jakarta sans' || ['inherit', 'initial', 'unset', 'revert'].includes(fonts[0])) {
    const bad = fonts.find((f) => !FONTS_OK.has(f) && !f.startsWith('var('));
    return bad || null;
  }
  return fonts[0];
}

/**
 * Check one line. `ctx` is 'css' for stylesheets and Vue <style> blocks, 'code' for
 * templates and scripts. Returns [{ id, hit }].
 */
export function checkLine(line, ctx) {
  const out = [];
  const add = (id, hit) => out.push({ id, hit: hit.trim() });
  let m;

  // Tailwind classes — they can appear anywhere (templates, scripts, @apply in styles).
  const tw = [
    ['L-C1', new RegExp(`\\b(?:${UTIL})-(?:white|black)(?:/[0-9]+)?\\b`, 'g')],
    ['L-C2', new RegExp(`\\b(?:${UTIL})-(?:${TW_PALETTES})-[0-9]{2,3}(?:/[0-9]+)?\\b`, 'g')],
    ['L-C10', new RegExp(`\\b(?:${UTIL})-(?:${LEGACY_NAMES})(?![-a-zA-Z0-9])`, 'g')],
    ['L-C10', /\b(?:text-text|border-border)-[a-z-]+/g],
    ['L-TY5', /(?<![-a-zA-Z0-9])text-(?:h[1-6]|body-lg|body-sm|caption|micro)(?![-a-zA-Z0-9])/g],
    ['L-G1', new RegExp(`\\b(?:${UTIL})-\\[(?:#[0-9A-Fa-f]{3,8}|(?:rgba?|hsla?)\\([^\\]]*\\))\\]`, 'g')],
    ['L-TY3', /(?<![-a-zA-Z0-9])text-\[\d+(?:\.\d+)?(?:px|rem|em|pt)\]/g],
    ['L-TY1', /(?<![-a-zA-Z0-9])font-\[['"]?[A-Za-z][^\]]*\]/g],
  ];
  for (const [id, re] of tw) while ((m = re.exec(line))) add(id, m[0]);

  // Tailwind spacing: arbitrary values off the grid, and the half steps that land off it.
  const twSpace = /(?<![-a-zA-Z0-9])-?(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-(?:\[(-?\d+(?:\.\d+)?)(px|rem)\]|(2\.5|3\.5))(?![-a-zA-Z0-9.])/g;
  while ((m = twSpace.exec(line))) {
    const px = m[3] ? Number(m[3]) * 4 : Math.abs(toPx(Number(m[1]), m[2]));
    if (!SPACING_OK(px)) add('L-S1', m[0]);
  }

  if (ctx === 'css') {
    // Custom-property definitions ARE the token layer — the one place literals belong.
    if (/^\s*--[\w-]+\s*:/.test(line)) return out;
    const decl = line.match(/^\s*([\w-]+|\$[\w-]+)\s*:\s*(.+?)\s*;?\s*$/);
    if (decl && !/\{\s*$/.test(line)) {
      const [, prop, value] = decl;
      const hex = value.match(/#[0-9A-Fa-f]{3,8}\b/g) || [];
      for (const h of hex) add(/^#(?:fff|ffffff|000|000000)$/i.test(h) ? 'L-C1' : 'L-G1', `${prop}: ${h}`);
      const fn = value.match(/\b(?:rgba?|hsla?)\([^)]*\)/g) || [];
      for (const f of fn) add('L-G1', `${prop}: ${f}`);
      if (/color|background|border|fill|stroke|outline|shadow/.test(prop) && /(?<![-\w])(?:white|black)(?![-\w])/.test(value)) add('L-C1', `${prop}: ${value}`);
      if (prop === 'font-size' && /^-?\d/.test(value)) add('L-TY3', `${prop}: ${value}`);
      if (prop === 'font-family') {
        const bad = checkFontStack(value);
        if (bad) add('L-TY1', `${prop}: ${value}`);
      }
      if (/^(?:padding|margin|gap|row-gap|column-gap)(?:-[a-z]+)?$/.test(prop)) {
        for (const v of value.matchAll(/(-?\d+(?:\.\d+)?)(px|rem)\b/g)) {
          if (!SPACING_OK(Math.abs(toPx(Number(v[1]), v[2])))) { add('L-S1', `${prop}: ${value}`); break; }
        }
      }
    }
  } else {
    // Templates and scripts: a colour literal inside quotes, a style attribute or a style object.
    // `[` is left out on purpose: `bg-[#1E88E5]` is already reported by the Tailwind rule.
    const hex = /(?<=["'`:(,]\s*)#[0-9A-Fa-f]{3,8}(?![\w-])/g;
    while ((m = hex.exec(line))) add(/^#(?:fff|ffffff|000|000000)$/i.test(m[0]) ? 'L-C1' : 'L-G1', m[0]);
    const fn = /(?<![\w[-])(?:rgba?|hsla?)\([^)]*\)/g;
    while ((m = fn.exec(line))) add('L-G1', m[0]);
    const fs = /\bfont-?size\s*[:=]\s*["'`]?\d+(?:\.\d+)?(?:px|rem|em|pt)?\b/gi;
    while ((m = fs.exec(line))) add('L-TY3', m[0]);
    const ff = /\bfont-?family\s*:\s*["'`]?([^;"'`}]+)/gi;
    while ((m = ff.exec(line))) if (checkFontStack(m[1])) add('L-TY1', m[0]);
  }
  return dedupe(out);
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((f) => {
    const k = `${f.id}|${f.hit}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Blank out comments but keep line breaks, so line numbers stay true. A rule's own note may
 * quote the thing it forbids. Handles /* *\/, // (not URLs) and <!-- -->.
 */
export function stripComments(src, kind) {
  let s = src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
  if (kind !== 'css-plain') {
    s = s.replace(/(^|[^:\w"'`])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
  }
  return s;
}

/** Check a whole file's text. Returns [{ line, id, hit }]. */
export function checkFile(path, text) {
  const ext = (path.match(/\.([a-z]+)$/i) || [])[1]?.toLowerCase();
  const raw = text.split('\n');
  const lines = stripComments(text, ext === 'css' ? 'css-plain' : 'any').split('\n');
  const isStyleFile = ['css', 'scss', 'sass', 'less'].includes(ext);
  const findings = [];
  let inStyle = false;
  lines.forEach((line, i) => {
    if (ext === 'vue') {
      if (/<style\b/.test(raw[i])) { inStyle = true; return; }
      if (/<\/style>/.test(raw[i])) { inStyle = false; return; }
    }
    // Escape hatch for colour that is data (L-G2) or a reviewed exception:
    //   … // nxus-ignore           (this line)
    //   // nxus-ignore-next-line   (the next one)
    if (/nxus-ignore(?!-next-line)/.test(raw[i]) || (i > 0 && /nxus-ignore-next-line/.test(raw[i - 1]))) return;
    const ctx = isStyleFile || inStyle ? 'css' : 'code';
    for (const f of checkLine(line, ctx)) findings.push({ line: i + 1, ...f });
  });
  return findings;
}

export const EXTENSIONS = /\.(vue|tsx|jsx|ts|js|mjs|cjs|css|scss|sass|less|html)$/i;
