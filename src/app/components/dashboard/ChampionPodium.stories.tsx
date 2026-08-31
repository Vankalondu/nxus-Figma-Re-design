import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChampionPodium } from './shared'

const meta = {
  title: 'Components/ChampionPodium',
  component: ChampionPodium,
  parameters: {
    docs: {
      description: {
        component:
          'The report-champion podium on the Reports tab. Ranks scouts by report count and ' +
          'shows the top three, with a crown on first and the lead over second called out.\n\n' +
          'Ranking is **derived** from the `count` values, not passed in — you cannot put a ' +
          'scout on the podium by hand, which keeps the leaderboard honest.\n\n' +
          'Rank colours: 1st `--primary`, 2nd silver, 3rd a soft teal. That teal (`#3fb4c0`) is ' +
          'currently a literal outside the palette and is one of the open rulings in the style ' +
          'guide (**OR-3**) — the palette has no teal to map it to.',
      },
    },
  },
  argTypes: {
    scouts: {
      control: 'object',
      description: 'Scouts to rank: `name`, `role`, `count`. Sorted internally by count, descending.',
    },
  },
  args: {
    scouts: [
      { name: 'Tom Achieng', role: 'Senior Scout', count: 24 },
      { name: 'Nene Okafor', role: 'Country Scout', count: 19 },
      { name: 'David Mbugua', role: 'Lead Scout', count: 15 },
      { name: 'Sarah Kimani', role: 'Country Scout', count: 11 },
    ],
  },
} satisfies Meta<typeof ChampionPodium>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CloseRace: Story = {
  parameters: {
    docs: { description: { story: 'A one-report lead. The gap readout is what makes the standing feel live rather than settled.' } },
  },
  args: {
    scouts: [
      { name: 'Tom Achieng', role: 'Senior Scout', count: 21 },
      { name: 'Nene Okafor', role: 'Country Scout', count: 20 },
      { name: 'David Mbugua', role: 'Lead Scout', count: 18 },
    ],
  },
}

export const ExactlyThree: Story = {
  parameters: {
    docs: { description: { story: 'The minimum for a full podium — no fourth place to fall back on.' } },
  },
  args: {
    scouts: [
      { name: 'Tom Achieng', role: 'Senior Scout', count: 12 },
      { name: 'Nene Okafor', role: 'Country Scout', count: 7 },
      { name: 'David Mbugua', role: 'Lead Scout', count: 3 },
    ],
  },
}
