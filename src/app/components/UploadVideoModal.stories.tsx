import type { Meta, StoryObj } from '@storybook/react-vite'
import { UploadVideoModal } from './UploadVideoModal'

const meta = {
  title: 'Components/UploadVideoModal',
  component: UploadVideoModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The upload modal, whose rules differ by video type — the interesting part is what each ' +
          'type *forbids*.\n\n' +
          '| Type | Source | Approval |\n' +
          '| --- | --- | --- |\n' +
          '| **Highlight** | file **or** link | none |\n' +
          '| **Package** | file only | Video Manager must approve |\n' +
          '| **Full match** | file only | none |\n\n' +
          'Links are forbidden for packages and full matches because a dead external link means ' +
          'footage that existed at scouting time and does not at decision time. For file-only ' +
          'types the link toggle is hidden and the reason stated, rather than the option being ' +
          'shown and then rejected.\n\n' +
          'Submitting routes by type: a package joins the approval queue, a full match bypasses it ' +
          'and sets availability on the tracker, a highlight counts toward the KPI immediately. ' +
          'Each confirms with a toast at top-right.\n\n' +
          '`allowedTypes` is what makes this one component serve three roles — a package uploader ' +
          'gets highlight and package, a full-match uploader gets full-match only, the Video ' +
          'Manager gets all three.',
      },
    },
  },
  argTypes: {
    allowedTypes: { control: 'object', description: 'Which types this role may upload.' },
    uploaderName: { control: 'text' },
    onClose: { action: 'closed' },
  },
  args: { uploaderName: 'Vanessa Lighthouse', onClose: () => {} },
} satisfies Meta<typeof UploadVideoModal>

export default meta
type Story = StoryObj<typeof meta>

export const VideoManager: Story = {
  args: { allowedTypes: ['highlight', 'package', 'full-match'] },
  parameters: { docs: { description: { story: 'All three types. Switch between them to see the source rules change.' } } },
}

export const PackageUploader: Story = {
  args: { allowedTypes: ['highlight', 'package'] },
  parameters: {
    docs: { description: { story: 'Highlight allows a link; package is file-only and says why.' } },
  },
}

export const FullMatchUploader: Story = {
  args: { allowedTypes: ['full-match'] },
  parameters: {
    docs: { description: { story: 'One type, file-only — the link toggle is absent rather than disabled.' } },
  },
}
