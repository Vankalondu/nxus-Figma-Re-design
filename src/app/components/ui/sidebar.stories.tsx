import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sidebar } from './sidebar'

const meta = {
  title: 'Primitives/Sidebar (stale duplicate)',
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component:
          '> **Do not use this file.** Despite living in `components/ui/`, this is not the shadcn ' +
          'sidebar primitive. It is an older copy of the NXUS sidebar, taking no props and ' +
          'reading the route and theme itself.\n\n' +
          '**Use `src/app/components/Sidebar.tsx` instead** — that is the one the app renders, it ' +
          'accepts an `actions` prop, and it is the only one that receives fixes.\n\n' +
          'This copy is unreachable from the router and carries 52 off-palette colour literals, ' +
          'which breaks **L-C1** and **L-C2**. It is kept in the repo (nothing is being deleted) ' +
          'and documented here so nobody imports it by mistake — an undocumented duplicate is ' +
          'how a stale component gets picked up months later.\n\n' +
          'The real sidebar’s specification is **P-CO8**: `bg-sidebar` surface, active item ' +
          '`bg-primary/10 text-primary border-l-[3px] border-primary`.',
      },
    },
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const StaleCopy: Story = {
  name: 'Stale copy — do not use',
  parameters: {
    docs: { description: { story: 'Rendered only so the duplicate is visible and identifiable.' } },
  },
  render: () => (
    <div className="relative h-[520px] overflow-hidden rounded-[20px] border border-dashed border-border">
      <Sidebar />
    </div>
  ),
}
