import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { DATA, tagTint } from '../src/app/lib/dataColors';

// The --data-*-text tokens (and Figma Mapped Color/Data/*-text) are copies of what
// tagTint() computes. If either side changes, this fails instead of drifting.
const css = readFileSync(new URL('../src/styles/globals.css', import.meta.url), 'utf8');
const block = (start: string) => { const i = css.indexOf(start); return css.slice(i, css.indexOf('\n}', i)); };
const rootBlock = block(':root {');
const darkBlock = block('\n.dark {');
const pick = (src: string, name: string) => src.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6});`, 'i'))?.[1].toLowerCase();

for (const [name, hex] of Object.entries(DATA)) {
  test(`data tag text for ${name} matches the CSS tokens`, () => {
    const t = tagTint(hex) as Record<string, string>;
    expect(pick(rootBlock, `--data-${name}-text`)).toBe(t['--tint-fg-light']);
    expect(pick(darkBlock, `--data-${name}-text`)).toBe(t['--tint-fg-dark']);
  });
}
