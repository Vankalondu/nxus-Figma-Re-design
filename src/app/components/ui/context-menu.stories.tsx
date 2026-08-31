import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem,
  ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut,
} from './context-menu'

const meta = {
  title: 'Primitives/ContextMenu',
  component: ContextMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Right-click menu. NXUS prefers the visible kebab (**P-CO12**) for row actions, because ' +
          'a right-click menu is undiscoverable and unavailable on touch.\n\n' +
          'Treat it as an accelerator for power users — never the only route to an action.',
      },
    },
  },
} satisfies Meta<typeof ContextMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[140px] w-[360px] items-center justify-center rounded-[20px] border border-dashed border-border text-muted-foreground font-body text-[12px]">
        Right-click this row
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Kofi Mensah</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>Add to shortlist<ContextMenuShortcut>⌘S</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuItem>Add to target<ContextMenuShortcut>⌘T</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Open profile</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
}
