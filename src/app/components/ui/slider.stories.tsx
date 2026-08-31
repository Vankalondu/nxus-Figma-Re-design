import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Slider } from './slider'

const meta = {
  title: 'Primitives/Slider',
  component: Slider,
  parameters: {
    docs: {
      description: {
        component:
          'Range input. Suits scope filters such as age bands, where the span matters more than ' +
          'the exact number. Pair it with a readout — a slider with no visible value forces the ' +
          'user to guess.',
      },
    },
  },
  args: { defaultValue: [16, 23], min: 14, max: 40, step: 1 },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => <div className="w-[360px]"><Slider {...a} /></div>,
}

export const AgeRange: Story = {
  parameters: {
    docs: { description: { story: 'With a `tabular-nums` readout (**L-TY4**) so the number does not jitter as you drag.' } },
  },
  render: () => {
    const [v, setV] = useState<number[]>([16, 23])
    return (
      <div className="w-[360px]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
            Age range
          </span>
          <span className="font-body font-bold text-[12px] text-foreground tabular-nums">
            {v[0]}–{v[1]}
          </span>
        </div>
        <Slider value={v} onValueChange={setV} min={14} max={40} step={1} />
      </div>
    )
  },
}
