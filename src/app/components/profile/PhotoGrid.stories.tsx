import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { PhotoGrid } from './PhotoGrid'
import { placeholderPhoto, PlayerPhoto } from '../../state/photoStore'

const make = (n: number): PlayerPhoto[] => Array.from({ length: n }, (_, i) => {
  const p = placeholderPhoto(i)
  return { id: 'p' + i, src: p.src, ratio: p.ratio, tag: p.tag, uploadedBy: 'David Mbugua', dateLabel: 'Oct 12, 2026', fileName: `photo-${i + 1}.jpg` }
})

const meta = {
  title: 'NXUS/Player profile/PhotoGrid',
  component: PhotoGrid,
  parameters: {
    docs: {
      description: {
        component:
          'The square tiles of the Photo library (**P-CO20**, **D-20**). Every tile is the same size whatever the number ' +
          'of photos: 5 across on desktop (about 10 in view), 4 on tablet, 2 on phone; the grid scrolls. Every tile is a ' +
          '20px-corner card (**R-R1**) showing the whole photo on `bg-surface-accent`. The ⋯ menu holds Set as ' +
          'profile photo, tags, Download and Delete.',
      },
    },
  },
  args: { onOpen: fn(), onProfile: fn(), onTag: fn(), onDelete: fn() },
} satisfies Meta<typeof PhotoGrid>

export default meta
type Story = StoryObj<typeof meta>

const at = (n: number) => ({ photos: make(n) })
const desktop = { decorators: [(S: any) => <div className="w-[960px]"><S /></div>] }

export const TwoPhotos: Story = {
  args: { ...at(2), profileId: 'p0' }, ...desktop,
  parameters: { docs: { description: { story: 'Two photos keep the standard tile size — they do not grow to fill the row.' } } },
}
export const TenPhotos: Story = { args: at(10), ...desktop }
export const Uploading: Story = {
  args: { ...at(3), photos: make(3).map((p, i) => i === 0 ? { ...p, progress: 45, fileName: 'IMG_2041.jpg' } : p) }, ...desktop,
  parameters: { docs: { description: { story: 'A tile shows its own progress while the file uploads.' } } },
}
