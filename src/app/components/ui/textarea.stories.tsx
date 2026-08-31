import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './textarea'

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          'Multi-line input, sharing the field styling in **P-CO13**. Used for scouting report ' +
          'notes and match observations.',
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: { placeholder: 'Match observations…', rows: 4 },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => <div className="w-[420px]"><Textarea {...a} /></div>,
}

export const WithLabel: Story = {
  render: (a) => (
    <div className="w-[420px]">
      <label className="block font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Report summary
      </label>
      <Textarea {...a} />
    </div>
  ),
}
