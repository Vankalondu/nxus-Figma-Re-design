import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Command, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
} from './command'

const meta = {
  title: 'Primitives/Command',
  component: Command,
  parameters: {
    docs: {
      description: {
        component:
          'Filterable command palette, built on `cmdk`. Type to narrow the list; arrow keys and ' +
          'Enter drive it entirely from the keyboard.\n\n' +
          'NXUS global player search (`PlayerSearch`) is a bespoke component rather than this ' +
          'one, because it needs two-line result rows with a flag, an avatar chip and a kebab. ' +
          'Use `Command` where a plain filtered list is enough.',
      },
    },
  },
} satisfies Meta<typeof Command>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Command className="w-[380px] rounded-xl border border-border">
      <CommandInput placeholder="Find a player" />
      <CommandList>
        <CommandEmpty>No players found.</CommandEmpty>
        <CommandGroup heading="Short List">
          <CommandItem>Kofi Mensah<CommandShortcut>ST</CommandShortcut></CommandItem>
          <CommandItem>Nene Okafor<CommandShortcut>CAM</CommandShortcut></CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Target List">
          <CommandItem>David Mbugua<CommandShortcut>CB</CommandShortcut></CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
}
