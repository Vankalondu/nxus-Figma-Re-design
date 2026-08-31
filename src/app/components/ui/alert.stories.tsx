import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertTriangle, Info } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from './alert'

const meta = {
  title: 'Primitives/Alert',
  component: Alert,
  parameters: {
    docs: {
      description: {
        component:
          'A persistent inline message, as opposed to a toast that disappears. Use it when the ' +
          'user needs the information to stay put — a missing full match, an unlinked upload.\n\n' +
          'The `destructive` variant is genuinely for problems. Under **L-C3** red means late, ' +
          'flagged or destructive, so an alert that is merely informational must not borrow it.',
      },
    },
  },
  argTypes: { variant: { control: 'radio', options: ['default', 'destructive'] } },
  args: { variant: 'default' },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (a) => (
    <div className="w-[480px]">
      <Alert {...a}>
        <Info className="size-4" />
        <AlertTitle>Coverage incomplete</AlertTitle>
        <AlertDescription>14 players on the Short List have no full match footage.</AlertDescription>
      </Alert>
    </div>
  ),
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (a) => (
    <div className="w-[480px]">
      <Alert {...a}>
        <AlertTriangle className="size-4" />
        <AlertTitle>Upload has no player linked</AlertTitle>
        <AlertDescription>This package cannot be approved until it is tagged to a player.</AlertDescription>
      </Alert>
    </div>
  ),
}
