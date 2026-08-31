import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: {
    docs: {
      description: {
        component:
          'Circular avatar with a fallback for when the image is missing or slow. NXUS players ' +
          'have no photographs, so player avatars are **initials chips** throughout — the ' +
          'fallback is the normal case here, not the exception (**P-CO10**).',
      },
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Fallback: Story = {
  parameters: { docs: { description: { story: 'The usual case in NXUS: initials on primary.' } } },
  render: () => (
    <Avatar>
      <AvatarFallback className="bg-primary text-chalk font-body font-black text-[11px]">KM</AvatarFallback>
    </Avatar>
  ),
}

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="" />
      <AvatarFallback className="bg-primary text-chalk font-body font-black text-[11px]">VL</AvatarFallback>
    </Avatar>
  ),
}

export const TableSize: Story = {
  parameters: {
    docs: { description: { story: 'The `w-8 h-8` initials circle used in the identity cluster of every player table.' } },
  },
  render: () => (
    <div className="flex items-center gap-3">
      {['KM', 'NO', 'DM', 'SK'].map((i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full bg-primary text-chalk font-body font-black text-[11px] flex items-center justify-center"
        >
          {i}
        </div>
      ))}
    </div>
  ),
}
