# nxus-tokens

The NXUS design tokens — colours, spacing, type and shadows — for any framework.
Generated from the NXUS reference app's own stylesheet on every release, so it always
matches what ships. Figma is the source of truth; a change there becomes a reviewed pull
request, and the next release publishes a new version of this package.

```sh
npm install nxus-tokens
```

## Use it

**Load the variables once** (every option below needs this):

```js
import 'nxus-tokens/tokens.css'
```

**Tailwind v3** — the same class names the NXUS app uses (`bg-surface-card`, `text-heading`, `border-default`):

```js
// tailwind.config.js
module.exports = {
  presets: [require('nxus-tokens/tailwind-preset')],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
}
```

**Plain CSS** — `background: var(--surface-card); color: var(--text-heading);`

**SCSS** — `@use 'nxus-tokens/tokens' as t;` (with `node_modules` on Sass's load path; Vite and webpack set it up for you) then `t.$nxus-surface-card`, and `map.get(t.$nxus-dark, 'surface-card')` for dark.

**JSON** — `nxus-tokens/tokens.json` is W3C Design Tokens format for Style Dictionary or Tokens Studio.

Dark mode: put `class="dark"` (or `data-theme="dark"`) on `<html>`.

## Updating

Run `npm update nxus-tokens`. The version only changes when a token value changes; the
content hash is in `package.json` under `nxus.hash`. Browse every token in the NXUS
Storybook under **Guides → Design Tokens**.
