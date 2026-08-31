import type { Meta, StoryObj } from '@storybook/react-vite'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './chart'

const meta = {
  title: 'Primitives/Chart',
  component: ChartContainer,
  parameters: {
    docs: {
      description: {
        component:
          'A themed wrapper around Recharts. `ChartContainer` takes a `config` mapping each data ' +
          'key to a label and colour, and supplies it to the tooltip and legend so the two cannot ' +
          'disagree with the chart.\n\n' +
          'Give series colours as **CSS variables**, not literals — that is **L-G1**, and it is ' +
          'what lets a chart adapt between themes. NXUS charts in `AnalyticsTab` currently use ' +
          'their own SVG and hard-coded series colours; the pipeline stages there deepen from ' +
          '`--blue-300` through `--scout-amber` to `--blue-700`, keeping green reserved for the ' +
          'status meaning in **L-C3**.\n\n' +
          'The `--chart-1` … `--chart-5` tokens exist for this purpose (**R-C2**) though no app ' +
          'code consumes them yet.',
      },
    },
  },
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

const data = [
  { month: 'Apr', long: 42, short: 18, target: 6 },
  { month: 'May', long: 51, short: 21, target: 8 },
  { month: 'Jun', long: 47, short: 24, target: 7 },
  { month: 'Jul', long: 60, short: 28, target: 9 },
  { month: 'Aug', long: 58, short: 31, target: 11 },
]

const config = {
  long: { label: 'Long added', color: 'var(--blue-300)' },
  short: { label: 'Short added', color: 'var(--scout-amber)' },
  target: { label: 'Moved to Target', color: 'var(--blue-700)' },
}

export const Default: Story = {
  render: () => (
    <div className="w-[520px]">
      <ChartContainer config={config} className="h-[240px] w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="long" fill="var(--color-long)" radius={4} />
          <Bar dataKey="short" fill="var(--color-short)" radius={4} />
          <Bar dataKey="target" fill="var(--color-target)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
}
