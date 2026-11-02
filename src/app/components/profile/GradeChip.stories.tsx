import type { Meta, StoryObj } from '@storybook/react-vite'
import { GradeChip } from './GradeChip'

const meta = {
  title: 'NXUS/Player profile/GradeChip',
  component: GradeChip,
  parameters: {
    docs: {
      description: {
        component: 'Grade and next-step chips used in report tables and the report panel. Colours follow **P-CO15**: A+ is the only filled brand chip; M (monitor) and D (drop) use the warning and error status pairs (**L-C4**). There is no legend on the Reports tab — scouts know the letters (D-20); hovering a grade code shows its full name.',
      },
    },
  },
  args: { value: 'A+' },
} satisfies Meta<typeof GradeChip>

export default meta
type Story = StoryObj<typeof meta>

export const Grade: Story = {}
export const NextStep: Story = { args: { value: 'M', nxt: true } }
