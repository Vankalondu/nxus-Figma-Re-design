import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Select, SelectTrigger, SelectValue, SelectContent,
  SelectItem, SelectGroup, SelectLabel, SelectSeparator,
} from './select'

const meta = {
  title: 'Primitives/Select',
  component: Select,
  parameters: {
    docs: {
      description: {
        component:
          'Dropdown selection. NXUS uses it for the task status field and the coverage status ' +
          'filters.\n\n' +
          'One hard-won detail: in a table, the menu must render **above** the rows, not be ' +
          'clipped by them. The pattern is a portal to `document.body` with a fixed position ' +
          'measured from the trigger (**P-CO12**) — a dropdown that opens behind the next row is ' +
          'a bug users report as "the menu does not work".',
      },
    },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[240px]">
      <Select defaultValue="pending">
        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in-progress">In progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Grouped: Story = {
  render: () => (
    <div className="w-[240px]">
      <Select defaultValue="short">
        <SelectTrigger><SelectValue placeholder="Choose a list" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Pipeline</SelectLabel>
            <SelectItem value="long">Long List</SelectItem>
            <SelectItem value="short">Short List</SelectItem>
            <SelectItem value="target">Target List</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Archive</SelectLabel>
            <SelectItem value="signed">Signed List</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
}
