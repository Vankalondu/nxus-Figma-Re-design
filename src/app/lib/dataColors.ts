import type React from 'react';

// Colours that are DATA, not theme (L-G2): chart series, profile tags, ranks, outcomes.
// They are taken from the palette's base steps so they sit with the brand, but they are
// deliberately not the brand primary — a rebrand of the buttons must not repaint the charts.
// Blue here is Blue/Base #1E88E5; the theme primary is Blue/600 #1971BF.
export const DATA = {
  blue: '#1E88E5',
  violet: '#7C5CFC',
  cyan: '#22D3EE',
  green: '#22C55E',
  amber: '#E8A838',
  red: '#E05C4B',
  neutral: '#596774',
} as const;

// The swatches Settings offers for profile tags — one of each family, no near-duplicates.
export const DATA_SWATCHES: string[] = [DATA.blue, DATA.violet, DATA.cyan, DATA.green, DATA.amber, DATA.red, DATA.neutral];

// ── Tag tint (P-CO5 / P-CO18) ──
// Fill and border come from the tag's own colour. The TEXT is that colour shifted one way
// per theme — toward midnight in light, toward chalk in dark — only until it reads at 4.5:1
// on its own tint. Works for any stored colour, including ones users pick.
const CARD_LIGHT = [246, 250, 254]; // --surface-card, light  (#f6fafe)
const CARD_DARK = [6, 27, 46];      // --surface-card, dark   (#061b2e)
const MIDNIGHT = [6, 27, 46];
const CHALK = [246, 250, 254];
const FILL = 0x22 / 255;            // ~13% — the tint (border is the same hue at ~33%)

type RGB = number[];
const parse = (h: string): RGB => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: RGB) => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => v * (1 - t) + b[i] * t);
const lum = (c: RGB) => c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
  .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a: RGB, b: RGB) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const readableOn = (hue: RGB, card: RGB, toward: RGB) => {
  const bg = mix(card, hue, FILL);
  for (let t = 0; t <= 1; t += 0.05) {
    const fg = mix(hue, toward, t);
    if (contrast(fg, bg) >= 4.8) return toHex(fg); // 4.5 + headroom for hover/accent rows
  }
  return toHex(toward);
};

const cache = new Map<string, React.CSSProperties>();

// Returns style vars; pair with the `data-tint` class (globals.css picks the text per theme).
export const tagTint = (hex?: string): React.CSSProperties => {
  const h = hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toLowerCase() : DATA.blue.toLowerCase();
  const hit = cache.get(h);
  if (hit) return hit;
  const hue = parse(h);
  const style = {
    backgroundColor: `${h}22`,
    borderColor: `${h}55`,
    '--tint-fg-light': readableOn(hue, CARD_LIGHT, MIDNIGHT),
    '--tint-fg-dark': readableOn(hue, CARD_DARK, CHALK),
  } as React.CSSProperties;
  cache.set(h, style);
  return style;
};
