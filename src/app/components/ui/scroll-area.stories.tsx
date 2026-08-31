import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScrollArea, ScrollBar } from './scroll-area'

const meta = {
  title: 'Primitives/ScrollArea',
  component: ScrollArea,
  parameters: {
    docs: {
      description: {
        component:
          'A scroll container with a styled scrollbar, so the chrome matches the theme instead ' +
          'of the operating system.\n\n' +
          'Horizontal scroll is how NXUS keeps a real spreadsheet on small screens: the player ' +
          'tables scroll sideways with the identity column frozen (**P-CO9**). Note the page body ' +
          'itself must never scroll horizontally — wide content scrolls inside its own container.',
      },
    },
  },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <ScrollArea className="h-[180px] w-[320px] rounded-[20px] border border-border p-4">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="font-body text-[12px] text-foreground">
            Player {i + 1} — report filed
          </span>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  parameters: { docs: { description: { story: 'Sideways scroll, as the player tables use at narrow widths.' } } },
  render: () => (
    <ScrollArea className="w-[360px] rounded-[20px] border border-border">
      <div className="flex gap-4 p-4">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="w-[120px] h-[80px] shrink-0 rounded-[16px] bg-accent flex items-center justify-center font-body text-[12px] text-muted-foreground">
            Col {i + 1}
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
}
