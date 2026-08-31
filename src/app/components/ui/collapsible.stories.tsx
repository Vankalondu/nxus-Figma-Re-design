import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible'

const meta = {
  title: 'Primitives/Collapsible',
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component:
          'A single show/hide region — `Accordion` without the grouping. Use it for one optional ' +
          'block, such as advanced filters that most scouts leave closed.',
      },
    },
  },
} satisfies Meta<typeof Collapsible>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-[420px]">
        <CollapsibleTrigger className="flex items-center gap-2 font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          Advanced filters
          <ChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 font-body text-[12px] text-muted-foreground">
          Minutes played, contract expiry, and preferred foot.
        </CollapsibleContent>
      </Collapsible>
    )
  },
}
