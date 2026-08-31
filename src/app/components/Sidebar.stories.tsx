import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus, Upload, FileText } from 'lucide-react'
import { Sidebar } from './Sidebar'

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The primary navigation (**P-CO8**). Surface is `bg-sidebar`; the active item is ' +
          '`bg-primary/10 text-primary` with a `border-l-[3px] border-primary`, so the current ' +
          'section is legible from the left edge alone.\n\n' +
          'It derives its own base path from the logged-in role, which is how one component ' +
          'serves every dashboard without a role prop — a Video Manager’s links point at ' +
          '`/video-manager/*`, a Lead Scout’s at `/lead-scout/*`.\n\n' +
          'The mobile drawer opens from the top-nav hamburger via a `nxus:open-menu` window ' +
          'event, rather than threading open-state through every dashboard shell. The `actions` ' +
          'prop supplies drawer-only buttons for things that live in the top bar on desktop.\n\n' +
          'Note the profile block and theme toggle were deliberately removed from here: the ' +
          'avatar duplicated the top-nav one, and the theme toggle moved beside the notification ' +
          'bell (**D-3**).\n\n' +
          '> Not to be confused with `Primitives/Sidebar`, which is a stale duplicate. This is ' +
          'the one the app renders.',
      },
    },
  },
  argTypes: {
    actions: { control: false, description: 'Drawer-only action buttons (mobile). Desktop puts these in the top bar.' },
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="relative h-[600px] overflow-hidden">
      <Sidebar />
    </div>
  ),
}

export const WithDrawerActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `actions` supplied. These appear in the mobile drawer only — narrow the viewport ' +
          'and open the menu to see them.',
      },
    },
  },
  render: () => (
    <div className="relative h-[600px] overflow-hidden">
      <Sidebar
        actions={[
          { label: 'Add Player', icon: Plus, onClick: () => {} },
          { label: 'Add Report', icon: FileText, onClick: () => {} },
          { label: 'Upload Video', icon: Upload, onClick: () => {} },
        ]}
      />
    </div>
  ),
}
