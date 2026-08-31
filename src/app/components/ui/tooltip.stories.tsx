import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'
import { Button } from './button'

const meta = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          'Hover hint. NXUS tables are dense by design (**§0**), so tooltips carry the labels ' +
          'that will not fit — what an `F3` badge counts, what a scout dot means.\n\n' +
          'A tooltip is not a place for information the user *needs*: it is invisible on touch ' +
          'devices and to anyone not hovering. Put anything essential on the surface.',
      },
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Opens the Short List</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

export const OnTableBadges: Story = {
  parameters: { docs: { description: { story: 'Explaining the Videos cluster counts (**P-CO11**).' } } },
  render: () => (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="bg-primary/20 text-foreground font-bold px-2 py-0.5 rounded text-[12px] cursor-default">F3</span>
          </TooltipTrigger>
          <TooltipContent>3 full matches available</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="bg-primary/20 text-foreground font-bold px-2 py-0.5 rounded text-[12px] cursor-default">H5</span>
          </TooltipTrigger>
          <TooltipContent>5 highlights uploaded</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
}
