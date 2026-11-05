import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toaster } from 'sonner'
import { RequestVideoButton } from './RequestVideoButton'

const meta = {
  title: 'NXUS/Player profile/Request video',
  component: RequestVideoButton,
  parameters: {
    docs: {
      description: {
        component:
          'On the profile\'s Videos & Highlights tab (**P-CO28**, **D-27**). A solid blue button like Request report; it ' +
          'opens three choices — **Package**, **Full match**, **Both**. Picking one sends the request straight to the ' +
          'account\'s Video Manager as a task (their board, and your "Assigned by me") and shows "Video request sent to …". ' +
          'Arrow keys move through the options; Esc or a click outside closes it.',
      },
    },
  },
  args: { player: { id: 'tl-0', name: 'Ibrahim Sangare' } },
  render: args => <div className="p-6 pb-48 flex justify-end w-[420px]"><RequestVideoButton {...args} /><Toaster /></div>,
} satisfies Meta<typeof RequestVideoButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
