import type { Meta, StoryObj } from '@storybook/react-vite'
import { HoverCard, HoverCardTrigger, HoverCardContent } from './hover-card'

const meta = {
  title: 'Primitives/HoverCard',
  component: HoverCard,
  parameters: {
    docs: {
      description: {
        component:
          'A richer preview on hover — more than a tooltip, less than a click-through. Suits a ' +
          'player-name peek from a dense table, where opening the full profile would cost the ' +
          'scout their place in the list.\n\n' +
          'Hover-only, so like `Tooltip` it is invisible on touch and must never be the sole ' +
          'route to information.',
      },
    },
  },
} satisfies Meta<typeof HoverCard>

export default meta
type Story = StoryObj<typeof meta>

export const PlayerPeek: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="font-body font-bold text-[13px] text-primary hover:underline cursor-pointer">
          Kofi Mensah
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-[280px]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary text-chalk font-body font-black text-[12px] flex items-center justify-center">
            KM
          </div>
          <div>
            <p className="font-body font-bold text-[13px] text-foreground">Kofi Mensah</p>
            <p className="font-body text-[11px] text-muted-foreground">Accra Lions · ST · 19</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-primary/12 text-foreground font-body font-black text-[10px]">A</span>
          <span className="bg-primary/20 text-foreground font-bold px-2 py-0.5 rounded text-[11px]">F3</span>
          <span className="bg-primary/20 text-foreground font-bold px-2 py-0.5 rounded text-[11px]">H5</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
}
