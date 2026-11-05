import type { Meta, StoryObj } from '@storybook/react-vite'
import { TaskSheet } from './TaskSheet'

const players = [{ id: 'tl-0', name: 'Ibrahim Sangare' }, { id: 'db-3', name: 'Misganaw Melaku' }]
const noop = () => {}

const meta = {
  title: 'NXUS/Tasks/New task panel',
  component: TaskSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'New task opens from the right, like the report panel (**P-CO26**). Type, players, title, description, ' +
          'due date, priority, who it\'s for (several people make one task each; nobody picked means it\'s for you) ' +
          'and match. A **report request** only goes to Lead and Senior scouts and needs a player; the profile\'s ' +
          'Request report button opens it filled in.',
      },
    },
  },
  args: { base: '/head-scout', players, onCreate: noop, onClose: noop },
} satisfies Meta<typeof TaskSheet>

export default meta
type Story = StoryObj<typeof meta>

export const NewTask: Story = {}
export const RequestReport: Story = {
  args: { prefill: { type: 'report-request', players: [players[0]] } },
}
