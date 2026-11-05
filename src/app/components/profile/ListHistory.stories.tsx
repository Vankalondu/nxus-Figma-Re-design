import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListHistory } from './ListHistory'
import '../SeniorLeadPlayersPage'

const meta = {
  title: 'NXUS/Player profile/List history',
  component: ListHistory,
  parameters: {
    docs: {
      description: {
        component:
          'Under the player name on every profile (**P-CO27**, **D-26**): one pill per list move, oldest at the top — ' +
          '"List · who put them there · date". The full history shows, including moves back down; the list the player ' +
          'is on now is filled, earlier ones are outlined. Moves come from the Lead and Senior Players tables.',
      },
    },
  },
  render: args => <div className="w-[272px] p-4 bg-surface-card rounded-[20px]"><ListHistory {...args} /></div>,
} satisfies Meta<typeof ListHistory>

export default meta
type Story = StoryObj<typeof meta>

export const OnTargetList: Story = { args: { playerId: 'tl-0' } }
export const MovedBackDown: Story = { args: { playerId: 'sl-2' } }
export const NotOnAList: Story = { args: { playerId: 'db-0' } }
