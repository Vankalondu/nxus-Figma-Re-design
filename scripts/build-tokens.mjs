#!/usr/bin/env node
/**
 * Build the downloadable token files from src/styles/globals.css.
 *
 *   node scripts/build-tokens.mjs            # write public/downloads/tokens/*
 *   node scripts/build-tokens.mjs --check    # exit 1 if the token count looks wrong
 *
 * WHY globals.css AND NOT figma-tokens.json
 * The downloads must match what the live app renders. figma-tokens.json is a record
 * of Figma; merging a Figma sync PR updates it without changing a single rendered
 * colour (docs/figma-sync.md, "What the PR contains"). globals.css is what ships, so
 * it is the only honest source. Runs on predev/prebuild, so every deploy regenerates
 * the files from whatever globals.css says at that moment.
 *
 * WHAT COUNTS AS A TOKEN
 * Custom properties declared in the base `:root`, the `.dark` block and the two
 * breakpoint `:root` blocks (768, 1024), plus the later `:root` that holds the table
 * density (--tbl-*). NOT the `@theme inline` block: those --color-* / --text-color-*
 * entries are Tailwind v4 plumbing that alias the real tokens. They are read only to
 * learn the utility names the app uses, so the Tailwind v3 preset emits the same ones.
 *
 * OUTPUTS (public/downloads/tokens/)
 *   tokens.css           CSS variables, light + .dark + breakpoints, var() kept as written,
 *                        plus `--x-rgb` channels for every solid colour (Tailwind v3 alpha)
 *   tokens.json          W3C Design Tokens (DTCG) format, values resolved; dark and
 *                        breakpoint values under $extensions
 *   tailwind.preset.cjs  Tailwind v3 preset (works in v3 configs, CJS or ESM)
 *   _tokens.scss         SCSS variables (light) + a dark map
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SRC = 'src/styles/globals.css';
const OUT = 'public/downloads/tokens';
const CSS = fs.readFileSync(SRC, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

// Fonts are set on elements in globals.css, not as variables. Guidelines §4 names them.
const FONTS = {
  heading: ['Figtree', 'sans-serif'],
  body: ['Plus Jakarta Sans', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
};

// ---- parse: walk the file once, tracking which block each declaration sits in ----
const buckets = { base: {}, dark: {}, tablet: {}, desktop: {}, theme: {} };
const order = [];
{
  const stack = [];
  let buf = '';
  for (let i = 0; i < CSS.length; i++) {
    const ch = CSS[i];
    if (ch === '{') { stack.push(buf.trim()); buf = ''; continue; }
    if (ch === '}') { flush(buf, stack); buf = ''; stack.pop(); continue; }
    if (ch === ';') { flush(buf, stack); buf = ''; continue; }
    buf += ch;
  }
  function flush(decl, ctx) {
    const m = decl.match(/^\s*(--[a-z0-9-]+)\s*:\s*([\s\S]+?)\s*$/i);
    if (!m) return;
    const [, name, value] = m;
    const sel = ctx[ctx.length - 1];
    const outer = ctx.length > 1 ? ctx[ctx.length - 2] : '';
    let bucket = null;
    if (ctx.length === 1 && sel === ':root') bucket = 'base';
    else if (ctx.length === 1 && sel === '.dark') bucket = 'dark';
    else if (ctx.length === 1 && sel === '@theme inline') bucket = 'theme';
    else if (ctx.length === 2 && sel === ':root' && /min-width:\s*768px/.test(outer)) bucket = 'tablet';
    else if (ctx.length === 2 && sel === ':root' && /min-width:\s*1024px/.test(outer)) bucket = 'desktop';
    if (!bucket) return;
    buckets[bucket][name] = value.replace(/\s+/g, ' ');
    if (bucket !== 'theme' && !order.includes(name)) order.push(name);
  }
}

// ---- resolve var() chains per mode; dark/breakpoints fall back to base, like the cascade ----
const table = (mode) => ({ ...buckets.base, ...(mode === 'dark' ? buckets.dark : {}),
  ...(mode === 'tablet' ? buckets.tablet : {}), ...(mode === 'desktop' ? { ...buckets.tablet, ...buckets.desktop } : {}) });
function resolve(value, mode) {
  const t = table(mode);
  let v = value, guard = 0;
  while (guard++ < 20 && /var\(/.test(v)) {
    v = v.replace(/var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^)]+))?\)/gi, (_, n, fb) => t[n] ?? fb ?? `var(${n})`);
  }
  return v;
}
const value = (name, mode) => {
  const own = mode === 'base' ? buckets.base[name]
    : mode === 'desktop' ? (buckets.desktop[name] ?? buckets.tablet[name] ?? buckets.base[name])
    : (buckets[mode][name] ?? buckets.base[name]);
  return own === undefined ? undefined : resolve(own, mode === 'base' ? 'light' : mode);
};

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const isColor = (v) => v !== undefined && (HEX.test(v) || /^#[0-9a-f]{8}$/i.test(v) || /^rgba?\(/i.test(v) || /^hsla?\(/i.test(v) || v === 'transparent');
const rgbChannels = (hex) => {
  let h = hex.slice(1); if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ');
};
const typeOf = (name, v) => {
  if (name.startsWith('--shadow')) return 'shadow';
  if (isColor(v)) return 'color';
  if (/^-?[0-9.]+(px|rem|em)$/.test(v)) return 'dimension';
  if (/^[0-9]+$/.test(v)) return name.includes('weight') ? 'fontWeight' : 'number';
  return undefined;
};

const tokens = order.map((name) => {
  const light = value(name, 'base');
  const t = { name, light, type: typeOf(name, light) };
  // A token not redeclared in .dark still changes there if what it points at does.
  const dark = value(name, 'dark');
  if (name in buckets.dark || dark !== light) t.dark = dark;
  if (name in buckets.tablet) t.tablet = value(name, 'tablet');
  if (name in buckets.desktop || name in buckets.tablet) t.desktop = value(name, 'desktop');
  return t;
});
const byName = Object.fromEntries(tokens.map((t) => [t.name, t]));

if (process.argv.includes('--check')) {
  const n = tokens.length;
  console.log(`tokens: ${n} (${tokens.filter((t) => t.type === 'color').length} colours)`);
  process.exit(n > 100 ? 0 : 1);
}

const hash = crypto.createHash('sha256').update(JSON.stringify(tokens)).digest('hex').slice(0, 8);
const today = new Date().toISOString().slice(0, 10);
const version = hash; // content hash: stays the same until a token value changes
const banner = (c) => `${c} NXUS design tokens — version ${version}\n${c} Generated from src/styles/globals.css by scripts/build-tokens.mjs. Do not edit by hand.\n`;

// ---- tokens.css ----
const decl = (obj, names, indent = '  ') => names.map((n) => `${indent}${n}: ${obj[n]};`).join('\n');
const rgbLines = (mode) => tokens.filter((t) => {
  const v = mode === 'dark' ? t.dark : mode === 'tablet' ? t.tablet : mode === 'desktop' ? t.desktop : t.light;
  return v && HEX.test(v) && (mode === 'base' || (mode === 'dark' && t.dark !== undefined));
}).map((t) => `  ${t.name}-rgb: ${rgbChannels(mode === 'dark' ? t.dark : t.light)};`).join('\n');
const baseNames = Object.keys(buckets.base);
let css = `/*\n * NXUS design tokens — version ${version}\n * Generated from src/styles/globals.css by scripts/build-tokens.mjs. Do not edit by hand.\n * Light is the default. Add class="dark" (or data-theme="dark") on <html> for dark.\n */\n`;
css += `:root {\n${decl(buckets.base, baseNames)}\n\n  /* rgb channels, for Tailwind v3 opacity modifiers (bg-x/50) */\n${rgbLines('base')}\n}\n\n`;
css += `@media (min-width: 768px) {\n  :root {\n${decl(buckets.tablet, Object.keys(buckets.tablet), '    ')}\n  }\n}\n\n`;
css += `@media (min-width: 1024px) {\n  :root {\n${decl(buckets.desktop, Object.keys(buckets.desktop), '    ')}\n  }\n}\n\n`;
css += `.dark, [data-theme="dark"] {\n${decl(buckets.dark, Object.keys(buckets.dark))}\n\n${rgbLines('dark')}\n}\n`;

// ---- tokens.json (DTCG) ----
const groupOf = (name) => {
  const n = name.slice(2);
  const fam = n.match(/^(blue|navy|light|red|amber|green|violet|cyan)-/);
  if (fam) return ['palette', fam[1], n.slice(fam[1].length + 1)];
  const top = n.split('-')[0];
  return [top, n.slice(top.length + 1) || 'default'];
};
const dtcg = { $description: `NXUS design tokens, version ${version}. Values are the light theme at mobile width; dark and breakpoint values are in $extensions["com.nxus"].` };
for (const t of tokens) {
  const keys = groupOf(t.name);
  let node = dtcg;
  for (const k of keys.slice(0, -1)) node = node[k] ??= {};
  const leaf = { $value: t.light };
  if (t.type && t.type !== 'shadow') leaf.$type = t.type;
  const ext = {};
  if (t.dark !== undefined) ext.dark = t.dark;
  if (t.tablet !== undefined) ext.tablet = t.tablet;
  if (t.desktop !== undefined) ext.desktop = t.desktop;
  ext.cssVar = t.name;
  leaf.$extensions = { 'com.nxus': ext };
  node[keys[keys.length - 1]] = leaf;
}

// ---- tailwind.preset.cjs (v3) ----
// Use the app's own utility names: read them from the @theme inline block.
const colorRef = (target) => {
  const t = byName[target];
  const solid = t && HEX.test(t.light) && (t.dark === undefined || HEX.test(t.dark));
  return solid ? `rgb(var(${target}-rgb) / <alpha-value>)` : `var(${target})`;
};
const themeMap = (prefix) => Object.fromEntries(Object.entries(buckets.theme)
  .filter(([k]) => k.startsWith(prefix))
  .map(([k, v]) => [k.slice(prefix.length), colorRef(v.match(/var\((--[a-z0-9-]+)\)/i)?.[1])]));
const colors = themeMap('--color-');
colors.nxus = Object.fromEntries(tokens.filter((t) => groupOf(t.name)[0] === 'palette').map((t) => [t.name.slice(2), colorRef(t.name)]));
const preset = {
  darkMode: ['variant', ['&:is(.dark *)', '&:is([data-theme="dark"] *)']],
  theme: { extend: {
    colors,
    textColor: themeMap('--text-color-'),
    borderColor: themeMap('--border-color-'),
    fontFamily: FONTS,
    boxShadow: Object.fromEntries(tokens.filter((t) => t.name.startsWith('--shadow-')).map((t) => [t.name.slice(9), `var(${t.name})`])),
    borderRadius: { DEFAULT: 'var(--radius)' },
    fontSize: Object.fromEntries(tokens.filter((t) => t.name.startsWith('--fs-')).map((t) => {
      const k = t.name.slice(5); const lh = byName[`--lh-${k}`];
      return [`fs-${k}`, lh ? [`var(${t.name})`, { lineHeight: `var(--lh-${k})` }] : `var(${t.name})`];
    })),
    spacing: { page: 'var(--pad-page)', card: 'var(--pad-card)', section: 'var(--gap-section)', grid: 'var(--gap-grid)', stack: 'var(--gap-stack)' },
  } },
};
const presetSrc = `${banner('//')}// Tailwind v3 preset. Requires tokens.css to be loaded once (it defines the variables).\n// Usage: module.exports = { presets: [require('./nxus.tailwind.preset.cjs')], content: [...] }\nmodule.exports = ${JSON.stringify(preset, null, 2)};\n`;

// ---- _tokens.scss ----
const scssVal = (v) => (/,/.test(v) ? `(${v})` : v);
const scssName = (n) => `$nxus-${n.slice(2)}`;
let scss = `${banner('//')}// Light values as SCSS variables, plus $nxus-dark and $nxus-breakpoints maps.\n// For theming at runtime prefer the CSS variables in tokens.css; SCSS values are fixed at compile time.\n\n`;
scss += tokens.map((t) => `${scssName(t.name)}: ${scssVal(t.light)};`).join('\n');
scss += `\n\n$nxus-dark: (\n${tokens.filter((t) => t.dark !== undefined).map((t) => `  '${t.name.slice(2)}': ${scssVal(t.dark)},`).join('\n')}\n);\n`;
scss += `\n$nxus-breakpoints: (\n  'tablet': 768px,\n  'desktop': 1024px,\n);\n`;
scss += `\n$nxus-responsive: (\n${tokens.filter((t) => t.tablet !== undefined || t.desktop !== undefined).map((t) => `  '${t.name.slice(2)}': (${t.light}, ${t.tablet ?? t.light}, ${t.desktop ?? t.tablet ?? t.light}),`).join('\n')}\n);\n`;

fs.mkdirSync(OUT, { recursive: true });
const files = {
  'tokens.css': css,
  'tokens.json': JSON.stringify(dtcg, null, 2) + '\n',
  'tailwind.preset.cjs': presetSrc,
  '_tokens.scss': scss,
  'manifest.json': JSON.stringify({ version, generated: today, source: SRC, count: tokens.length,
    colours: tokens.filter((t) => t.type === 'color').length, files: ['tokens.css', 'tokens.json', 'tailwind.preset.cjs', '_tokens.scss'] }, null, 2) + '\n',
};
for (const [f, body] of Object.entries(files)) fs.writeFileSync(path.join(OUT, f), body);
console.log(`tokens ${version}: ${tokens.length} tokens (${tokens.filter((t) => t.type === 'color').length} colours) -> ${OUT}/`);
