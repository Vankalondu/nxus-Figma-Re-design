import { useEffect, useState } from 'react';
import { Download, FileCode2, Braces, Wind, Palette } from 'lucide-react';

// Storybook page (Guides/Design Tokens): how developers get the design tokens.
// The files are generated from src/styles/globals.css by scripts/build-tokens.mjs on
// every dev/build run, so what is offered here is always what the app renders.
// Relative: Storybook ships at /storybook/ on the live site and at / locally, and
// staticDirs serves public/ beside iframe.html in both.
const BASE = './downloads/tokens';

type Manifest = { version: string; generated: string; count: number; colours: number };
type Leaf = { $value: string; $type?: string; $extensions?: { 'com.nxus'?: { dark?: string; cssVar?: string } } };
type Swatch = { cssVar: string; light: string; dark?: string };

const FILES = [
  { file: 'tokens.css', icon: FileCode2, title: 'CSS variables', body: 'Every token as a CSS variable, light and dark. Works in any framework. Start here.' },
  { file: 'tailwind.preset.cjs', icon: Wind, title: 'Tailwind v3 preset', body: 'The same class names the NXUS app uses: bg-surface-card, text-heading, border-default.' },
  { file: '_tokens.scss', icon: Palette, title: 'SCSS variables', body: 'Fixed values for Sass, plus a dark map. Use the CSS variables for live theming.' },
  { file: 'tokens.json', icon: Braces, title: 'JSON (W3C format)', body: 'For Style Dictionary, Tokens Studio or your own build. Dark and breakpoint values included.' },
];

const SETUPS = [
  {
    title: 'Vue 3 + Tailwind 3',
    note: 'Fits the VueFE app as it is today: Tailwind 3 with an empty theme.',
    code: `// main.ts
import 'nxus-tokens/tokens.css'

// tailwind.config.js
module.exports = {
  presets: [require('nxus-tokens/tailwind-preset')],
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
}

// Use the classes
<div class="bg-surface-card text-heading border border-default rounded">
// Dark mode: add class="dark" to <html>`,
  },
  {
    title: 'React or Next + Tailwind 3',
    note: 'Same preset. Import the CSS once at the root.',
    code: `// app/layout.tsx (or main.tsx)
import 'nxus-tokens/tokens.css'

// tailwind.config.js
module.exports = {
  presets: [require('nxus-tokens/tailwind-preset')],
  content: ['./src/**/*.{ts,tsx}'],
}`,
  },
  {
    title: 'Plain CSS, any framework',
    note: 'No build step: download tokens.css below, link it, then use the variables.',
    code: `<link rel="stylesheet" href="tokens.css">

.card {
  background: var(--surface-card);
  color: var(--text-heading);
  box-shadow: var(--shadow-md);
}`,
  },
  {
    title: 'SCSS',
    note: 'Values are fixed when Sass compiles. For dark mode, prefer the CSS variables.',
    code: `@use 'nxus-tokens/tokens' as t;
@use 'sass:map';

.card { background: t.$nxus-surface-card; }
.dark .card { background: map.get(t.$nxus-dark, 'surface-card'); }`,
  },
];

function collectSwatches(node: Record<string, unknown>, out: Swatch[]) {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$') || !v || typeof v !== 'object') continue;
    const leaf = v as Leaf;
    if ('$value' in leaf) {
      const ext = leaf.$extensions?.['com.nxus'];
      if (leaf.$type === 'color' && ext?.cssVar) out.push({ cssVar: ext.cssVar, light: leaf.$value, dark: ext.dark });
    } else collectSwatches(v as Record<string, unknown>, out);
  }
}

export default function TokensDoc() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [swatches, setSwatches] = useState<Swatch[]>([]);

  useEffect(() => {
    fetch(`${BASE}/manifest.json`).then(r => r.json()).then(setManifest).catch(() => {});
    fetch(`${BASE}/tokens.json`).then(r => r.json()).then(j => { const s: Swatch[] = []; collectSwatches(j, s); setSwatches(s); }).catch(() => {});
  }, []);

  const roles = swatches.filter(s => /^--(surface|text|border|brand|status)-/.test(s.cssVar));
  const palette = swatches.filter(s => !roles.includes(s) && !/^--chart-/.test(s.cssVar));

  return (
    // sb-unstyled: opt out of Storybook docs typography so the page renders like the app.
    <div className="sb-unstyled min-h-screen bg-surface-page">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-8 md:gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="font-heading font-bold text-heading text-[32px] md:text-[40px] lg:text-[48px] leading-tight">NXUS design tokens</h1>
          <p className="font-body text-body text-[16px] max-w-[640px]">
            The colours, spacing, type and shadows the NXUS app uses, ready for any framework.
            These files are rebuilt from the app's own stylesheet on every release, so they always match what is live.
          </p>
          {manifest && (
            <p className="font-body text-muted text-[12px] font-semibold">
              Version {manifest.version} · {manifest.count} tokens ({manifest.colours} colours) · built {manifest.generated}
            </p>
          )}
        </header>

        <section className="bg-surface-card border border-default rounded-[20px] p-5 flex flex-col gap-3">
          <h2 className="font-heading font-bold text-heading text-[20px] md:text-[24px]">Install</h2>
          <p className="font-body text-body text-[14px]">
            The recommended way. One command, and <code className="font-mono">npm update nxus-tokens</code> brings in
            each approved change. The version only moves when a token value changes.
          </p>
          <pre className="bg-surface-inverse text-inverse rounded-[12px] p-4 overflow-x-auto font-mono text-[12px] leading-[18px]"><code>npm install nxus-tokens</code></pre>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-bold text-heading text-[20px] md:text-[24px]">Or download the files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {FILES.map(({ file, icon: Icon, title, body }) => (
              <div key={file} className="bg-surface-card border border-default rounded-[20px] p-5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-surface-accent flex items-center justify-center">
                  <Icon className="w-5 h-5 text-link" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <h3 className="font-heading font-bold text-heading text-[16px]">{title}</h3>
                  <p className="font-body text-body text-[14px]">{body}</p>
                  <code className="font-mono text-muted text-[12px] mt-1">{file}</code>
                </div>
                <a
                  href={`${BASE}/${file}`}
                  download
                  className="bg-brand-primary hover:bg-brand-primary-hover text-on-brand rounded-full h-[38px] px-4 flex items-center justify-center gap-2 font-body font-bold text-[14px] transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading font-bold text-heading text-[20px] md:text-[24px]">Set up</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {SETUPS.map(s => (
              <div key={s.title} className="bg-surface-card border border-default rounded-[20px] p-5 flex flex-col gap-3 min-w-0">
                <div>
                  <h3 className="font-heading font-bold text-heading text-[16px]">{s.title}</h3>
                  <p className="font-body text-body text-[14px] mt-1">{s.note}</p>
                </div>
                <pre className="bg-surface-inverse text-inverse rounded-[12px] p-4 overflow-x-auto font-mono text-[12px] leading-[18px]"><code>{s.code}</code></pre>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface-card border border-default rounded-[20px] p-5 flex flex-col gap-2">
          <h2 className="font-heading font-bold text-heading text-[20px]">When do these change?</h2>
          <p className="font-body text-body text-[14px]">
            Only when a token change is approved and released. A designer changes a variable in Figma, which opens a
            pull request; the PM reviews it (with a visual summary of what changed) and approves it; the developers are
            notified; and the next release updates this page, the downloads and the nxus-tokens package together.
          </p>
        </section>

        {roles.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-heading text-[20px] md:text-[24px]">Colour roles</h2>
            <SwatchGrid items={roles} />
          </section>
        )}
        {palette.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-heading font-bold text-heading text-[20px] md:text-[24px]">Palette</h2>
            <SwatchGrid items={palette} />
          </section>
        )}
      </div>
    </div>
  );
}

function SwatchGrid({ items }: { items: Swatch[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map(s => (
        <div key={s.cssVar} className="bg-surface-card border border-default rounded-[12px] overflow-hidden min-w-0">
          <div className="h-12 border-b border-default" style={{ background: `var(${s.cssVar})` }} />
          <div className="p-2 flex flex-col gap-0.5">
            <code className="font-mono text-heading text-[11px] truncate">{s.cssVar}</code>
            <span className="font-body text-muted text-[11px]">{s.light}{s.dark && s.dark !== s.light ? ` · dark ${s.dark}` : ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
