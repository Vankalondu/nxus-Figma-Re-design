import type { Meta, StoryObj } from '@storybook/react-vite'
import { EditFormBlueprintModal } from './EditFormBlueprintModal'

const meta = {
  title: 'Components/EditFormBlueprintModal',
  component: EditFormBlueprintModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The admin editor for report templates — the form scouts fill in when filing a report. ' +
          'Tabs cover template info, the questions themselves, and grading.\n\n' +
          'Passing `editTemplate` as `null` opens it as a new blueprint; passing a template ' +
          'prefills every field from it. The component reads each value with `??` fallbacks, so ' +
          'a partial template is safe rather than a crash.\n\n' +
          'This is a form that builds forms, so it is where an inconsistency in field styling ' +
          'would be most visible — everything follows **P-CO13**.',
      },
    },
  },
  argTypes: {
    editTemplate: { control: false, description: 'Template to edit, or `null` to create a new one.' },
    onClose: { action: 'closed' },
  },
  args: { onClose: () => {} },
} satisfies Meta<typeof EditFormBlueprintModal>

export default meta
type Story = StoryObj<typeof meta>

export const NewBlueprint: Story = {
  args: { editTemplate: null },
  parameters: { docs: { description: { story: 'Empty state — creating a template from scratch.' } } },
}

export const EditingExisting: Story = {
  parameters: { docs: { description: { story: 'Prefilled from an existing template.' } } },
  args: {
    editTemplate: {
      title: 'Striker Assessment',
      description: 'Standard evaluation for forwards in the Tier B pipeline.',
      formType: 'Scouting Report',
      estTime: '12 min',
      categories: ['Attacking', 'Physical'],
    },
  },
}
