import type { Meta, StoryObj } from '@storybook/react-vite'
import { KANBAN_GRID, KanbanColumn, KanbanReportCard } from './ReportsKanban'
import { TEMPLATES, gradeQuestions, seedReports, templateById } from '../../data/profileReports'

const reports = seedReports('db-0')
const col = (id: string) => {
  const tpl = templateById(id)
  return { tpl, reports: reports.filter(r => r.templateId === id && !r.archived), grades: gradeQuestions(tpl), totalGrades: gradeQuestions(tpl).length }
}
const noop = () => {}

const meta = {
  title: 'NXUS/Player profile/Reports Kanban',
  component: KanbanColumn,
  parameters: {
    docs: {
      description: {
        component:
          'The Reports tab as a Kanban-style board (**P-CO22**, **D-24**). Four boards, one per report type; three per row on ' +
          'desktop (the fourth wraps), reports two to a row inside each board, rows lined up (176px floor), two on tablet, one on phone — never sideways scrolling. Not ' +
          'draggable: a report\'s type can\'t change.\n\n' +
          'Inside a column, reports are grouped by scout — the scout name is the group heading — newest first. Under the ' +
          'name, on one line, what was reported on and the date; the card below holds only the grades, with the ' +
          '**code above each chip** (full name on hover). The column header is the type name (no count) with the quiet ' +
          '"5 of 5 grades ⌄" and the underlined "Hide report" text buttons.',
      },
    },
  },
  args: { ...col('scout'), onGrades: noop, onHide: noop, onOpen: noop },
  render: (args) => <div className="w-[320px]"><KanbanColumn {...args} /></div>,
} satisfies Meta<typeof KanbanColumn>

export default meta
type Story = StoryObj<typeof meta>

export const Column: Story = {
  parameters: { docs: { description: { story: 'One board at its desktop width (~320px).' } } },
}

export const EmptyColumn: Story = {
  args: { ...col('target'), reports: [] },
  parameters: { docs: { description: { story: 'A report type with nothing under the current list filter stays as a slim column.' } } },
}

export const Card: Story = {
  parameters: { docs: { description: { story: 'One report: source and date on one line, then the card with only the grades, code above each chip.' } } },
  render: () => {
    const tpl = templateById('long')
    return (
      <ul className="w-[240px]">
        <KanbanReportCard report={reports.find(r => r.templateId === 'long')!} typeName={tpl.name} grades={gradeQuestions(tpl)} onOpen={noop} />
      </ul>
    )
  },
}

export const Board: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: { description: { story: 'The four report types in the profile content width: three in the first row, the fourth below.' } },
  },
  render: () => (
    <div className="p-6 bg-surface-page w-[1018px]">
      <div className={KANBAN_GRID}>
        {TEMPLATES.filter(t => !t.archived).map(t => {
          const c = col(t.id)
          return <KanbanColumn key={t.id} {...c} onGrades={noop} onHide={noop} onOpen={noop} />
        })}
      </div>
    </div>
  ),
}
