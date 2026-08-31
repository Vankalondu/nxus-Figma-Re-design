import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

const meta = {
  title: 'Primitives/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component:
          'A segmented control — several toggles acting as one. NXUS uses this shape a lot: the ' +
          'Weekly/Monthly switch on the Tasks chart, the tier filter on coverage tables, the ' +
          'priority filter.\n\n' +
          'Preferred over a radio group where the options are few, because it costs one row ' +
          'instead of several (**§0 density**).',
      },
    },
  },
} satisfies Meta<typeof ToggleGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => {
    const [v, setV] = useState('weekly')
    return (
      <ToggleGroup type="single" value={v} onValueChange={(x) => x && setV(x)}>
        <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
        <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
      </ToggleGroup>
    )
  },
}

export const TierFilter: Story = {
  parameters: { docs: { description: { story: 'The tier filter from the coverage tables.' } } },
  render: () => {
    const [v, setV] = useState('short')
    return (
      <ToggleGroup type="single" value={v} onValueChange={(x) => x && setV(x)}>
        <ToggleGroupItem value="target">Target</ToggleGroupItem>
        <ToggleGroupItem value="short">Short</ToggleGroupItem>
        <ToggleGroupItem value="long">Long</ToggleGroupItem>
      </ToggleGroup>
    )
  },
}

export const Multiple: Story = {
  render: () => {
    const [v, setV] = useState<string[]>(['high'])
    return (
      <ToggleGroup type="multiple" value={v} onValueChange={setV}>
        <ToggleGroupItem value="high">High</ToggleGroupItem>
        <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
        <ToggleGroupItem value="low">Low</ToggleGroupItem>
      </ToggleGroup>
    )
  },
}
