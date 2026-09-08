import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'Primitives/Inputs/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'The shadcn button primitive. Note NXUS specifies its own three button shapes in ' +
          '**P-CO1** — primary filled, secondary outline, destructive outline — all `rounded-full` ' +
          'per **L-R1**. This primitive ships shadcn’s default `rounded-md` variants, so where ' +
          'the two disagree, the style guide wins. See the last story for the NXUS shapes.\n\n' +
          'Imported by 8 files, the most-used primitive in the app.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { children: 'Add Player', variant: 'default', size: 'default' },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'] as const).map((v) => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const NxusShapes: Story = {
  name: 'NXUS shapes (P-CO1)',
  parameters: {
    docs: { description: { story: 'What the style guide actually prescribes: pill radius, bold body text, three variants only.' } },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <button className="bg-brand-primary border-2 border-brand-primary text-inverse hover:bg-brand-primary/80 rounded-full px-6 py-3 font-body font-bold text-[14px] transition-colors shadow-md">
        Primary
      </button>
      <button className="bg-surface-card text-body border border-default hover:border-brand-primary hover:text-body rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors">
        Secondary
      </button>
      <button className="border-2 border-status-error text-status-error hover:bg-status-error/10 rounded-full px-6 py-3 font-body font-bold text-[14px] transition-colors">
        Destructive
      </button>
    </div>
  ),
}
