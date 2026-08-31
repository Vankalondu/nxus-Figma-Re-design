import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Checkbox } from './checkbox'

const meta = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          'Radix checkbox. NXUS uses a **square checkbox, never a circle**, for marking a task ' +
          'done — a circle reads as picking one option from several rather than completing ' +
          'something. In the Tasks table it sits far right, at the end of the row.',
      },
    },
  },
  argTypes: { checked: { control: 'boolean' }, disabled: { control: 'boolean' } },
  args: { checked: false },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => {
    const [on, setOn] = useState(!!a.checked)
    return <Checkbox {...a} checked={on} onCheckedChange={(v) => setOn(!!v)} />
  },
}

export const WithLabel: Story = {
  render: () => {
    const [on, setOn] = useState(true)
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <Checkbox checked={on} onCheckedChange={(v) => setOn(!!v)} />
        <span className="font-body font-bold text-[12px] text-foreground">
          Review Kofi Mensah target package
        </span>
      </label>
    )
  },
}

export const States: Story = {
  parameters: { docs: { description: { story: 'Unchecked, checked, disabled, disabled-checked.' } } },
  render: () => (
    <div className="flex items-center gap-6">
      <Checkbox checked={false} />
      <Checkbox checked />
      <Checkbox disabled />
      <Checkbox disabled checked />
    </div>
  ),
}
