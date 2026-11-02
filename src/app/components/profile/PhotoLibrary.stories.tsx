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
          '- Fewer photos get bigger squares; a full page is up to 6 × 2 on desktop, 4 × 2 on tablet, 2 × 3 on phone, and fits without scrolling.\n' +
          '- More than one page adds "Prev 1 2 … Next Last" (the shared `Pagination`).\n' +
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
  parameters: { docs: { description: { story: 'Two photos fill the space as two large squares — not two small tiles in a row of six.' } } },
}
export const ManyPhotos: Story = {
  args: { playerId: 'db-0' },
  parameters: { docs: { description: { story: '30 photos: full pages of 12 with pagination; tiles keep one size from page to page.' } } },
}
export const Empty: Story = {
  args: { playerId: 'db-2' },
  parameters: { docs: { description: { story: 'No photos yet — the empty state says what to add and why.' } } },
}
