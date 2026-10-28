import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from './card'

const meta = {
  title: 'Primitives/Surfaces/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'Surface container. NXUS card styling is specified in **P-CO3**: `bg-surface-card`, ' +
          '`rounded-[20px]`, `border-default`, `shadow-[var(--shadow-lg)]`.\n\n' +
          'Radius carries meaning here (**R-R1**) — 32px for KPI cards and modals, 24px for the ' +
          'Players-page card, 20px for dashboard content cards and forms. A card at the wrong ' +
          'radius reads as belonging to a different layer of the interface.\n\n' +
          'There is no accent (solid-blue) card any more — retired 28 Oct 2026 (**P-C2**, **D-16**).',
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
        <p className="font-body text-[12px] text-body">Three fixtures this week.</p>
      </CardContent>
      <CardFooter>
        <span className="font-body font-bold text-[12px] text-link">View all</span>
      </CardFooter>
    </Card>
  ),
}

export const NxusCard: Story = {
  name: 'NXUS card (P-CO3)',
  parameters: { docs: { description: { story: 'The dashboard content card as specified in P-CO3: 20px corners, neutral surface.' } } },
  render: () => (
    <div className="bg-surface-card rounded-[20px] border border-default shadow-[var(--shadow-lg)] p-6 w-[380px]">
      <h3 className="font-heading font-semibold text-[20px] text-heading mb-2">Scout Leaderboard</h3>
      <p className="font-body text-[14px] text-body">Reports filed this cycle, by scout.</p>
    </div>
  ),
}
