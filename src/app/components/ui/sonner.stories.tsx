import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from 'sonner'
import { Toaster } from './sonner'
import { Button } from './button'

const meta = {
  title: 'Primitives/Toaster (sonner)',
  component: Toaster,
  parameters: {
    docs: {
      description: {
        component:
          'Transient confirmations. NXUS mounts one `<Toaster />` in `App.tsx` at ' +
          '**`position="top-right"`**, and every success message in the product surfaces through ' +
          'it — adding to a shortlist, uploading a highlight, approving a package.\n\n' +
          'A toast is for confirming something that already happened. Anything the user must act ' +
          'on needs a surface that persists: use `Alert` (**§9**), which stays put.\n\n' +
          'Note this primitive is imported from `sonner@2.0.3` in the Figma Make export — the ' +
          'Vite alias layer in `vite.shared.mjs` maps that back to the bare package.',
      },
    },
  },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast('Added to Short List')}>Default</Button>
        <Button variant="outline" onClick={() => toast.success('Package approved')}>Success</Button>
        <Button variant="outline" onClick={() => toast.error('Upload has no player linked')}>Error</Button>
        <Button variant="outline" onClick={() => toast('Highlight uploaded', { description: 'Kofi Mensah · H5' })}>
          With description
        </Button>
      </div>
    </>
  ),
}
