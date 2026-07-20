import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)
const pkg = require('./package.json')

// Figma Make components import packages with version-suffixed specifiers
// (e.g. `import { toast } from "sonner@2.0.3"`). Map every "name@version"
// specifier back to the bare package name so Vite can resolve it locally.
const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
const versionAliases = Object.keys(allDeps).map((name) => ({
  find: name + '@' + allDeps[name],
  replacement: name,
}))

function figmaAssetResolver() {
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

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      ...versionAliases,
      { find: /^@\//, replacement: path.resolve(__dirname, './src') + '/' },
    ],
  },
})
