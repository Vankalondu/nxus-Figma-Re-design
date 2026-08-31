import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogAction, AlertDialogCancel,
} from './alert-dialog'
import { Button } from './button'

const meta = {
  title: 'Primitives/AlertDialog',
  component: AlertDialog,
  parameters: {
    docs: {
      description: {
        component:
          'A confirmation the user cannot dismiss by clicking away — unlike `Dialog`, it demands ' +
          'an explicit answer. Reserve it for actions that destroy or cannot be undone: ' +
          'archiving a player, rejecting an upload.\n\n' +
          'Do not use it for routine confirmations. A dialog that always appears stops being ' +
          'read, and then the one that matters gets dismissed on reflex.',
      },
    },
  },
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Archive player</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Kofi Mensah?</AlertDialogTitle>
          <AlertDialogDescription>
            They will leave the Short List and stop appearing in coverage counts. You can restore
            them from the audit view.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Archive</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
