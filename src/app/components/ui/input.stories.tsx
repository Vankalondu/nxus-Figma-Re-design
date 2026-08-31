import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'

const meta = {
  title: 'Primitives/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component:
          'Text input. NXUS field styling is specified in **P-CO13**: `bg-card`, `border-border`, ' +
          '`rounded-xl`, bold 14px text, and a `focus:ring-2 focus:ring-ring/20` focus state. ' +
          'Labels sit above at `.text-micro`, uppercase and tracked.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search'] },
  },
  args: { placeholder: 'Find a player', type: 'text' },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => <div className="w-[320px]"><Input {...a} /></div>,
}

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Locked while syncing' },
  render: (a) => <div className="w-[320px]"><Input {...a} /></div>,
}

export const WithLabel: Story = {
  parameters: { docs: { description: { story: 'Label styling per **P-CO13**.' } } },
  render: (a) => (
    <div className="w-[320px]">
      <label className="block font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Player name
      </label>
      <Input {...a} placeholder="e.g. Kofi Mensah" />
    </div>
  ),
}
