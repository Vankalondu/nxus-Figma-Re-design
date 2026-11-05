import type { Meta, StoryObj } from '@storybook/react-vite'
import { TasksTab } from './TasksTab'

const meta = {
  title: 'NXUS/Dashboard/TasksTab',
  component: TasksTab,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The dashboard Tasks tab is the **Tasks board** (**P-CO26**, **D-26**), the same on every dashboard ' +
          '(Country, Head, Lead, Senior, Video Manager, uploaders); only the tasks differ by account.\n\n' +
          'One Kanban board, no list view and no distribution chart. Four columns: **Overdue** (worked out from ' +
          'the due date, you cannot drop into it), **To-Do**, **In Progress**, **Completed**. Each column scrolls ' +
          'on its own with its header in place and loads 20 more as you reach the end.\n\n' +
          'Toolbar: Assigned to me / Assigned by me, a Filters button that shows one row of filters (as on the ' +
          'Players tables) and New task. Desktop shows all four columns; a tablet two at a time from a dropdown; ' +
          'a phone one, picked from the status dropdown.',
      },
    },
  },
} satisfies Meta<typeof TasksTab>

export default meta
type Story = StoryObj<typeof meta>

export const Board: Story = {
  render: () => <div className="p-6 bg-surface-page min-h-screen"><TasksTab /></div>,
}
