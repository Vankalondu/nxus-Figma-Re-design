import type { Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { MemoryRouter } from 'react-router'

// The real token layer — fonts, Tailwind, default theme, then globals.css.
// Stories render against exactly the CSS the app ships, so a component that
// looks right here looks right in NXUS.
import '../src/styles/index.css'
// Storybook-chrome overrides, bound to the same role tokens (see preview.css).
import './preview.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    // Match the page canvas to the design system's own background token in
    // both themes, rather than Storybook's default white/black.
    backgrounds: { disable: true },
    a11y: { test: 'todo' },
    options: {
      storySort: {
        order: [
          'Guides',
          ['Introduction', 'Laws', 'Patterns', 'Reference'],
          'All Components',
          'Components',
          'Primitives',
        ],
      },
    },
  },

  decorators: [
    // Toggles `.dark` on <html>, the same mechanism next-themes uses in the
    // app (`attribute="class"`), so dark mode here is the real dark mode.
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
    // Several components navigate (Sidebar, PlayerSearch, the player tables).
    // Without a router they throw on useNavigate/useLocation, so every story
    // gets a memory router — harmless for components that never route.
    (Story) => (
      <MemoryRouter initialEntries={['/lead-scout']}>
        {/* bg-surface-page / text-body, matching what globals.css sets on <body>.
            This used to read `bg-background text-foreground`, which survived
            step 4.3 only because default_theme.css ships its own @theme bridge —
            so the canvas was rendering that file's `--background: #ffffff`.
            Pure white, in the tool that demonstrates L-C1's ban on it. The lint
            never saw it because its scope is src/app. */}
        <div className="bg-surface-page text-body p-6 min-h-[120px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],

  tags: ['autodocs'],
}

export default preview

