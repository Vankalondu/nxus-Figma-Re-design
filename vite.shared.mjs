// Vite pieces shared by the app build (vite.config.ts) and Storybook
// (.storybook/main.ts). Kept in one place so the two can never drift — if
// Storybook resolved imports differently from the app, a story could render
// something the app cannot.

import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)
const pkg = require('./package.json')

// Figma Make components import packages with version-suffixed specifiers
// (e.g. `import { toast } from "sonner@2.0.3"`). Map every "name@version"
// specifier back to the bare package name so Vite can resolve it locally.
const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }

export const versionAliases = Object.keys(allDeps).map((name) => ({
  find: name + '@' + allDeps[name],
  replacement: name,
}))

export const pathAliases = [
  { find: /^@\//, replacement: path.resolve(__dirname, './src') + '/' },
]

export const resolveAlias = [...versionAliases, ...pathAliases]

// `figma:asset/foo.png` → `src/assets/foo.png`
export function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}
