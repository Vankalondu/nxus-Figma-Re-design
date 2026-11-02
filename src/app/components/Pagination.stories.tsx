import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Pagination } from './Pagination'

const meta = {
  title: 'NXUS/Navigation/Pagination',
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component: 'Shared page control (**P-CO19**): used by the Lead Scout reports list and the profile Photo library. Numbered pills, the current page filled, ellipses past five pages, Prev / Next and an optional Last. Hidden when there is only one page.',
      },
    },
  },
  args: { page: 1, totalPages: 8, onPage: () => {}, showLast: true },
  render: (args) => {
    const [p, setP] = useState(args.page)
    return <Pagination {...args} page={p} onPage={setP} />
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const WithLast: Story = {}
export const Short: Story = { args: { totalPages: 3, showLast: false } }
