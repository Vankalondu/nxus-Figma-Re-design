import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from './dialog'
import { Button } from './button'

const meta = {
  title: 'Primitives/Dialog',
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          'Modal dialog. NXUS modal styling is specified in **P-CO14**: overlay ' +
          '`bg-midnight/60` with a backdrop blur, card at `rounded-[32px]`, and a ' +
          '**primary-filled header** with `text-chalk` — one of the few places `bg-primary` is ' +
          'correct on a large surface, because a modal header is a structural anchor rather than ' +
          'a card (**L-C7**).\n\n' +
          'Elevation is `--shadow-2xl` (**R-E1**), the heaviest step, reserved for things that ' +
          'float above everything else.',
      },
    },
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Player</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a player</DialogTitle>
          <DialogDescription>They will appear on the Long List for review.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Add player</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const NxusModal: Story = {
  name: 'NXUS modal (P-CO14)',
  parameters: {
    docs: { description: { story: 'The specified anatomy — primary header on chalk, 32px radius, 32px body padding.' } },
  },
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open NXUS-styled modal</Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden rounded-[32px] border border-border shadow-[var(--shadow-2xl)] sm:max-w-[520px]">
        <div className="px-8 py-6 bg-primary text-chalk">
          <DialogTitle className="font-heading font-semibold text-[20px] text-chalk">Upload highlight</DialogTitle>
          <DialogDescription className="font-body text-[14px] text-chalk/80 mt-1">
            Paste a link, or choose a file from your device.
          </DialogDescription>
        </div>
        <div className="p-8 space-y-4">
          <input
            className="w-full bg-card border border-border rounded-xl px-4 py-2 text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
            placeholder="https://…"
          />
          <button className="w-full bg-primary text-primary-foreground rounded-full py-3 font-body font-bold text-[14px]">
            Upload
          </button>
        </div>
      </DialogContent>
    </Dialog>
  ),
}
