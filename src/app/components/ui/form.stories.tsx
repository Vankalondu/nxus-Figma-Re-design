import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import {
  Form, FormField, FormItem, FormLabel,
  FormControl, FormDescription, FormMessage,
} from './form'
import { Input } from './input'
import { Button } from './button'

const meta = {
  title: 'Primitives/Form',
  component: Form,
  parameters: {
    docs: {
      description: {
        component:
          'Form scaffolding over `react-hook-form`. `FormField` wires a control to its label, ' +
          'description and error message, and links them with the right `aria-describedby` — the ' +
          'accessibility plumbing that is easy to skip when hand-rolling a form.\n\n' +
          'Error text uses `text-destructive` (**R-TY3**). Under **L-C3** that red means a real ' +
          'problem, so do not borrow it for hints or character counts.\n\n' +
          'Field styling follows **P-CO13**; labels are `.text-micro`, uppercase and tracked.',
      },
    },
  },
} satisfies Meta<typeof Form>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const form = useForm({ defaultValues: { name: '', team: '' } })
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => {})}
          className="w-[360px] flex flex-col gap-5"
        >
          <FormField
            control={form.control}
            name="name"
            rules={{ required: 'A player name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  Player name
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Kofi Mensah" {...field} />
                </FormControl>
                <FormDescription>As it appears on the team sheet.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="team"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  Team
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Accra Lions" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add player</Button>
        </form>
      </Form>
    )
  },
}

export const WithValidationError: Story = {
  parameters: {
    docs: { description: { story: 'Submit with the field empty to see the error state and its `aria-describedby` wiring.' } },
  },
  render: () => {
    const form = useForm({ defaultValues: { name: '' }, mode: 'onSubmit' })
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})} className="w-[360px] flex flex-col gap-5">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: 'A player name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  Player name
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Kofi Mensah" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit empty</Button>
        </form>
      </Form>
    )
  },
}
