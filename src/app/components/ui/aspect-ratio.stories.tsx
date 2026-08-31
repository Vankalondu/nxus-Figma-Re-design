import type { Meta, StoryObj } from '@storybook/react-vite'
import { AspectRatio } from './aspect-ratio'

const meta = {
  title: 'Primitives/AspectRatio',
  component: AspectRatio,
  parameters: {
    docs: {
      description: {
        component:
          'Holds a fixed ratio while the width flexes. NXUS uses 16:9 for video thumbnails and ' +
          'the player workspace, so the layout does not jump once a thumbnail loads.\n\n' +
          'Reserving the space is the point — a grid that reflows as images arrive is the most ' +
          'common cause of a mis-click.',
      },
    },
  },
} satisfies Meta<typeof AspectRatio>

export default meta
type Story = StoryObj<typeof meta>

export const Video: Story = {
  render: () => (
    <div className="w-[360px]">
      <AspectRatio ratio={16 / 9}>
        <div className="w-full h-full rounded-[16px] bg-accent border border-border flex items-center justify-center">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
            16 : 9 — match footage
          </span>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const Square: Story = {
  render: () => (
    <div className="w-[200px]">
      <AspectRatio ratio={1}>
        <div className="w-full h-full rounded-[16px] bg-accent border border-border flex items-center justify-center">
          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">1 : 1</span>
        </div>
      </AspectRatio>
    </div>
  ),
}
