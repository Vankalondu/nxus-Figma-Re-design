import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Switch } from './switch'

const meta = {
  title: 'Primitives/Switch',
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          'Radix switch. Use it for settings that take effect immediately — a switch implies the ' +
          'change is already live, so anything that needs a Save button should be a checkbox ' +
          'instead.',
      },
    },
  },
  argTypes: { checked: { control: 'boolean' }, disabled: { control: 'boolean' } },
  args: { checked: true },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => {
    const [on, setOn] = useState(!!a.checked)
    return <Switch {...a} checked={on} onCheckedChange={setOn} />
  },
}

export const WithLabel: Story = {
  render: () => {
    const [on, setOn] = useState(true)
    return (
      <label className="flex items-center justify-between gap-6 w-[300px] cursor-pointer">
        <span className="font-body font-bold text-[12px] text-foreground">
          Email me when a player is raised
        </span>
        <Switch checked={on} onCheckedChange={setOn} />
      </label>
    )
  },
}
