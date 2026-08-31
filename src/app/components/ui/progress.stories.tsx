import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './progress'

const meta = {
  title: 'Primitives/Progress',
  component: Progress,
  parameters: {
    docs: {
      description: {
        component:
          'Determinate progress bar. NXUS uses it for coverage ratios — how much of a list has ' +
          'video, how much of a cycle is reported.\n\n' +
          'The track is `bg-border` and the fill `bg-primary` (**P-CO4**). Always pair it with a ' +
          'number: a bar alone tells a scout roughly, and roughly is not useful when the ' +
          'question is how many players still need footage.',
      },
    },
  },
  argTypes: { value: { control: { type: 'range', min: 0, max: 100 } } },
  args: { value: 62 },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => <div className="w-[320px]"><Progress {...a} /></div>,
}

export const WithReadout: Story = {
  parameters: { docs: { description: { story: 'The bar plus the figure it represents.' } } },
  render: (a) => (
    <div className="w-[320px]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
          Short List coverage
        </span>
        <span className="font-body font-bold text-[12px] text-foreground tabular-nums">{a.value}%</span>
      </div>
      <Progress {...a} />
      <p className="font-body text-[12px] text-muted-foreground mt-2">
        <span className="tabular-nums">14</span> of <span className="tabular-nums">37</span> still need full match footage
      </p>
    </div>
  ),
}
