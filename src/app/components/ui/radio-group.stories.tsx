import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './radio-group'
import { Label } from './label'

const meta = {
  title: 'Primitives/RadioGroup',
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          'One choice from several. Where the options are few and mutually exclusive, NXUS ' +
          'usually prefers a segmented toggle or filter chips instead — they cost far less ' +
          'vertical space, and density is the first value of this system (**§0**).',
      },
    },
  },
  args: { defaultValue: 'target' },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [v, setV] = useState('target')
    return (
      <RadioGroup value={v} onValueChange={setV} className="flex flex-col gap-3">
        {[
          ['long', 'Long List'],
          ['short', 'Short List'],
          ['target', 'Target List'],
        ].map(([id, label]) => (
          <div key={id} className="flex items-center gap-3">
            <RadioGroupItem value={id} id={id} />
            <Label htmlFor={id} className="font-body font-bold text-[12px] text-foreground cursor-pointer">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    )
  },
}
