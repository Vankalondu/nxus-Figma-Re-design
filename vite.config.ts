import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { figmaAssetResolver, resolveAlias } from './vite.shared.mjs'

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: resolveAlias,
  },
  server: {
    // Storybook writes into storybook-static/; without this the app's dev
    // server treats every docs build as a source change and hot-reloads.
    watch: { ignored: ['**/storybook-static/**'] },
  },
})
