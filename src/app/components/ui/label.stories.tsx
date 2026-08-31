import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './label'
import { Input } from './input'

const meta = {
  title: 'Primitives/Label',
  component: Label,
  parameters: {
    docs: {
      description: {
        component:
          'Radix label — clicking it focuses its control, which is why it is worth using over a ' +
          'bare `<span>`. NXUS field labels are Figtree `.text-micro`, bold, uppercase and ' +
          'tracked (**P-CO13**, **R-TY2**).',
      },
    },
  },
  args: { children: 'Player name' },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NxusStyling: Story = {
  parameters: { docs: { description: { story: 'Click the label — focus moves to the field.' } } },
  render: () => (
    <div className="w-[320px]">
      <Label
        htmlFor="player"
        className="block font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-2"
      >
        Player name
      </Label>
      <Input id="player" placeholder="e.g. Kofi Mensah" />
    </div>
  ),
}
