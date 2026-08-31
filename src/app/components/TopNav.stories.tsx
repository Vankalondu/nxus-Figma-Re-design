import type { Meta, StoryObj } from '@storybook/react-vite'
import { TopNav } from './TopNav'

// Inline avatar so the story never depends on a network fetch.
const AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
       <rect width="96" height="96" fill="#1E88E5"/>
       <text x="48" y="60" font-family="sans-serif" font-size="34" font-weight="700"
             fill="#D2E7FA" text-anchor="middle">VL</text>
     </svg>`,
  )

const RolePill = ({ label }: { label: string }) => (
  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-body font-bold text-[12px] whitespace-nowrap">
    {label}
  </span>
)

const meta = {
  title: 'Components/TopNav',
  component: TopNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The top navigation bar, identical on every page (**P-CO7**): `sticky top-6`, ' +
          '`bg-card/90` with a backdrop blur, `rounded-[24px]`, `--shadow-lg`.\n\n' +
          'It holds search and actions rather than links — navigation is the sidebar plus tabs ' +
          '(**P-L2**). Contents run left to right: player search, role pill, notification bell ' +
          'with unread count, This Week, Add Report, Add Player, theme toggle, avatar.\n\n' +
          'Action buttons are **gated on their handlers**: pass `onAddReport` and the button ' +
          'appears, omit it and it does not. That is how one component serves every role without ' +
          'a role prop — a Country Scout has no Add Report, a Video Manager has no This Week, and ' +
          'neither needs a conditional inside the nav.',
      },
    },
  },
  argTypes: {
    rolePill: { control: false, description: 'Role indicator node.' },
    unreadCount: { control: 'number', description: 'Bell badge. Derived live from the approval queue for the Video Manager.' },
    onThisWeek: { action: 'this week' },
    onAddReport: { action: 'add report', description: 'Omit to hide the button.' },
    onAddPlayer: { action: 'add player', description: 'Omit to hide the button.' },
    onUploadVideo: { action: 'upload video', description: 'Uploader roles. Omit to hide.' },
    uploadVideoVariant: { control: 'radio', options: ['primary', 'secondary'] },
    avatarImg: { control: false },
  },
  args: { avatarImg: AVATAR, unreadCount: 4 },
} satisfies Meta<typeof TopNav>

export default meta
type Story = StoryObj<typeof meta>

export const LeadScout: Story = {
  args: {
    rolePill: <RolePill label="Lead Scout" />,
    onThisWeek: () => {},
    onAddReport: () => {},
    onAddPlayer: () => {},
  },
  render: (a) => <div className="p-6"><TopNav {...a} /></div>,
}

export const CountryScout: Story = {
  parameters: {
    docs: { description: { story: 'No `onAddReport`, so no Add Report button — nothing else changes.' } },
  },
  args: {
    rolePill: <RolePill label="Country Scout" />,
    onAddPlayer: () => {},
    responsive: true,
  },
  render: (a) => <div className="p-6"><TopNav {...a} /></div>,
}

export const VideoManager: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Upload Video as a secondary action, and an unread count that in the app is derived ' +
          'from the pending approval queue rather than set by hand.',
      },
    },
  },
  args: {
    rolePill: <RolePill label="Video Manager" />,
    onAddPlayer: () => {},
    onUploadVideo: () => {},
    uploadVideoVariant: 'secondary',
    unreadCount: 4,
  },
  render: (a) => <div className="p-6"><TopNav {...a} /></div>,
}

export const Uploader: Story = {
  parameters: {
    docs: { description: { story: 'Upload Video as the primary action; no scout-side buttons at all.' } },
  },
  args: {
    rolePill: <RolePill label="Package Uploader" />,
    onUploadVideo: () => {},
    uploadVideoVariant: 'primary',
    unreadCount: 0,
  },
  render: (a) => <div className="p-6"><TopNav {...a} /></div>,
}
