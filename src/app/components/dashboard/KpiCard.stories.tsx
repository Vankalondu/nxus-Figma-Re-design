import type { Meta, StoryObj } from '@storybook/react-vite'
import { Users, ClipboardCheck, Video, Target } from 'lucide-react'
import { KpiCard } from './KpiCard'

const meta = {
  title: 'NXUS/Dashboard/KpiCard',
  component: KpiCard,
  parameters: {
    docs: {
      description: {
        component:
          'The KPI card used on every dashboard. One source of truth, so no dashboard can ' +
          'visually drift.\n\n' +
          'Anatomy (**P-CO4**, **D-18**): circular icon chip + short uppercase heading, then the ' +
          'large number with the descriptor on its own line under it (left), and the action link ' +
          'with an up-right arrow on its own row, pinned to the bottom right. The rows always stack, ' +
          'so every card has the same shape whatever the text length. The descriptor is plain text: ' +
          'no status colours.\n\n' +
          'Action copy: verb + object, sentence case, short (usually 3 words or fewer) and says exactly where it goes ' +
          '("Open reports", "See short list", "Find missing packages"). Never "Opens…" or a bare "View". ' +
          'It renders as a `<button>`, so it is keyboard focusable.\n\n' +
          'The value uses `tabular-nums` (**L-TY4**) — proportional digits change width as ' +
          'the number changes, which makes the count-up animation visibly jitter.',
      },
    },
  },
  argTypes: {
    icon: {
      control: false,
      description: 'Any `lucide-react` icon component (**L-I1**).',
    },
    heading: { control: 'text', description: 'Short uppercase label.' },
    value: { control: 'text', description: 'The figure. Rendered `tabular-nums`.' },
    descriptor: { control: 'text', description: 'Short qualifier, on its own line under the value. Plain text only.' },
    action: { control: 'text', description: 'Verb + object, sentence case, max 3 words — e.g. "Open reports". Sits bottom right.' },
    onClick: { action: 'clicked', description: 'Fires on card click.' },
  },
  args: {
    icon: Users,
    heading: 'Tracked Players',
    value: '248',
    descriptor: 'in scope',
    action: 'See players',
  },
} satisfies Meta<typeof KpiCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongHeading: Story = {
  args: {
    icon: ClipboardCheck,
    heading: 'Reports Awaiting Review',
    value: '17',
    descriptor: 'this week',
    action: 'Review reports',
  },
  parameters: {
    docs: { description: { story: 'Headings wrap rather than truncate; the number, descriptor and link stay in place.' } },
  },
}

export const LargeValue: Story = {
  args: {
    icon: Video,
    heading: 'Packages',
    value: '1,284',
    descriptor: 'uploaded',
    action: 'Watch packages',
  },
  parameters: {
    docs: { description: { story: 'Thousands separators stay aligned because the value is `tabular-nums`.' } },
  },
}

export const LongText: Story = {
  args: {
    icon: Video,
    heading: 'Missing Full Matches',
    value: '65',
    descriptor: 'across Target + Short',
    action: 'Find missing matches',
  },
  parameters: {
    docs: { description: { story: 'Long heading and descriptor in a narrow column: each wraps on its own line, the link stays bottom right and nothing overlaps (**D-18**).' } },
  },
  render: (args) => <div className="w-[220px]"><KpiCard {...args} /></div>,
}

export const Grid: Story = {
  parameters: {
    docs: { description: { story: 'How the cards actually appear — four across at `lg`, two on smaller screens, `gap-6` (**R-S2**).' } },
  },
  render: (args) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard {...args} />
      <KpiCard {...args} icon={ClipboardCheck} heading="New Reports" value="12" descriptor="unread" action="Open reports" />
      <KpiCard {...args} icon={Video} heading="Packages" value="34" descriptor="to review" action="Watch packages" />
      <KpiCard {...args} icon={Target} heading="Target List" value="6" descriptor="players" action="See target list" />
    </div>
  ),
}
