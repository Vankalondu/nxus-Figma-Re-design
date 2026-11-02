import type { Meta, StoryObj } from '@storybook/react-vite'
import { PhotoLibrary } from './PhotoLibrary'

const meta = {
  title: 'NXUS/Player profile/PhotoLibrary',
  component: PhotoLibrary,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Photo library tab on the player profile — identical for every account (**P-L3**, **P-CO20**, **D-19**).\n\n' +
          '- Square tiles show the **whole** photo (no cropping), so scouts see as much as possible before opening it.\n' +
          '- Every tile is the same size: 5 across on desktop (about 10 in view at 1440 × 900), 4 on tablet, 2 on phone. The grid scrolls — no pagination (**D-20**).\n' +
          '- The tag filter and "Add photos" follow the shared control looks (**P-CO23**): filter colour and the top-nav secondary button.\n' +
          '- Add photos by button or drag-and-drop: JPG, PNG, WebP or HEIC, up to 10 MB each, with a clear reason for any file that is turned away.\n' +
          '- Each photo: Set as profile photo, tag (Headshot / Full body / Action / Team), Download, Delete with a 5-second Undo.',
      },
    },
  },
  render: (args) => <div className="h-[760px] p-6 bg-surface-page"><PhotoLibrary {...args} /></div>,
} satisfies Meta<typeof PhotoLibrary>

export default meta
type Story = StoryObj<typeof meta>

export const TwoPhotos: Story = {
  args: { playerId: 'db-1' },
  parameters: { docs: { description: { story: 'Two photos keep the standard tile size.' } } },
}
export const ManyPhotos: Story = {
  args: { playerId: 'db-0' },
  parameters: { docs: { description: { story: '30 photos: about ten in view, the grid scrolls for the rest.' } } },
}
export const Empty: Story = {
  args: { playerId: 'db-2' },
  parameters: { docs: { description: { story: 'No photos yet — the empty state says what to add and why.' } } },
}
