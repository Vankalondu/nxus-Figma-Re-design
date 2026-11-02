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
          'Toolbar: All / Long / Short / Target with counts, Show archived, Grades (the two-panel picker, **P-CO21**) ' +
          'and the primary **New report**. One light card per report type (**P-CO3**) — not the old solid blue bar — ' +
          'with rows grouped by what was watched, then by scout, and grade chips in **P-CO15** colours. Column codes ' +
          'show the full grade name on hover. Clicking a row opens the report panel (**P-CO22**).',
      },
    },
  },
  args: { playerId: 'db-1', player: { name: 'Djicoura Bamba', initials: 'DB', positions: 'ST / RW / LW', team: 'ATS Koro', age: 18, nationality: 'Mali' } },
  render: (args) => <div className="h-[760px] p-6 bg-surface-page"><ReportsPanel {...args} /></div>,
} satisfies Meta<typeof ReportsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
