import type { Meta, StoryObj } from '@storybook/react-vite'
import { AnalyticsTab } from './AnalyticsTab'

const meta = {
  title: 'Components/AnalyticsTab',
  component: AnalyticsTab,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The shared Analytics tab, used by the Lead and Senior Scout dashboards. Charts are ' +
          'hand-built SVG rather than a charting library, which is why they are pixel-tuned to ' +
          'the token layer.\n\n' +
          '**The talent map reverses its age axis** so younger runs right — that puts the ' +
          'priority quadrant (young and highly rated) in the top right, where the eye lands ' +
          'first. It is a small decision that changes what the chart is *for*.\n\n' +
          'Chart series colours follow the pipeline ruling of 31 Aug: stages **deepen** as a ' +
          'player progresses — Long added `--blue-300`, Short added `--scout-amber`, Moved to ' +
          'Target `--blue-700`. Deepening reads as movement toward signing, and it leaves green ' +
          'reserved for the status meaning in **L-C3** rather than spending it on a pipeline ' +
          'stage.\n\n' +
          'Axis labels and gridline text bind `var(--muted-foreground)` rather than a literal. ' +
          'They were fixed hexes until 31 Aug, which meant they never adapted to dark mode — a ' +
          'live **L-C8** violation. Toggle the theme to confirm they follow now.',
      },
    },
  },
} satisfies Meta<typeof AnalyticsTab>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <div className="p-6"><AnalyticsTab /></div>,
}

export const Dark: Story = {
  globals: { theme: 'dark' },
  parameters: {
    docs: {
      description: {
        story:
          'Dark mode. The axis text adapts because it binds a token; if it still looked pale ' +
          'blue here, the L-C8 fix would have regressed.',
      },
    },
  },
  render: () => <div className="p-6"><AnalyticsTab /></div>,
}
