import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportsPanel } from './ReportsPanel'

const meta = {
  title: 'NXUS/Player profile/ReportsPanel',
  component: ReportsPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Reports tab on the player profile — identical for every account (**P-L3**, **P-CO22**, **D-19**).\n\n' +
          'Toolbar in the filter colour (**P-CO23**): All / Long / Short / Target with counts, Show archived, Grades (the ' +
          'two-panel picker, **P-CO21**). No legend and no New report button — the top-nav Add Report opens the flow ' +
          '(`newReportRequest`). The list buttons filter by the list the player was on, not the report type.\n\n' +
          'Kanban board (**D-23**): one column per report type, wrapping into rows of up to five; inside each, reports ' +
          'grouped by scout, with the code above each grade chip. Each column reads "Short report (2)" with ' +
          '"3 of 5 grades ⌄" and an underlined "Hide report". Clicking a report opens the report panel (**P-CO22**).',
      },
    },
  },
  args: { playerId: 'db-1', player: { name: 'Djicoura Bamba', initials: 'DB', positions: 'ST / RW / LW', team: 'ATS Koro', age: 18, nationality: 'Mali' } },
  render: (args) => <div className="h-[760px] p-6 bg-surface-page"><ReportsPanel {...args} /></div>,
} satisfies Meta<typeof ReportsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ManyReportTypes: Story = {
  name: 'Many report types (wraps)',
  args: { playerId: 'db-0' },
  parameters: { docs: { description: { story: 'Eight report types: five columns in the first row, the rest below (**D-23**).' } } },
}
