import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Calendar } from './calendar'

const meta = {
  title: 'Primitives/Calendar',
  component: Calendar,
  parameters: {
    docs: {
      description: {
        component:
          'Date picker built on `react-day-picker`. NXUS also ships a bespoke date picker ' +
          '(**P-CO16**) for Scope Settings, which replaces the browser default with month and ' +
          'year dropdowns, a ±10-year list and Clear / Today actions.\n\n' +
          'Selected day is `bg-primary text-primary-foreground rounded-full`; today is ' +
          '`bg-primary/10 text-primary`.\n\n' +
          'Note this imports `react-day-picker@8.10.1` — a version-suffixed Figma Make specifier ' +
          'that the shared Vite alias layer maps back to the bare package.',
      },
    },
  },
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 14))
    return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl border border-border" />
  },
}

export const DeadlinePicker: Story = {
  parameters: { docs: { description: { story: 'Picking a task deadline — the readout uses the same short format as the Tasks table.' } } },
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date(2026, 7, 14))
    return (
      <div className="flex flex-col gap-3">
        <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
          Deadline
        </span>
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl border border-border" />
        <span className="font-body font-bold text-[12px] text-foreground">
          {date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
        </span>
      </div>
    )
  },
}
