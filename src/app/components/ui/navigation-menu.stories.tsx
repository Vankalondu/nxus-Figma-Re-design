import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
} from './navigation-menu'

const meta = {
  title: 'Primitives/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    docs: {
      description: {
        component:
          'Horizontal navigation with dropdown panels — the shape marketing sites use. ' +
          '**Not currently used in NXUS**: the app navigates by sidebar plus tabs (**P-L2**), ' +
          'and the top nav holds search and actions rather than links (**P-CO7**).\n\n' +
          'Documented for completeness. Adding it would introduce a third navigation model, so ' +
          'it should be a deliberate decision rather than convenience.',
      },
    },
  },
} satisfies Meta<typeof NavigationMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Players</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 w-[260px] flex flex-col gap-2">
              {['Database', 'Long List', 'Short List', 'Target List'].map((l) => (
                <NavigationMenuLink key={l} className="font-body font-bold text-[12px]">{l}</NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Matches</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4 w-[260px] flex flex-col gap-2">
              <NavigationMenuLink className="font-body font-bold text-[12px]">Fixtures</NavigationMenuLink>
              <NavigationMenuLink className="font-body font-bold text-[12px]">Footage</NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
