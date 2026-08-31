import type { Meta, StoryObj } from '@storybook/react-vite'
import { VideoTrackerGrid } from './VideoTrackerGrid'

const meta = {
  title: 'Components/VideoTrackerGrid',
  component: VideoTrackerGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The video tracker — the spreadsheet the video department works from, rendered as a ' +
          'real component. Shown to the Video Manager as the **Video Analyst Tracker** on the ' +
          'players page, and to uploaders as their players view.\n\n' +
          'Columns: priority tier badge, then player metadata (name, position, birth year, age, ' +
          'DOB, team, nationality flag, jersey), then the asset slots — **PKG** for the package ' +
          'and **FM1–FM3** for full matches.\n\n' +
          'Slot colour encodes state: cyan for uploaded and playable, amber for in progress, red ' +
          'for missing, grey for not applicable. The cyan is one of the open rulings in the style ' +
          'guide (**OR-3**) — the palette has no cyan, so this fourth state currently uses a ' +
          'literal.\n\n' +
          'Coverage status is **derived**, never set by hand: unassigned by default, assigned once ' +
          'someone is on it, in progress once an upload starts, has-video once approved. Full ' +
          'matches branch differently, since they can be marked not-available when no footage ' +
          'exists to source.\n\n' +
          'Data comes from the shared player and video stores, so tier filters and coverage ' +
          'reflect whatever state those hold.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'radio',
      options: ['uploader', 'manager'],
      description: "`manager` defaults to needs-video-only; `uploader` shows everything.",
    },
    canPkg: { control: 'boolean', description: 'This role may attach packages.' },
    canFm: { control: 'boolean', description: 'This role may attach full matches and set availability.' },
    onUpload: { action: 'upload requested' },
  },
  args: { mode: 'manager', canPkg: false, canFm: false },
} satisfies Meta<typeof VideoTrackerGrid>

export default meta
type Story = StoryObj<typeof meta>

export const ManagerView: Story = {
  args: { mode: 'manager' },
  parameters: {
    docs: { description: { story: 'What the Video Manager sees — filtered to players needing video by default.' } },
  },
  render: (a) => <div className="p-6"><VideoTrackerGrid {...a} /></div>,
}

export const PackageUploader: Story = {
  args: { mode: 'uploader', canPkg: true },
  parameters: {
    docs: { description: { story: 'A package uploader can attach packages but not full matches.' } },
  },
  render: (a) => <div className="p-6"><VideoTrackerGrid {...a} /></div>,
}

export const FullMatchUploader: Story = {
  args: { mode: 'uploader', canFm: true },
  parameters: {
    docs: {
      description: {
        story:
          'A full-match uploader gets the FM slots plus the available / not-available toggle, for ' +
          'when raw footage cannot be sourced at all.',
      },
    },
  },
  render: (a) => <div className="p-6"><VideoTrackerGrid {...a} /></div>,
}
