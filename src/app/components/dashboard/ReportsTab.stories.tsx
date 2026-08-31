import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReportsTab } from './ReportsTab'

const meta = {
  title: 'Components/ReportsTab',
  component: ReportsTab,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The shared Reports tab, used by the Lead and Senior Scout dashboards. Reports have no ' +
          'standalone page and no sidebar entry — the content lives here, inside the dashboard ' +
          '(**§11.2**).\n\n' +
          'It carries summary stats, the champion podium (see `ChampionPodium`), and the report ' +
          'cards, with filters for scout, grade, position, recency and read state, plus a search. ' +
          'Cards reveal six at a time rather than all at once.\n\n' +
          '`onAddReport` is optional and gates the add action, the same pattern as `TopNav` — the ' +
          'roles that cannot file a report simply do not pass it.',
      },
    },
  },
  argTypes: {
    onAddReport: { action: 'add report', description: 'Optional. Omit to hide the add action.' },
  },
} satisfies Meta<typeof ReportsTab>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { onAddReport: () => {} },
  render: (a) => <div className="p-6"><ReportsTab {...a} /></div>,
}

export const WithoutAddReport: Story = {
  parameters: {
    docs: { description: { story: 'No `onAddReport` — a role that reads reports but does not file them.' } },
  },
  render: () => <div className="p-6"><ReportsTab /></div>,
}
