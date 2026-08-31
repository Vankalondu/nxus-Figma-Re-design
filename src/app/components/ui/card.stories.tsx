import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from './card'

const meta = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'Surface container. NXUS card styling is specified in **P-CO3**: `bg-card`, ' +
          '`rounded-[40px]`, `border-border`, `shadow-[var(--shadow-lg)]`, lifting on hover.\n\n' +
          'Radius carries meaning here (**R-R1**) — 40px for dashboard and KPI cards, 32px for ' +
          'tables and modals, 20px for forms. A card at the wrong radius reads as belonging to a ' +
          'different layer of the interface.\n\n' +
          'Remember **L-C7**: at most one card per view may use `bg-primary` as its background.',
      },
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Upcoming Matches</CardTitle>
        <CardDescription>Fixtures for players in your scope</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-body text-[12px] text-muted-foreground">Three fixtures this week.</p>
      </CardContent>
      <CardFooter>
        <span className="font-body font-bold text-[12px] text-primary">View all</span>
      </CardFooter>
    </Card>
  ),
}

export const NxusCard: Story = {
  name: 'NXUS card (P-CO3)',
  parameters: { docs: { description: { story: 'The specified styling, including the hover lift.' } } },
  render: () => (
    <div className="bg-card rounded-[40px] border border-border shadow-[var(--shadow-lg)] hover:-translate-y-1 hover:shadow-xl transition-all p-8 w-[380px]">
      <h3 className="font-heading font-semibold text-[20px] text-foreground mb-2">Scout Leaderboard</h3>
      <p className="font-body text-[14px] text-muted-foreground">Reports filed this cycle, by scout.</p>
    </div>
  ),
}

export const AccentCard: Story = {
  name: 'Accent card (P-C2, L-C7)',
  parameters: {
    docs: {
      description: {
        story:
          'The one primary-background card permitted per view. All text is `text-chalk` ' +
          '(**L-C6**) and internal borders are `border-white/10`.',
      },
    },
  },
  render: () => (
    <div className="bg-primary rounded-[40px] p-8 w-[380px]">
      <h3 className="font-heading font-semibold text-[20px] text-chalk mb-2">Latest Packages</h3>
      <p className="font-body text-[14px] text-chalk/80">Four packages uploaded since Monday.</p>
      <div className="mt-4 pt-4 border-t border-white/10">
        <span className="font-body font-bold text-[12px] text-chalk">Open Packages</span>
      </div>
    </div>
  ),
}
