import type { Meta, StoryObj } from '@storybook/react-vite'
import { TaskCard } from './TasksBoard'
import { BoardTask, isoDay } from '../../state/taskStore'

const base: BoardTask = {
  id: 's1', title: 'Report: Misganaw Melaku (Long report)', type: 'report-request', priority: 'Medium', status: 'todo',
  createdBy: 'Peace Okafor', assignee: 'Tom Legg', created: isoDay(-9), due: isoDay(4), playerId: 'db-3', playerName: 'Misganaw Melaku',
}
const noop = () => {}

const meta = {
  title: 'NXUS/Tasks/Task card',
  component: TaskCard,
  parameters: {
    docs: {
      description: {
        component:
          'One task on the Tasks board (**P-CO26**). Three compact lines so a column shows as many as possible: the ' +
          'task name (cut with "…", full name on hover) and the archive button; who assigned it → who it\'s for; the ' +
          'priority pill and the due date, red with "· Nd late" when late. Clicking it opens the place the work ' +
          'happens. Only the person who assigned it or the person it\'s for can drag it or use **Move to…** (always ' +
          'shown on a phone, on hover or focus elsewhere).',
      },
    },
  },
  args: { t: base, me: 'Tom Legg', onOpen: noop, onMove: noop, onArchive: noop },
  render: args => <ul className="w-[300px]"><TaskCard {...args} /></ul>,
} satisfies Meta<typeof TaskCard>

export default meta
type Story = StoryObj<typeof meta>

export const Mine: Story = {}
export const Late: Story = { args: { t: { ...base, due: isoDay(-13), priority: 'High' } } }
export const SomeoneElses: Story = {
  args: { t: { ...base, createdBy: 'Yusuf Bello', assignee: 'Kwame Asante' } },
  parameters: { docs: { description: { story: 'Not yours: it opens, but it can\'t be dragged and has no Move to….' } } },
}
export const Done: Story = { args: { t: { ...base, status: 'completed', completedAt: isoDay(-2) } } }
export const Archived: Story = { args: { t: { ...base, archived: true } } }
