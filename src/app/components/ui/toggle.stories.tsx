import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bold, Italic } from 'lucide-react'
import { Toggle } from './toggle'

const meta = {
  title: 'Primitives/Toggle',
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component:
          'A two-state button. Distinct from `Switch`: a toggle is a control you press, a switch ' +
          'is a setting you flip. If the label is a verb, it is probably a toggle.',
      },
    },
  },
  argTypes: {
    variant: { control: 'radio', options: ['default', 'outline'] },
    size: { control: 'radio', options: ['default', 'sm', 'lg'] },
  },
  args: { variant: 'default', size: 'default' },
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => <Toggle {...a} aria-label="Bold"><Bold className="size-4" /></Toggle>,
}

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Toggle aria-label="Bold"><Bold className="size-4" /></Toggle>
      <Toggle variant="outline" aria-label="Italic"><Italic className="size-4" /></Toggle>
      <Toggle defaultPressed aria-label="Bold pressed"><Bold className="size-4" /></Toggle>
    </div>
  ),
}
