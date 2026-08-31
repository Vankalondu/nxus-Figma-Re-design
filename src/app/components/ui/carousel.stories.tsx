import type { Meta, StoryObj } from '@storybook/react-vite'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './carousel'

const meta = {
  title: 'Primitives/Carousel',
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal slider built on Embla. Suits a strip of video thumbnails where showing all ' +
          'of them at once would cost more room than it is worth.\n\n' +
          'Use it sparingly: content in a carousel is content most people never see. Anything a ' +
          'scout needs to compare belongs in a table, not behind a next arrow.',
      },
    },
  },
} satisfies Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[420px] px-12">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 6 }, (_, i) => (
            <CarouselItem key={i} className="basis-1/2">
              <div className="aspect-video rounded-[16px] bg-accent border border-border flex items-center justify-center font-body text-[12px] text-muted-foreground">
                Clip {i + 1}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
}
