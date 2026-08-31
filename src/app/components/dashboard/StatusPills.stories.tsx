import type { Meta, StoryObj } from '@storybook/react-vite'
import { PriorityPill, TASK_STATE_META } from './shared'

/**
 * Status and priority pills are the system's colour vocabulary made visible.
 * They are the clearest place to see L-C3 in action: every one of these
 * reports a state, and none of them is decorative.
 */
const meta = {
  title: 'Components/Status pills',
  component: PriorityPill,
  parameters: {
    docs: {
      description: {
        component:
          'Soft translucent tint at `/15`, text in the status colour, pill radius (**P-CO5**). ' +
          'Never a heavy solid fill — solid status colours compete with the `bg-primary` ' +
          'structural anchors, and a table can carry dozens of these at once.\n\n' +
          'Colours resolve through the `scout-*` tokens, never bracketed hex (**L-C4**), so ' +
          'they stay correct in both themes. Flip the theme in the toolbar to check.',
      },
    },
  },
  argTypes: {
    p: {
      control: 'radio',
      options: ['High', 'Medium', 'Low'],
      description: 'Priority level. Drives the tint via `PRIORITY_PILL`.',
    },
  },
  args: { p: 'High' },
} satisfies Meta<typeof PriorityPill>

export default meta
type Story = StoryObj<typeof meta>

export const Priority: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'High = red, Medium = amber, Low = muted (**P-CO6**). Low is deliberately colourless — ' +
          'if every priority had a colour, none of them would read as urgent.',
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <PriorityPill p="High" />
      <PriorityPill p="Medium" />
      <PriorityPill p="Low" />
    </div>
  ),
}

export const TaskStatus: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Task state, from `TASK_STATE_META`. Overdue is **derived** from the deadline rather ' +
          'than set by hand — a task cannot be marked overdue, it becomes overdue.',
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {Object.entries(TASK_STATE_META).map(([key, meta]) => (
        <span
          key={key}
          className={`inline-block px-2 py-[2px] rounded-full font-body text-[10px] font-black ${meta.cls}`}
        >
          {meta.label}
        </span>
      ))}
    </div>
  ),
}

export const SemanticMeanings: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The full vocabulary (**L-C3**). These meanings are fixed across every view — a scout ' +
          'scans hundreds of rows, so a green dot has to mean the same thing everywhere or the ' +
          'scanning skill they build stops transferring.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        ['bg-scout-green/15 text-scout-green', 'Green', 'success · complete · scouted · approved'],
        ['bg-scout-amber/15 text-scout-amber', 'Amber', 'pending · in progress · warning · monitor'],
        ['bg-scout-red/15 text-scout-red', 'Red', 'late · flagged · unscouted · destructive'],
        ['bg-primary/15 text-primary', 'Blue', 'assigned'],
      ].map(([cls, label, meaning]) => (
        <div key={label} className="flex items-center gap-4">
          <span className={`inline-block px-2 py-[2px] rounded-full font-body text-[10px] font-black w-16 text-center ${cls}`}>
            {label}
          </span>
          <span className="font-body text-[12px] text-muted-foreground">{meaning}</span>
        </div>
      ))}
    </div>
  ),
}
