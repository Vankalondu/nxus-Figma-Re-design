import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ReportSheet } from './ReportSheet'
import { TEMPLATES, seedReports } from '../../data/profileReports'

const report = seedReports('db-1')[0]
const player = { name: 'Djicoura Bamba', initials: 'DB', positions: 'ST / RW / LW', team: 'ATS Koro', age: 18, nationality: 'Mali' }

const meta = {
  title: 'NXUS/Player profile/ReportSheet',
  component: ReportSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A report opens in a right-side panel, not a centred pop-up, so the reports table stays in view (**P-CO22**).\n\n' +
          '- **View:** question on the left, grade on the right — a whole report fits on one screen. Previous / Next walk the list.\n' +
          '- **Edit:** each grade is one row of buttons (A+ A B C; T M D for next step) instead of a full-width row per answer. ' +
          'Save is enabled once every grade is given.\n' +
          '- **New report:** pick the report type, then the same panel opens in edit mode with the player filled in.',
      },
      story: { inline: false, iframeHeight: 720 },
    },
  },
  args: {
    templates: TEMPLATES, player, onChoose: fn(), onSave: fn(), onCancelEdit: fn(), onClose: fn(), onEdit: fn(), onPrev: fn(), onNext: fn(),
    state: { mode: 'view', report }, position: { index: 0, total: 6 },
  },
} satisfies Meta<typeof ReportSheet>

export default meta
type Story = StoryObj<typeof meta>

export const View: Story = {}
export const Edit: Story = { args: { state: { mode: 'edit', report, isNew: false } } }
export const ChooseType: Story = { args: { state: { mode: 'choose' }, position: undefined } }
export const NewReport: Story = {
  args: { state: { mode: 'edit', isNew: true, report: { ...report, id: 'new', scout: 'You', source: 'Profile', answers: {} } }, position: undefined },
}
