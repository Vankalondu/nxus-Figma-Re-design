import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { CardView } from './CardView'
import { ALL_GENERATED_PLAYERS } from './SeniorLeadPlayersPage'

const PLAYERS = ALL_GENERATED_PLAYERS.slice(0, 12)

const meta = {
  title: 'Components/CardView',
  component: CardView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The card alternative to the player tables, for when a scout wants to browse rather ' +
          'than compare. Tables win on comparison — that is why they are the default — but cards ' +
          'give each player room to breathe.\n\n' +
          '**The action set changes by tab.** A player on the Long List can be shortlisted; one on ' +
          'the Short List can move to Target or back; an archived player can only be restored. ' +
          'Rather than showing every action and disabling most, the component derives the ' +
          'available set from `currentTab` — a disabled button still has to be read before it can ' +
          'be dismissed.\n\n' +
          'Optional callbacks follow the same gating idea as `TopNav`: omit `onSendBackward` and ' +
          'no backward action appears.\n\n' +
          'Players here are real records from `ALL_GENERATED_PLAYERS`, so the cards show the same ' +
          'shape the app renders.',
      },
    },
  },
  argTypes: {
    players: { control: false, description: 'Player records.' },
    currentTab: {
      control: 'select',
      options: ['players-in-scope', 'top-10', 'reserve-list', 'database', 'long-list', 'short-list', 'target-list'],
      description: 'Drives which actions each card offers.',
    },
    archiveView: { control: 'radio', options: ['active', 'audit'] },
    flagMap: { control: false, description: 'Player id → flag code.' },
    onReserve: { action: 'reserve' },
    onShort: { action: 'shortlist' },
    onSendForward: { action: 'send forward' },
    onArchive: { action: 'archive' },
    onSendBackward: { action: 'send backward' },
    onRestore: { action: 'restore' },
    onRaise: { action: 'raise' },
  },
  args: {
    players: PLAYERS,
    currentTab: 'long-list',
    archiveView: 'active',
    onReserve: () => {},
    onShort: () => {},
    onSendForward: () => {},
    onArchive: () => {},
  },
} satisfies Meta<typeof CardView>

export default meta
type Story = StoryObj<typeof meta>

export const LongList: Story = {
  render: (a) => <div className="p-6"><CardView {...a} /></div>,
}

export const ShortList: Story = {
  args: { currentTab: 'short-list', onSendBackward: () => {} },
  parameters: {
    docs: { description: { story: 'With `onSendBackward` supplied, cards gain a way back down the pipeline.' } },
  },
  render: (a) => <div className="p-6"><CardView {...a} /></div>,
}

export const TargetList: Story = {
  args: { currentTab: 'target-list', onSendBackward: () => {} },
  render: (a) => <div className="p-6"><CardView {...a} /></div>,
}

export const ArchivedAudit: Story = {
  name: 'Archived (audit view)',
  parameters: {
    docs: { description: { story: 'Archived players in the audit view — restore is the only action.' } },
  },
  render: (a) => {
    const [archived] = useState(() => new Set(PLAYERS.slice(0, 4).map((p: any) => p.id)))
    return (
      <div className="p-6">
        <CardView {...a} archivedSet={archived} archiveView="audit" onRestore={() => {}} />
      </div>
    )
  },
}
