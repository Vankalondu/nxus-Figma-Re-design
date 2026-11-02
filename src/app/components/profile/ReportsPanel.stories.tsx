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
          '(`newReportRequest`). Each card reads "Short report (2)" with "3 of 5 grades ⌄" and an underlined "Hide report" ' +
          'on the same line. Rows lead with the scout, then what was watched and when; grades sit in a grid of up to five ' +
          '(**D-20**). Clicking a row opens the report panel (**P-CO22**).',
      },
    },
  },
  args: { playerId: 'db-1', player: { name: 'Djicoura Bamba', initials: 'DB', positions: 'ST / RW / LW', team: 'ATS Koro', age: 18, nationality: 'Mali' } },
  render: (args) => <div className="h-[760px] p-6 bg-surface-page"><ReportsPanel {...args} /></div>,
} satisfies Meta<typeof ReportsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
