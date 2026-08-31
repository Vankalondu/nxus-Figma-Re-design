import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { EditColumnsModal } from './EditColumnsModal'
import { PLAYER_COLUMNS } from './playerColumns'

const defaultVisible = () => new Set(PLAYER_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id))

const meta = {
  title: 'Components/EditColumnsModal',
  component: EditColumnsModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Column visibility for the player tables (**P-CO17**). Scouts work different ' +
          'competitions with different relevant stats, so a fixed column set either buries what ' +
          'one scout needs or shows everyone everything — and density is the first value of this ' +
          'system (**§0**).\n\n' +
          'The modal keeps a **local draft**, re-seeded from the current selection each time it ' +
          'opens. Apply commits it; the X and the backdrop dismiss without committing. That ' +
          'distinction matters on a control with this many checkboxes — half-finished changes ' +
          'should not leak out because someone clicked away.\n\n' +
          'Named presets can be saved and recalled, so a scout does not rebuild the same view ' +
          'each cycle.\n\n' +
          'Columns come from the real `PLAYER_COLUMNS` registry, grouped BIO DATA, GAME STATS, ' +
          'METHOD, STATUS, GRADES and EXTERNAL.',
      },
    },
  },
  argTypes: {
    open: { control: 'boolean' },
    columns: { control: false, description: 'The column registry.' },
    visible: { control: false, description: 'Currently-visible ids. Re-seeds the draft on open.' },
    onApply: { action: 'applied' },
    onClose: { action: 'closed' },
  },
} satisfies Meta<typeof EditColumnsModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [visible, setVisible] = useState<Set<string>>(defaultVisible)
    const [open, setOpen] = useState(true)
    return (
      <div className="p-6">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors"
          >
            Edit columns ({visible.size} visible)
          </button>
        )}
        <EditColumnsModal
          open={open}
          columns={PLAYER_COLUMNS}
          visible={visible}
          onApply={(next) => { setVisible(next); setOpen(false) }}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
}

export const DraftIsDiscardedOnClose: Story = {
  name: 'Draft discarded on dismiss',
  parameters: {
    docs: {
      description: {
        story:
          'Toggle several columns, then dismiss with the X. Reopen — the draft is gone and the ' +
          'committed selection is intact. The count in the button only moves on Apply.',
      },
    },
  },
  render: () => {
    const [visible, setVisible] = useState<Set<string>>(defaultVisible)
    const [open, setOpen] = useState(false)
    return (
      <div className="p-6 flex flex-col gap-4 items-start">
        <span className="font-body font-bold text-[12px] text-foreground">
          Committed: <span className="tabular-nums">{visible.size}</span> columns visible
        </span>
        <button
          onClick={() => setOpen(true)}
          className="bg-primary border-2 border-primary text-primary-foreground hover:bg-primary/80 rounded-full px-6 py-3 font-body font-bold text-[14px] transition-colors shadow-md"
        >
          Edit columns
        </button>
        <EditColumnsModal
          open={open}
          columns={PLAYER_COLUMNS}
          visible={visible}
          onApply={(next) => { setVisible(next); setOpen(false) }}
          onClose={() => setOpen(false)}
        />
      </div>
    )
  },
}
