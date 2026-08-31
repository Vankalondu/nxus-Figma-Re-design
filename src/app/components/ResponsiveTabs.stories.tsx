import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ResponsiveTabs } from './ResponsiveTabs'

const meta = {
  title: 'Components/ResponsiveTabs',
  component: ResponsiveTabs,
  parameters: {
    docs: {
      description: {
        component:
          'The tab strip used on every page that has tabs (**P-CO2**). Active pill is ' +
          '`bg-primary text-primary-foreground`; inactive is `bg-card text-muted-foreground` ' +
          'that borders primary on hover. Row is `flex items-center gap-2` (**R-S2**).\n\n' +
          'Tabs can carry a count badge. Tone is `muted` by default; `red` marks something ' +
          'needing attention, such as the Video Manager approval queue — that is L-C3 applied ' +
          'to a number rather than a pill.',
      },
    },
  },
  argTypes: {
    tabs: { control: 'object', description: 'Tab definitions: `id`, `label`, optional `count` and `countTone`.' },
    activeId: { control: 'text', description: 'The selected tab id.' },
    onSelect: { action: 'selected', description: 'Fires with the tab id.' },
    className: { control: 'text' },
  },
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'reports', label: 'Reports' },
      { id: 'players', label: 'Players' },
      { id: 'tasks', label: 'Tasks' },
    ],
    activeId: 'overview',
    onSelect: () => {},
  },
} satisfies Meta<typeof ResponsiveTabs>

export default meta
type Story = StoryObj<typeof meta>

/** Click through them — this is the real component, wired to local state. */
export const Default: Story = {
  render: (args) => {
    const [active, setActive] = useState(args.activeId)
    return <ResponsiveTabs {...args} activeId={active} onSelect={setActive} />
  },
}

export const WithCounts: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A muted count is informational (open tasks). A red count is a queue someone has to ' +
          'clear — used for pending approvals on the Video Manager dashboard.',
      },
    },
  },
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'packages', label: 'Packages' },
      { id: 'approval', label: 'Approval', count: 4, countTone: 'red' },
      { id: 'tasks', label: 'Tasks', count: 12 },
    ],
    activeId: 'approval',
  },
  render: (args) => {
    const [active, setActive] = useState(args.activeId)
    return <ResponsiveTabs {...args} activeId={active} onSelect={setActive} />
  },
}

export const ManyTabs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The Senior and Lead Scout tab set (§11.2). Narrow the viewport to see the responsive ' +
          'behaviour — the strip has to survive seven tabs at 390px.',
      },
    },
  },
  args: {
    tabs: [
      { id: 'scope', label: 'Scope Settings' },
      { id: 'reports', label: 'Reports' },
      { id: 'database', label: 'Database' },
      { id: 'long', label: 'Long List' },
      { id: 'short', label: 'Short List' },
      { id: 'target', label: 'Target List' },
      { id: 'signed', label: 'Signed List' },
    ],
    activeId: 'short',
  },
  render: (args) => {
    const [active, setActive] = useState(args.activeId)
    return <ResponsiveTabs {...args} activeId={active} onSelect={setActive} />
  },
}
