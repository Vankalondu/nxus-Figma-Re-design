import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { TasksTab } from './TasksTab'
import { MOCK_TASKS } from './shared'

const meta = {
  title: 'Components/TasksTab',
  component: TasksTab,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The shared Tasks tab, used by the Lead Scout, Senior Scout, Video Manager and ' +
          'uploader dashboards. One implementation, so the four cannot drift.\n\n' +
          'Layout is task card **left**, distribution chart **right**. Five status tabs: Pending, ' +
          'In Progress, Done, **Overdue** and Archived. Overdue is *derived* from the deadline — ' +
          'a task cannot be marked overdue, it becomes overdue — and Archived is a placeholder ' +
          'for future auto-archiving.\n\n' +
          'Rows paginate at ten per page rather than scrolling: with a hundred tasks, scrolling ' +
          'loses the header and the user loses their place. Controls sit at the bottom only, and ' +
          'must be reachable without scrolling.\n\n' +
          'Status colours come from `TASK_STATE_META` and the `scout-*` tokens (**L-C4**), and ' +
          'priority follows **P-CO6**. The done control is a **square checkbox**, far right — a ' +
          'circle reads as picking an option rather than completing something.\n\n' +
          '> **Known issue — the seed data has aged out.** `MOCK_TASKS` carries hardcoded ' +
          'deadlines between 2026-07-25 and 2026-08-20. Because Overdue is derived from the ' +
          'deadline against *today*, every unfinished task now reads as overdue, leaving Pending ' +
          'and In Progress empty. That is the derivation working correctly on stale input, not a ' +
          'bug in this component — but it means the tab misrepresents itself in both the app and ' +
          'these stories. The fix is to seed deadlines relative to the current date rather than ' +
          'as fixed strings.',
      },
    },
  },
  argTypes: {
    tasks: { control: false, description: 'Task list. Overdue is computed from `deadline`, not passed in.' },
    onToggle: { action: 'toggled', description: 'Checkbox — marks a task done.' },
    onAdd: { action: 'added', description: 'Assign-task form submit.' },
    onSetStatus: { action: 'status changed', description: 'Status dropdown — flips pending ↔ in-progress.' },
    showDistribution: {
      control: 'boolean',
      description: 'Show the distribution chart. Lead, Senior and Video Manager pass true; uploaders pass false.',
    },
  },
} satisfies Meta<typeof TasksTab>

export default meta
type Story = StoryObj<typeof meta>

/** Wired to local state, so the checkbox and status dropdown genuinely work. */
function Harness({ showDistribution }: { showDistribution?: boolean }) {
  const [tasks, setTasks] = useState<any[]>(() => MOCK_TASKS.map((t) => ({ ...t })))
  return (
    <div className="p-6">
      <TasksTab
        tasks={tasks}
        showDistribution={showDistribution}
        onToggle={(id) =>
          setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completed: !t.completed, status: t.completed ? 'pending' : 'done' } : t)))
        }
        onSetStatus={(id, status) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)))}
        onAdd={(input: any) =>
          setTasks((ts) => [
            {
              id: `new-${ts.length + 1}`,
              text: input.text || 'Untitled task',
              description: input.description ?? '',
              priority: input.priority ?? 'Medium',
              status: 'pending',
              assignedTo: input.assignedTo ?? 'Me',
              assignedDate: new Date().toISOString().slice(0, 10),
              deadline: input.deadline ?? '',
              completed: false,
            },
            ...ts,
          ])
        }
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <Harness showDistribution />,
}

export const WithoutDistribution: Story = {
  name: 'Uploader view (no chart)',
  parameters: {
    docs: {
      description: {
        story:
          'Uploaders pass `showDistribution={false}`. They own their own queue rather than ' +
          'allocating work across a team, so a distribution chart would be noise.',
      },
    },
  },
  render: () => <Harness showDistribution={false} />,
}

export const AtScale: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A hundred tasks — the case pagination exists for. Page through and note the header ' +
          'stays put and the controls stay reachable.',
      },
    },
  },
  render: () => {
    const [tasks, setTasks] = useState<any[]>(() =>
      Array.from({ length: 100 }, (_, i) => {
        const base = MOCK_TASKS[i % MOCK_TASKS.length]
        return { ...base, id: `scale-${i}`, text: `${base.text} (${i + 1})` }
      }),
    )
    return (
      <div className="p-6">
        <TasksTab
          tasks={tasks}
          showDistribution
          onToggle={(id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))}
          onSetStatus={(id, status) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)))}
          onAdd={() => {}}
        />
      </div>
    )
  },
}
