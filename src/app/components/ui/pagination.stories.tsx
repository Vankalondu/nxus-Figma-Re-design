import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationPrevious, PaginationNext, PaginationEllipsis,
} from './pagination'

const meta = {
  title: 'Primitives/Pagination',
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component:
          'Page controls. The Tasks table uses pagination at ten rows per page rather than an ' +
          'endless scroll — with a hundred tasks, scrolling loses the header and the user loses ' +
          'their place.\n\n' +
          'Two rules NXUS learned the hard way: controls sit at the **bottom only**, and they ' +
          'must be reachable **without scrolling** — pagination you have to scroll to find ' +
          'defeats its own purpose.',
      },
    },
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
        <PaginationItem><PaginationEllipsis /></PaginationItem>
        <PaginationItem><PaginationLink href="#">6</PaginationLink></PaginationItem>
        <PaginationItem><PaginationNext href="#" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}
