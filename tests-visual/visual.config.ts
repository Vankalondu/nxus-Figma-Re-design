import { defineConfig, devices } from '@playwright/test';

/**
 * Visual tests: screenshot every Storybook story and the key app screens, and compare
 * each against an approved baseline in tests-visual/__screenshots__.
 *
 *   npx playwright test -c tests-visual/visual.config.ts
 *
 * Baselines are only ever written on GitHub's Linux runner (the "Visual check" workflow,
 * mode=update). Fonts render differently on Windows and macOS, so a baseline made on a
 * laptop would fail every pull request. Needs `npm run build` and
 * `npm run build-storybook` first; the workflow does both.
 */
export default defineConfig({
  testDir: '.',
  testMatch: /.*\.visual\.ts/,
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,
  // A mismatch is re-taken (fresh page load) up to twice. Tiny text can still jitter by a
  // few edge pixels about once in 143 screenshots, which is above the smallest real change
  // measured (8 px), so a looser comparison would let real changes through. Noise is random
  // and does not repeat; a real change fails every attempt. Re-takes are counted in the summary.
  retries: 2,
  reporter: [['json', { outputFile: 'visual-results/results.json' }], ['html', { open: 'never', outputFolder: 'visual-results/html' }], ['list']],
  outputDir: 'visual-results/artifacts',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      // Zero changed pixels. Rendering on the CI runner is deterministic (proven by repeat
      // runs on unchanged main), and anything looser lets real design changes through:
      // 0.1% of the screen let a corner-radius change pass as "unchanged".
      // threshold is per-pixel colour tolerance (0-1); 0.05 ignores only invisible noise.
      maxDiffPixels: 0,
      threshold: 0.05,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 800 },
    // Render text and shapes the same way every time. Without these, sub-pixel text
    // smoothing left ~20 stray pixels on truncated labels between identical runs, more than
    // the smallest real change measured (8 pixels: a corner radius on one small element).
    launchOptions: { args: ['--font-render-hinting=none', '--disable-lcd-text', '--disable-gpu', '--disable-gpu-rasterization',
      '--force-color-profile=srgb', '--disable-partial-raster', '--disable-skia-runtime-opts', '--disable-font-subpixel-positioning'] },
  },
  webServer: [
    { command: 'node scripts/serve-static.mjs storybook-static 6007', url: 'http://localhost:6007/index.json', cwd: '..', reuseExistingServer: !process.env.CI, timeout: 60_000 },
    { command: 'npm run preview -- --port 4174 --strictPort', url: 'http://localhost:4174', cwd: '..', reuseExistingServer: !process.env.CI, timeout: 60_000 },
  ],
});
