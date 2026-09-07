import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import { figmaAssetResolver, resolveAlias } from '../vite.shared.mjs'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],

  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // Prop tables are generated from the components' own TypeScript types
  // rather than hand-written, so they cannot drift from the code.
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Skip prop docs sourced from node_modules (Radix, React) — otherwise
      // every table drowns in inherited DOM attributes.
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },

  // Storybook must resolve imports exactly as the app does, or a story can
  // render something the app cannot build. Both read the same shared module.
  viteFinal: async (cfg, { configType }) =>
    mergeConfig(cfg, {
      plugins: [figmaAssetResolver()],
      resolve: { alias: resolveAlias },
      // Relative asset paths, PRODUCTION only. The built catalogue is deployed
      // into dist/storybook so it rides along with the app on one Cloudflare
      // project — no second project, no extra secrets — and absolute `/assets`
      // paths would 404 from a subpath. Left as '/' in dev because the dev
      // server serves Storybook from the root.
      ...(configType === 'PRODUCTION' ? { base: './' } : {}),
    }),
}

export default config
