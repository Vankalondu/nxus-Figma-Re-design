import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './skeleton'

const meta = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          'Loading placeholder. Shape it like the content that is coming — a skeleton that does ' +
          'not match causes a visible reflow the moment data lands, which reads as a bug.\n\n' +
          'Note **L-M1**: a skeleton is for data in flight, never a way to hide content behind ' +
          'JavaScript. If the script fails, the real content must still be readable.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Skeleton className="w-[280px] h-6 rounded-full" />,
}

export const TableRows: Story = {
  parameters: { docs: { description: { story: 'Matching the identity cluster: avatar circle, then name and meta lines.' } } },
  render: () => (
    <div className="w-[420px] flex flex-col gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3 w-1/2 rounded-full" />
            <Skeleton className="h-2 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  ),
}

export const KpiCardLoading: Story = {
  parameters: { docs: { description: { story: 'A KPI card at its real dimensions (**P-CO4**) — `rounded-[32px]`, `min-h-[190px]`.' } } },
  render: () => (
    <div className="bg-card rounded-[32px] border border-border shadow-[var(--shadow-lg)] p-6 min-h-[190px] w-[280px] flex flex-col justify-between gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-2 w-24 rounded-full" />
      </div>
      <Skeleton className="h-9 w-20 rounded-lg" />
    </div>
  ),
}
