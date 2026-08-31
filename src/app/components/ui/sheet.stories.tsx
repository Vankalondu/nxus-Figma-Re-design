import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader,
  SheetTitle, SheetDescription, SheetFooter, SheetClose,
} from './sheet'
import { Button } from './button'

const meta = {
  title: 'Primitives/Sheet',
  component: Sheet,
  parameters: {
    docs: {
      description: {
        component:
          'A panel sliding in from an edge. NXUS uses this shape for the mobile navigation ' +
          'drawer, opened from the top-nav hamburger.\n\n' +
          'Prefer it over a centred dialog when the content is a list or a long form — a sheet ' +
          'keeps the full height of the viewport, where a dialog would scroll internally.',
      },
    },
  },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Open menu</Button></SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Jump to a section.</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {['Dashboard', 'Players', 'Matches', 'Admin'].map((item, i) => (
            <span
              key={item}
              className={
                i === 0
                  ? 'bg-primary/10 text-primary border-l-[3px] border-primary px-3 py-2 font-body font-bold text-[12px]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent transition-colors px-3 py-2 font-body font-bold text-[12px]'
              }
            >
              {item}
            </span>
          ))}
        </nav>
        <SheetFooter>
          <SheetClose asChild><Button variant="outline">Close</Button></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="flex gap-3">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild><Button variant="outline">{side}</Button></SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader><SheetTitle>From {side}</SheetTitle></SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
}
