import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from './separator'

const meta = {
  title: 'Primitives/Separator',
  component: Separator,
  parameters: {
    docs: {
      description: {
        component:
          'A divider rule. Colour comes from `--border` (**R-C2**), so it adapts between themes ' +
          'without a second declaration.\n\n' +
          'A hairline is the one place **L-S1** permits a 2px spacing step — the 4-pt grid governs ' +
          'space between blocks, not the rule itself.',
      },
    },
  },
  argTypes: { orientation: { control: 'radio', options: ['horizontal', 'vertical'] } },
  args: { orientation: 'horizontal' },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-[360px]">
      <p className="font-body text-[12px] text-foreground mb-4">Short List</p>
      <Separator />
      <p className="font-body text-[12px] text-foreground mt-4">Target List</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-10">
      <span className="font-body font-bold text-[12px] text-foreground">248 players</span>
      <Separator orientation="vertical" />
      <span className="font-body font-bold text-[12px] text-muted-foreground">14 shortlisted</span>
      <Separator orientation="vertical" />
      <span className="font-body font-bold text-[12px] text-muted-foreground">6 targeted</span>
    </div>
  ),
}
