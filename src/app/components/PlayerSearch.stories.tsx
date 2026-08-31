import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayerSearch } from './PlayerSearch'

const meta = {
  title: 'Components/PlayerSearch',
  component: PlayerSearch,
  parameters: {
    docs: {
      description: {
        component:
          'The global player search that lives in the top nav. Type two or more letters — try ' +
          '"ko" or "men" — to see the dropdown.\n\n' +
          'Each result is a two-line row: initials chip, player name in primary, then flag, team ' +
          'and age beneath. The kebab opens three actions — add to shortlist, add to target, ' +
          'upload highlight — which write to the shared player store, so a player added here ' +
          'appears in that tab immediately. Clicking the row navigates to the profile.\n\n' +
          'Results cap at six with a "showing N of M" footer, and the whole thing is keyboard ' +
          'driven: arrow keys move, Enter opens, Escape closes.\n\n' +
          'Placeholder is **"Find a player"** — the magnifying glass already says "search", so ' +
          'repeating it wastes the only words in the field. "Find" is outcome language.',
      },
    },
    layout: 'padded',
  },
  argTypes: {
    className: { control: 'text', description: 'Extra classes for the wrapper.' },
    autoFocus: { control: 'boolean', description: 'Focus the field on mount.' },
  },
  args: { className: '', autoFocus: false },
} satisfies Meta<typeof PlayerSearch>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Sized to its real top-nav width. The store is a module singleton, so actions
 * taken here persist across stories until the page reloads.
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-[420px]">
      <PlayerSearch {...args} />
    </div>
  ),
}

export const InTopNavContext: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Against the nav shell it sits in (**P-CO7**) — `bg-card/90` with a backdrop blur, ' +
          'border, and `rounded-[24px]`.',
      },
    },
  },
  render: (args) => (
    <div className="flex items-center justify-between bg-card/90 backdrop-blur-xl border border-border p-2 pl-6 rounded-[24px] shadow-[var(--shadow-lg)]">
      <div className="w-[380px]">
        <PlayerSearch {...args} />
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-body font-bold text-[12px]">
          Lead Scout
        </span>
        <div className="w-12 h-12 rounded-full bg-primary/15" />
      </div>
    </div>
  ),
}

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: { description: { story: 'At 390px the dropdown still has to show six two-line rows without overflowing.' } },
  },
  render: (args) => (
    <div className="w-[340px]">
      <PlayerSearch {...args} />
    </div>
  ),
}
