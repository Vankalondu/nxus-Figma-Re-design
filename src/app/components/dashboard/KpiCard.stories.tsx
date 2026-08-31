import type { Meta, StoryObj } from '@storybook/react-vite'
import { Users, ClipboardCheck, Video, Target } from 'lucide-react'
import { KpiCard } from './KpiCard'

const meta = {
  title: 'Components/KpiCard',
  component: KpiCard,
  parameters: {
    docs: {
      description: {
        component:
          'The KPI card used across the Lead, Senior and Video Manager dashboards. ' +
          'One source of truth, so the three can never visually drift.\n\n' +
          'Anatomy (**P-CO4**): circular icon chip + short uppercase heading, then a large ' +
          'number with a short descriptor beside it, and a named action link carrying an ' +
          'up-right arrow. It renders as a `<button>`, so it is keyboard focusable.\n\n' +
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
    descriptor: { control: 'text', description: 'Short qualifier beside the value.' },
    action: { control: 'text', description: 'Named link — say where it goes, not "View".' },
    onClick: { action: 'clicked', description: 'Fires on card click.' },
  },
  args: {
    icon: Users,
    heading: 'Tracked Players',
    value: '248',
    descriptor: 'in scope',
    action: 'Opens Short List',
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
    action: 'Opens Reports',
  },
  parameters: {
    docs: { description: { story: 'Headings wrap rather than truncate; the bottom row stays put.' } },
  },
}

export const LargeValue: Story = {
  args: {
    icon: Video,
    heading: 'Packages',
    value: '1,284',
    descriptor: 'uploaded',
    action: 'View Packages',
  },
  parameters: {
    docs: { description: { story: 'Thousands separators stay aligned because the value is `tabular-nums`.' } },
  },
}

export const Grid: Story = {
  parameters: {
    docs: { description: { story: 'How the cards actually appear — four across at `lg`, two on smaller screens, `gap-6` (**R-S2**).' } },
  },
  render: (args) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard {...args} />
      <KpiCard {...args} icon={ClipboardCheck} heading="New Reports" value="12" descriptor="unread" action="Opens Reports" />
      <KpiCard {...args} icon={Video} heading="Packages" value="34" descriptor="to review" action="View Packages" />
      <KpiCard {...args} icon={Target} heading="Target List" value="6" descriptor="players" action="Opens Target List" />
    </div>
  ),
}
