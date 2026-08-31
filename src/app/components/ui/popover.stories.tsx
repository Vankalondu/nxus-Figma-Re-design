import type { Meta, StoryObj } from '@storybook/react-vite'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Button } from './button'

const meta = {
  title: 'Primitives/Popover',
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          'A small floating panel anchored to its trigger. Unlike a tooltip it can hold ' +
          'interactive content, and unlike a dialog it does not block the page.\n\n' +
          'NXUS uses one for the Redo action in the Video Manager approval queue: a reason field ' +
          'plus quick chips, which then creates a High-priority editor task. Elevation is ' +
          '`--shadow-md` (**R-E1**).',
      },
    },
  },
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Redo</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px]">
        <p className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Reason for redo
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {['Wrong player', 'Poor quality', 'Too short'].map((c) => (
            <span key={c} className="px-3 py-1 rounded-full bg-accent text-muted-foreground font-body font-bold text-[10px] cursor-pointer hover:text-foreground">
              {c}
            </span>
          ))}
        </div>
        <textarea
          rows={2}
          placeholder="Add a note…"
          className="w-full bg-card border border-border rounded-xl px-3 py-2 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
        />
      </PopoverContent>
    </Popover>
  ),
}
