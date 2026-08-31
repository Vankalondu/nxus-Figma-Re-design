import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator,
} from './breadcrumb'

const meta = {
  title: 'Primitives/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component:
          'Trail back up a hierarchy. NXUS is mostly flat — sidebar nav plus tabs — so ' +
          'breadcrumbs appear only where there is real depth, such as a player profile reached ' +
          'from a specific list.\n\n' +
          'The current page is a `BreadcrumbPage`, not a link. Linking the page you are already ' +
          'on is a small lie the user pays for by clicking it.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="#">Players</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbLink href="#">Short List</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>Kofi Mensah</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
}
