import type { Meta, StoryObj } from '@storybook/react-vite'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption } from './table'

const meta = {
  title: 'Primitives/Table',
  component: Table,
  parameters: {
    docs: {
      description: {
        component:
          'The table primitive. NXUS table anatomy is fully specified in **P-CO9** and is the ' +
          'densest surface in the product — this is where **§0 density** is won or lost.\n\n' +
          'Key points: container at `rounded-[32px]` with `overflow-hidden`; group header row on ' +
          '`bg-primary` in **both** themes, because it is a structural anchor rather than a card ' +
          '(**L-C9**); rows alternate `bg-card` and `bg-accent/30`, resetting at each position ' +
          'group so the first player after a header always starts on `bg-card`. Table pages use ' +
          '`w-full max-w-none` and `px-8` padding.',
      },
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[560px]">
      <Table>
        <TableCaption>Short List — 4 players</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Pos</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-right">Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            ['Kofi Mensah', 'ST', 'Accra Lions', 19],
            ['Nene Okafor', 'CAM', 'Lagos City', 21],
            ['David Mbugua', 'CB', 'Nairobi United', 20],
            ['Sarah Kimani', 'LW', 'Mombasa FC', 18],
          ].map(([n, p, t, a]) => (
            <TableRow key={n as string}>
              <TableCell className="font-bold">{n}</TableCell>
              <TableCell>{p}</TableCell>
              <TableCell>{t}</TableCell>
              <TableCell className="text-right tabular-nums">{a}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const NxusTable: Story = {
  name: 'NXUS table (P-CO9)',
  parameters: {
    docs: {
      description: {
        story:
          'The specified anatomy: primary group header, alternating rows resetting at the ' +
          'position group, identity cluster with initials chip and scout dot, Videos cluster. ' +
          'Toggle the theme — the group headers deliberately do not flip.',
      },
    },
  },
  render: () => (
    <div className="w-full max-w-none bg-card rounded-[32px] shadow-[var(--shadow-lg)] border border-border overflow-hidden">
      <div className="bg-primary text-primary-foreground font-heading font-bold text-[10px] uppercase tracking-widest px-4 py-3 text-center">
        Bio Data
      </div>
      <div className="bg-primary text-primary-foreground font-heading font-bold text-[10px] uppercase tracking-widest px-4 py-2">
        Strikers (2)
      </div>
      {[
        ['KM', 'Kofi Mensah', 'Accra Lions', 19, true, 'bg-card'],
        ['AO', 'Amara Obi', 'Lagos City', 20, false, 'bg-accent/30'],
      ].map(([ini, name, team, age, scouted, bg]) => (
        <div key={name as string} className={`${bg} flex items-center gap-3 border-b border-border/40 hover:bg-accent transition-colors py-3 px-4`}>
          <div className="w-8 h-8 rounded-full bg-primary text-chalk font-body font-black text-[11px] flex items-center justify-center shrink-0">
            {ini}
          </div>
          <span className="font-body font-bold text-[13px] text-foreground hover:underline cursor-pointer">{name}</span>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: scouted ? 'var(--scout-green)' : 'var(--scout-red)' }} />
          <span className="font-body text-[12px] text-muted-foreground">{team}</span>
          <span className="font-body text-[12px] text-muted-foreground tabular-nums ml-auto">{age}</span>
          <span className="bg-primary/20 text-foreground font-bold px-2 py-0.5 rounded text-[12px]">F3</span>
          <span className="bg-primary/20 text-foreground font-bold px-2 py-0.5 rounded text-[12px]">H5</span>
        </div>
      ))}
    </div>
  ),
}
