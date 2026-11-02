import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { PhotoGrid, bestTile } from './PhotoGrid'
import { placeholderPhoto, PlayerPhoto } from '../../state/photoStore'

const make = (n: number): PlayerPhoto[] => Array.from({ length: n }, (_, i) => {
  const p = placeholderPhoto(i)
  return { id: 'p' + i, src: p.src, ratio: p.ratio, tag: p.tag, uploadedBy: 'David Mbugua', dateLabel: 'Oct 12, 2026', fileName: `photo-${i + 1}.svg` }
})

const meta = {
  title: 'NXUS/Player profile/PhotoGrid',
  component: PhotoGrid,
  parameters: {
    docs: {
      description: {
        component:
          'The square tiles of the Photo library (**P-CO20**). `bestTile()` picks the column count that gives the ' +
          'biggest square for the photos on the page, inside the box — up to 6 across. Every tile is a ' +
          '20px-corner card (**R-R1**) showing the whole photo on `bg-surface-accent`. The ⋯ menu holds Set as ' +
          'profile photo, tags, Download and Delete.',
      },
    },
  },
  args: { onOpen: fn(), onProfile: fn(), onTag: fn(), onDelete: fn() },
} satisfies Meta<typeof PhotoGrid>

export default meta
type Story = StoryObj<typeof meta>

const at = (n: number, w = 960, h = 520) => {
  const { cols, size } = bestTile(n, w, h, 6, 2, true)
  return { photos: make(n), cols, size }
}

export const TwoPhotos: Story = { args: { ...at(2), profileId: 'p0' } }
export const SixPhotos: Story = { args: at(6) }
export const FullPage: Story = { args: at(12) }
export const Uploading: Story = {
  args: { ...at(3), photos: make(3).map((p, i) => i === 0 ? { ...p, progress: 45, fileName: 'IMG_2041.jpg' } : p) },
  parameters: { docs: { description: { story: 'A tile shows its own progress while the file uploads.' } } },
}
