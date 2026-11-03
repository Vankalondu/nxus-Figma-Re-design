import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayerLink } from './PlayerLink'

const meta = {
  title: 'NXUS/Navigation/PlayerLink',
  component: PlayerLink,
  decorators: [(Story) => <div className="p-6 bg-surface-page font-body type-body-sm text-body"><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Every player name, anywhere, opens that player\'s profile inside the current account (**P-CO24**, **D-20**). ' +
          'Names in lists and tables use the link colour; a name that is a card title keeps the heading colour ' +
          '(`tone="inherit"`). Both underline on hover and are keyboard focusable. The click stops at the link, so a row ' +
          'or card with its own click still works.',
      },
    },
  },
  args: { name: 'Kofi Mensah', id: 'db-3' },
} satisfies Meta<typeof PlayerLink>

export default meta
type Story = StoryObj<typeof meta>

export const InAList: Story = {}
export const CardTitle: Story = {
  args: { tone: 'inherit', className: 'font-heading font-bold type-body text-heading' },
  parameters: { docs: { description: { story: 'As a card title: heading colour, underline on hover.' } } },
}
export const InsideAClickableRow: Story = {
  render: (args) => (
    <div role="button" tabIndex={0} onClick={() => alert('Row opened')} className="bg-surface-card border border-default rounded-[20px] p-4 cursor-pointer">
      <PlayerLink {...args} /> <span className="text-muted">· Highlight 2 · 6 Jul 2026</span>
    </div>
  ),
  parameters: { docs: { description: { story: 'Clicking the name opens the profile; clicking elsewhere opens the row.' } } },
}
