import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Small inline label. NXUS uses badges heavily — grade pills, NXT indicators, position ' +
          'pills, video counts (**P-CO11**, **P-CO15**) — and they are always `rounded-full` ' +
          'per **L-R1**.\n\n' +
          'When a badge reports a *state* rather than a category, its colour is not free: it must ' +
          'follow the status vocabulary in **L-C3** and use the `scout-*` tokens (**L-C4**).',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
    children: { control: 'text' },
  },
  args: { children: 'A+', variant: 'default' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(['default', 'secondary', 'destructive', 'outline'] as const).map((v) => (
        <Badge key={v} variant={v}>{v}</Badge>
      ))}
    </div>
  ),
}

export const NxusGradePills: Story = {
  name: 'NXUS grade pills (P-CO15)',
  parameters: {
    docs: { description: { story: 'The grade scale as specified: A+ solid primary, A tinted, B and C progressively muted.' } },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-body font-black text-[10px]">A+</span>
      <span className="px-2 py-0.5 rounded-full bg-primary/12 text-foreground font-body font-black text-[10px]">A</span>
      <span className="px-2 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground font-body font-black text-[10px]">B</span>
      <span className="px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-body font-black text-[10px]">C</span>
    </div>
  ),
}

export const NxusVideoCounts: Story = {
  name: 'NXUS video counts (P-CO11)',
  parameters: {
    docs: { description: { story: 'The Videos cluster present on every player table and never removed.' } },
  },
  render: () => (
    <div className="flex items-center gap-2">
      <span className="bg-primary/20 text-foreground font-bold px-2 py-0.5 rounded text-[12px]">F3</span>
      <span className="bg-primary/20 text-foreground font-bold px-2 py-0.5 rounded text-[12px]">H5</span>
    </div>
  ),
}
