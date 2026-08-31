import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayerVideoWorkspace } from './PlayerVideoWorkspace'
import { ALL_GENERATED_PLAYERS } from './SeniorLeadPlayersPage'

const PLAYER = ALL_GENERATED_PLAYERS[0]

const meta = {
  title: 'Components/PlayerVideoWorkspace',
  component: PlayerVideoWorkspace,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The full-screen workspace for watching a player’s footage and filing a report ' +
          'against it — the two activities side by side, because a scout writing from memory ' +
          'writes worse notes than one writing from the clip.\n\n' +
          'It seeds from the shared player store, so **highlights uploaded through global search ' +
          'appear here immediately**, tagged External link or Uploaded file depending on their ' +
          'source. That is the store doing its job: the upload happened in a dropdown three ' +
          'components away.\n\n' +
          'The video surface is near-black by design — it is the one place a very dark backdrop ' +
          'is correct, since anything lighter competes with the footage.',
      },
    },
  },
  argTypes: {
    player: { control: false, description: 'The player whose footage this is.' },
    onClose: { action: 'closed' },
    onSaveReport: { action: 'report saved' },
  },
  args: { player: PLAYER, onClose: () => {}, onSaveReport: () => {} },
} satisfies Meta<typeof PlayerVideoWorkspace>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
