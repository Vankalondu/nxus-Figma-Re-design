import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { InlineSel } from './shared'

const meta = {
  title: 'Components/InlineSel',
  component: InlineSel,
  parameters: {
    docs: {
      description: {
        component:
          'A compact inline dropdown filter, used in table toolbars where a full `Select` would ' +
          'cost too much width. It shows `allLabel` when nothing is filtered and highlights ' +
          'itself once a value is chosen, so an active filter is visible at a glance — a filtered ' +
          'table that looks unfiltered is how a scout concludes a player is missing.\n\n' +
          'Closes on outside click and on Escape.',
      },
    },
  },
  argTypes: {
    value: { control: 'text', description: "Current value. `'All'` means unfiltered." },
    opts: { control: 'object', description: 'Selectable options.' },
    allLabel: { control: 'text', description: 'Label shown while unfiltered.' },
    onChange: { action: 'changed' },
  },
  args: {
    value: 'All',
    opts: ['High', 'Medium', 'Low'],
    allLabel: 'All priorities',
    onChange: () => {},
  },
} satisfies Meta<typeof InlineSel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [v, setV] = useState(args.value)
    return <InlineSel {...args} value={v} onChange={setV} />
  },
}

export const Active: Story = {
  parameters: { docs: { description: { story: 'With a value selected — the control marks itself as filtering.' } } },
  args: { value: 'High' },
  render: (args) => {
    const [v, setV] = useState(args.value)
    return <InlineSel {...args} value={v} onChange={setV} />
  },
}

export const InAToolbar: Story = {
  parameters: { docs: { description: { story: 'How it appears in a table toolbar — several filters side by side.' } } },
  render: () => {
    const [prio, setPrio] = useState('All')
    const [assignee, setAssignee] = useState('All')
    const [status, setStatus] = useState('All')
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <InlineSel value={prio} onChange={setPrio} opts={['High', 'Medium', 'Low']} allLabel="All priorities" />
        <InlineSel value={status} onChange={setStatus} opts={['Pending', 'In progress', 'Done']} allLabel="All statuses" />
        <InlineSel value={assignee} onChange={setAssignee} opts={['Me', 'David (Senior)', 'Nene', 'Tom']} allLabel="All assignees" />
      </div>
    )
  },
}
