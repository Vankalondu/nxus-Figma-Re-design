import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { PhotoLightbox } from './PhotoLightbox'
import { placeholderPhoto, PlayerPhoto } from '../../state/photoStore'

const photos: PlayerPhoto[] = Array.from({ length: 6 }, (_, i) => {
  const p = placeholderPhoto(i)
  return { id: 'p' + i, src: p.src, ratio: p.ratio, tag: p.tag, uploadedBy: 'Tom Legg', dateLabel: 'Sep 28, 2026', fileName: `photo-${i + 1}.svg` }
})

const meta = {
  title: 'NXUS/Player profile/PhotoLightbox',
  component: PhotoLightbox,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full-size viewer (**P-CO20**): the uncropped photo as large as the screen allows, Previous / Next ' +
          'arrows, keyboard ← → and Esc, swipe on touch, "3 of 40", who uploaded it and when, and Download.',
      },
      story: { inline: false, iframeHeight: 640 },
    },
  },
  args: { photos, index: 0, onIndex: () => {}, onClose: () => {} },
  render: (args) => {
    const [i, setI] = useState(args.index)
    return <PhotoLightbox {...args} index={i} onIndex={setI} />
  },
} satisfies Meta<typeof PhotoLightbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
