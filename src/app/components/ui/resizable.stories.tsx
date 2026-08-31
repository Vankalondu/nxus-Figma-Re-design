import type { Meta, StoryObj } from '@storybook/react-vite'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './resizable'

const meta = {
  title: 'Primitives/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    docs: {
      description: {
        component:
          'Split panes the user can drag. **Not currently used in NXUS** — dashboard layout is a ' +
          'fixed 2/3 + 1/3 grid (**P-L2**), which keeps every role seeing the same hierarchy.\n\n' +
          'That is deliberate: information hierarchy is a design decision, and a draggable ' +
          'divider hands it to the user. It would suit a video review workspace, where a scout ' +
          'genuinely does want to trade player list against player footage.',
      },
    },
  },
} satisfies Meta<typeof ResizablePanelGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-[520px] h-[220px] rounded-[20px] border border-border overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={65}>
          <div className="h-full flex items-center justify-center bg-card font-body text-[12px] text-muted-foreground">
            Footage
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35}>
          <div className="h-full flex items-center justify-center bg-accent/40 font-body text-[12px] text-muted-foreground">
            Player list
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}
