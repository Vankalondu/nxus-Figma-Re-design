import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { GradesPicker, GradeVisibility } from './GradesPicker'
import { TEMPLATES } from '../../data/profileReports'

const meta = {
  title: 'NXUS/Player profile/GradesPicker',
  component: GradesPicker,
  parameters: {
    docs: {
      description: {
        component:
          'Choose which report types and grades show on the Reports tab (**P-CO21**, Vanessa\'s "Option A", **D-19**).\n\n' +
          '- **Two panels:** report types on the left with "5 of 5 grades" and a show/hide eye; the selected type\'s ' +
          'grades on the right with their full name and short code. Only one report\'s grades are listed at a ' +
          'time, so it never becomes a long scroll.\n' +
          '- **Search** covers report names, grade names and codes.\n' +
          '- **Every grade has a code** — NXUS makes one when the template has none, so nothing is lost under ' +
          '"+9 more without an acronym".\n' +
          '- **One control:** the toolbar Grades button and each section\'s "5 of 5 grades" chip open this same picker ' +
          '(the chip opens it on that report type). Saved per user.',
      },
    },
  },
  args: { templates: TEMPLATES, value: { hiddenTypes: [], hiddenGrades: {} }, onChange: () => {}, onClose: () => {} },
  render: (args) => {
    const [v, setV] = useState<GradeVisibility>(args.value)
    return <GradesPicker {...args} value={v} onChange={setV} />
  },
} satisfies Meta<typeof GradesPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const OpenedFromSection: Story = {
  args: { initialType: 'long', value: { hiddenTypes: ['short2'], hiddenGrades: { long: ['tac', 'phy'] } } },
  parameters: { docs: { description: { story: 'Opened from the Long report chip: two of its grades hidden, the archived type hidden.' } } },
}
