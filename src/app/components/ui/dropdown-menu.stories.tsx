import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreVertical } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from './dropdown-menu'
import { Button } from './button'

const meta = {
  title: 'Primitives/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Action menu. In NXUS this is the kebab on a table row and on global search results — ' +
          'add to shortlist, add to target, upload highlight.\n\n' +
          'Menu surfaces are `rounded-xl` (**R-R1**) at `--shadow-2xl` when portalled ' +
          '(**P-CO12**). Items open in `animate-fade-in` at 150ms (**R-M1**).',
      },
    },
  },
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon"><MoreVertical className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Kofi Mensah</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Add to shortlist</DropdownMenuItem>
        <DropdownMenuItem>Add to target</DropdownMenuItem>
        <DropdownMenuItem>Upload highlight</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const WithCheckboxes: Story = {
  parameters: { docs: { description: { story: 'Column visibility, as used by the Edit Columns flow (**P-CO17**).' } } },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Columns</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Player</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Position</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>Team</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Contract expiry</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
