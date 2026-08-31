import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          'Radix tabs. NXUS does not use this primitive for its page tabs — it uses ' +
          '`ResponsiveTabs`, which renders the pill strip in **P-CO2** and adds count badges ' +
          'and responsive behaviour. Reach for that first; this is here for local, in-card ' +
          'tabbing.\n\n' +
          'Tab order is an information-hierarchy decision, not a styling one: the Tasks tab sits ' +
          'last on every scout dashboard, consistently.',
      },
    },
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[480px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="packages">Packages</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-4 font-body text-[12px] text-muted-foreground">
        Four KPIs and the below-KPI section.
      </TabsContent>
      <TabsContent value="packages" className="pt-4 font-body text-[12px] text-muted-foreground">
        Coverage table, filtered by tier.
      </TabsContent>
      <TabsContent value="tasks" className="pt-4 font-body text-[12px] text-muted-foreground">
        Task table with the distribution chart.
      </TabsContent>
    </Tabs>
  ),
}
