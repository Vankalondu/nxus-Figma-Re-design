import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Drawer, DrawerTrigger, DrawerContent, DrawerHeader,
  DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose,
} from './drawer'
import { Button } from './button'

const meta = {
  title: 'Primitives/Drawer',
  component: Drawer,
  parameters: {
    docs: {
      description: {
        component:
          'A bottom sheet with drag-to-dismiss, built on Vaul. Distinct from `Sheet`: a drawer is ' +
          'a touch idiom, sliding up from the bottom where a thumb can reach it.\n\n' +
          'Use it for mobile actions. On desktop a `Dialog` (**P-CO14**) is usually the better ' +
          'shape, since there is no thumb to reach with.',
      },
    },
  },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild><Button variant="outline">Open actions</Button></DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Kofi Mensah</DrawerTitle>
          <DrawerDescription>Accra Lions · ST · 19</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex flex-col gap-2">
          {['Add to shortlist', 'Add to target', 'Upload highlight'].map((a) => (
            <span key={a} className="font-body font-bold text-[13px] text-foreground py-2">{a}</span>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
}
