import type { Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import { MemoryRouter } from 'react-router'

// The real token layer — fonts, Tailwind, default theme, then globals.css.
// Stories render against exactly the CSS the app ships, so a component that
// looks right here looks right in NXUS.
import '../src/styles/index.css'

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
        <div className="bg-background text-foreground p-6 min-h-[120px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],

  tags: ['autodocs'],
}

export default preview
