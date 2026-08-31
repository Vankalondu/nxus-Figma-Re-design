import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Menubar, MenubarMenu, MenubarTrigger, MenubarContent,
  MenubarItem, MenubarSeparator, MenubarShortcut,
} from './menubar'

const meta = {
  title: 'Primitives/Menubar',
  component: Menubar,
  parameters: {
    docs: {
      description: {
        component:
          'A desktop-application menu bar. **Not currently used anywhere in NXUS** — navigation ' +
          'is the sidebar plus tabs (**P-L2**), and a menu bar would be a third competing ' +
          'navigation model.\n\n' +
          'Documented because it ships with the primitive set. Before reaching for it, check ' +
          'whether the sidebar or a `DropdownMenu` already covers the need.',
      },
    },
  },
} satisfies Meta<typeof Menubar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New report<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Export CSV</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Edit columns</MenubarItem>
          <MenubarItem>Toggle theme</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
}
