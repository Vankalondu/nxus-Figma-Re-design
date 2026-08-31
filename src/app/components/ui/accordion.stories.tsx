import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion'

const meta = {
  title: 'Primitives/Accordion',
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component:
          'Collapsible sections, one or many open at a time. Useful where a scout needs an ' +
          'overview first and detail on demand — the "recently reviewed" list in the approval ' +
          'queue works this way.\n\n' +
          'Weigh it against **§0 density**: collapsing content saves space but hides it, and a ' +
          'scout who has to open four panels to compare four players is worse off than one ' +
          'reading a table.',
      },
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-[480px]">
      <Accordion type="single" collapsible defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>Recently reviewed</AccordionTrigger>
          <AccordionContent className="font-body text-[12px] text-muted-foreground">
            Six packages approved since Monday.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Redo requests</AccordionTrigger>
          <AccordionContent className="font-body text-[12px] text-muted-foreground">
            Two sent back to editors, each with a High-priority task attached.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const Multiple: Story = {
  parameters: { docs: { description: { story: '`type="multiple"` lets several stay open for comparison.' } } },
  render: () => (
    <div className="w-[480px]">
      <Accordion type="multiple" defaultValue={['a', 'b']}>
        <AccordionItem value="a">
          <AccordionTrigger>Long List</AccordionTrigger>
          <AccordionContent className="font-body text-[12px] text-muted-foreground">60 players.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Short List</AccordionTrigger>
          <AccordionContent className="font-body text-[12px] text-muted-foreground">14 players.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
}
