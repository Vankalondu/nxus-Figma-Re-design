/**
 * The data behind the "All Components" index — one entry per catalogued
 * component, in the same shape MUI's all-components page uses: a small live
 * preview, the name, the rule that governs it, and a link into its story.
 *
 * Two deliberate choices:
 *
 * 1. `preview` renders the REAL component, not a picture of one. A screenshot
 *    would drift the moment a token changes; a live render cannot. Entries with
 *    no preview are the ones that only exist on interaction (dialogs, menus,
 *    drawers) or need app context to mean anything — a 200px crop of those is
 *    noise, so they get a typographic tile that links straight to the story.
 *
 * 2. `rule` cites the Law or Pattern that governs the component, so the index
 *    is navigable in both directions: from a component to its rule, and from a
 *    rule (via the ID) back to every component it constrains.
 */
import * as React from 'react'
import { Button } from '../app/components/ui/button'
import { Badge } from '../app/components/ui/badge'
import { Input } from '../app/components/ui/input'
import { Checkbox } from '../app/components/ui/checkbox'
import { Switch } from '../app/components/ui/switch'
import { Avatar, AvatarFallback } from '../app/components/ui/avatar'
import { Progress } from '../app/components/ui/progress'
import { Slider } from '../app/components/ui/slider'
import { Separator } from '../app/components/ui/separator'
import { Skeleton } from '../app/components/ui/skeleton'
import { Label } from '../app/components/ui/label'
import { Textarea } from '../app/components/ui/textarea'
import { Alert, AlertTitle, AlertDescription } from '../app/components/ui/alert'

export type Entry = {
  /** Storybook story title, verbatim — the link is derived from it. */
  title: string
  /** Short display name for the tile. */
  name: string
  /** Rule ID(s) that govern this component. */
  rule?: string
  /** One line on what it is for. */
  blurb: string
  /** Live preview, or omitted for interaction-only components. */
  preview?: React.ReactNode
  /** True for the 7 primitives non-primitive app code actually imports. */
  used?: boolean
  /** Set when the component is documented but should not be used. */
  deprecated?: boolean
}

/** `Primitives/Button` -> `primitives-button`, matching Storybook's own ids. */
export const slug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const storyHref = (title: string) => `?path=/docs/${slug(title)}--docs`

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-2">{children}</div>
)

export const NXUS_COMPONENTS: Entry[] = [
  { title: 'Components/KpiCard', name: 'KPI card', rule: 'P-CO1', blurb: 'The dashboard headline metric: chip, number, descriptor, action link.' },
  { title: 'Components/TopNav', name: 'Top nav', rule: 'P-CO7', blurb: 'Identical on every page; actions gate on their handlers, not a role prop.' },
  { title: 'Components/Sidebar', name: 'Sidebar', rule: 'P-CO8', blurb: 'Primary navigation. Active item takes a 3px primary left border.' },
  { title: 'Components/ResponsiveTabs', name: 'Responsive tabs', rule: 'P-CO2', blurb: 'The pill strip with count badges; collapses to a select on mobile.' },
  { title: 'Components/Status pills', name: 'Status pills', rule: 'P-CO5', blurb: 'Tinted state pills. Text comes from the /800 step, not the base — that is the AA fix.' },
  { title: 'Components/CardView', name: 'Card view', rule: 'P-CO3', blurb: 'The player card grid, the alternative to the dense table.' },
  { title: 'Components/PlayerSearch', name: 'Player search', rule: 'P-CO12', blurb: 'Live search off the top nav, with keyboard navigation.' },
  { title: 'Components/VideoTrackerGrid', name: 'Video tracker', rule: 'P-CO9', blurb: 'The coverage spreadsheet. Cyan marks uploaded — the fourth state (L-C3).' },
  { title: 'Components/TasksTab', name: 'Tasks tab', rule: 'P-CO17', blurb: 'Shared across all four dashboards: five status tabs, search, pagination.' },
  { title: 'Components/AnalyticsTab', name: 'Analytics tab', rule: 'P-CO10', blurb: 'Charts and leaderboards. Chart colour is data, so L-G2 applies.' },
  { title: 'Components/ReportsTab', name: 'Reports tab', rule: 'P-CO10', blurb: 'Scouting reports list with filters.' },
  { title: 'Components/EditColumnsModal', name: 'Edit columns', rule: 'P-CO17', blurb: 'Column visibility and order for the player tables.' },
  { title: 'Components/EditFormBlueprintModal', name: 'Form blueprint', rule: 'P-CO13', blurb: 'Builds the report form: field types, ordering, validation.' },
  { title: 'Components/UploadVideoModal', name: 'Upload video', rule: 'P-CO15', blurb: 'Per-type upload rules — highlight takes a link, packages are file-only.' },
  { title: 'Components/PlayerVideoWorkspace', name: 'Video workspace', rule: 'P-CO11', blurb: 'Player footage: clips, full matches, the review surface.' },
  { title: 'Components/ChampionPodium', name: 'Champion podium', rule: 'L-G2', blurb: 'Leaderboard top three. Medal colours are data, not palette (L-G2).' },
  { title: 'Components/InlineSel', name: 'Inline select', rule: 'P-CO4', blurb: 'The compact in-table select used across the dense views.' },
]

export const PRIMITIVES: Entry[] = [
  {
    title: 'Primitives/Button', name: 'Button', used: true, rule: 'P-CO1', blurb: 'Every variant binds tokens; primary is bg-brand-primary.',
    preview: <Row><Button size="sm">Primary</Button><Button size="sm" variant="outline">Outline</Button></Row>,
  },
  {
    title: 'Primitives/Badge', name: 'Badge', rule: 'P-CO5', blurb: 'Small count and status markers.',
    preview: <Row><Badge>Default</Badge><Badge variant="outline">Outline</Badge></Row>,
  },
  {
    title: 'Primitives/Input', name: 'Input', used: true, rule: 'P-CO13', blurb: 'Field styling; placeholder takes --text-placeholder.',
    preview: <Input placeholder="Find a player" className="max-w-[190px]" />,
  },
  {
    title: 'Primitives/Textarea', name: 'Textarea', rule: 'P-CO13', blurb: 'Multi-line notes and match observations.',
    preview: <Textarea rows={2} placeholder="Match observations…" className="max-w-[190px]" />,
  },
  {
    title: 'Primitives/Checkbox', name: 'Checkbox', used: true, rule: 'P-CO13', blurb: 'Row selection and multi-select filters.',
    preview: <Row><Checkbox defaultChecked /><Checkbox /><span className="type-caption text-muted">Select</span></Row>,
  },
  {
    title: 'Primitives/Switch', name: 'Switch', used: true, rule: 'P-CO13', blurb: 'Binary settings, including the theme toggle.',
    preview: <Row><Switch defaultChecked /><Switch /></Row>,
  },
  {
    title: 'Primitives/Label', name: 'Label', rule: 'R-TY3', blurb: 'Field labels — uppercase micro, --text-muted.',
    preview: <Label className="font-heading font-bold type-micro uppercase tracking-widest text-muted">Deadline</Label>,
  },
  {
    title: 'Primitives/Avatar', name: 'Avatar', rule: 'P-CO6', blurb: 'Initials chips — players have no photos, so initials are the identity.',
    preview: <Row><Avatar><AvatarFallback>KM</AvatarFallback></Avatar><Avatar><AvatarFallback>AO</AvatarFallback></Avatar></Row>,
  },
  {
    title: 'Primitives/Progress', name: 'Progress', rule: 'P-CO10', blurb: 'Coverage and completion bars.',
    preview: <Progress value={68} className="max-w-[190px]" />,
  },
  {
    title: 'Primitives/Slider', name: 'Slider', rule: 'P-CO4', blurb: 'Range filters — age, minutes, rating.',
    preview: <Slider defaultValue={[40]} max={100} className="max-w-[190px]" />,
  },
  {
    title: 'Primitives/Separator', name: 'Separator', rule: 'L-C7', blurb: 'Hairline division; binds --border-default.',
    preview: <div className="w-full max-w-[190px]"><Separator /></div>,
  },
  {
    title: 'Primitives/Skeleton', name: 'Skeleton', rule: 'L-M1', blurb: 'Loading placeholder at the shape of the content it replaces.',
    preview: <div className="flex flex-col gap-2 w-full max-w-[190px]"><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>,
  },
  {
    title: 'Primitives/Alert', name: 'Alert', rule: 'L-C3', blurb: 'Inline messages; status colour carries the meaning.',
    preview: (
      <Alert className="max-w-[220px]">
        <AlertTitle className="type-caption">Footage missing</AlertTitle>
        <AlertDescription className="type-micro">Two matches unassigned.</AlertDescription>
      </Alert>
    ),
  },
  { title: 'Primitives/Card', name: 'Card', rule: 'P-CO3', blurb: 'The surface everything sits on: bg-surface-card, rounded-[32px], --shadow-lg.' },
  { title: 'Primitives/Table', name: 'Table', rule: 'P-CO9', blurb: 'The densest surface in NXUS — where §0 density is won or lost.' },
  { title: 'Primitives/Tabs', name: 'Tabs', rule: 'P-CO2', blurb: 'Radix tabs. Page-level tabbing uses ResponsiveTabs instead.' },
  { title: 'Primitives/Accordion', name: 'Accordion', rule: 'L-M1', blurb: 'Collapsible sections.' },
  { title: 'Primitives/Collapsible', name: 'Collapsible', rule: 'L-M1', blurb: 'The primitive under Accordion.' },
  { title: 'Primitives/Dialog', name: 'Dialog', rule: 'P-CO14', blurb: 'Modal. Scrim is --surface-overlay at opacity, never black.' },
  { title: 'Primitives/AlertDialog', name: 'Alert dialog', rule: 'P-CO14', blurb: 'Destructive confirmation.' },
  { title: 'Primitives/Sheet', name: 'Sheet', rule: 'P-CO14', blurb: 'Edge panel; the mobile navigation drawer.' },
  { title: 'Primitives/Drawer', name: 'Drawer', rule: 'P-CO14', blurb: 'Bottom sheet on touch.' },
  { title: 'Primitives/Popover', name: 'Popover', rule: 'P-CO4', blurb: 'Anchored panel for filters and pickers.' },
  { title: 'Primitives/HoverCard', name: 'Hover card', rule: 'P-CO4', blurb: 'Preview on hover; never the only route to information.' },
  { title: 'Primitives/Tooltip', name: 'Tooltip', used: true, rule: 'P-CO4', blurb: 'Carries the labels density will not fit — never essential content.' },
  { title: 'Primitives/DropdownMenu', name: 'Dropdown menu', rule: 'P-CO4', blurb: 'Row kebabs and action menus.' },
  { title: 'Primitives/ContextMenu', name: 'Context menu', rule: 'P-CO9', blurb: 'Right-click on a table column: insert, delete, rename.' },
  { title: 'Primitives/Menubar', name: 'Menubar', rule: 'P-CO4', blurb: 'Horizontal menu bar. Unused in NXUS today.' },
  { title: 'Primitives/NavigationMenu', name: 'Navigation menu', rule: 'P-L2', blurb: 'Radix nav. NXUS navigates by sidebar plus tabs.' },
  { title: 'Primitives/Command', name: 'Command', rule: 'P-CO12', blurb: 'Command palette; the pattern behind player search.' },
  { title: 'Primitives/Select', name: 'Select', used: true, rule: 'P-CO4', blurb: 'The standard select; InlineSel is the dense variant.' },
  { title: 'Primitives/RadioGroup', name: 'Radio group', rule: 'P-CO13', blurb: 'Single choice from a small set.' },
  { title: 'Primitives/Toggle', name: 'Toggle', rule: 'P-CO4', blurb: 'A single pressed/unpressed control.' },
  { title: 'Primitives/ToggleGroup', name: 'Toggle group', rule: 'P-CO2', blurb: 'Segmented control — the view switchers.' },
  { title: 'Primitives/Calendar', name: 'Calendar', rule: 'P-CO16', blurb: 'Date picker. NXUS ships a bespoke one for Scope Settings.' },
  { title: 'Primitives/Form', name: 'Form', rule: 'P-CO13', blurb: 'react-hook-form bindings and validation display.' },
  { title: 'Primitives/InputOTP', name: 'Input OTP', rule: 'P-CO13', blurb: 'One-time code entry. Unused in NXUS today.' },
  { title: 'Primitives/Pagination', name: 'Pagination', rule: 'P-CO9', blurb: 'Table paging, 10 per page, top and bottom.' },
  { title: 'Primitives/Breadcrumb', name: 'Breadcrumb', rule: 'P-L2', blurb: 'Ancestry trail. Unused — the sidebar carries location.' },
  { title: 'Primitives/ScrollArea', name: 'Scroll area', rule: 'P-CO9', blurb: 'Styled overflow; the tables scroll sideways inside it.' },
  { title: 'Primitives/Resizable', name: 'Resizable', rule: 'P-CO11', blurb: 'Split panes — footage beside the player list.' },
  { title: 'Primitives/Carousel', name: 'Carousel', rule: 'P-CO11', blurb: 'Horizontal clip strip.' },
  { title: 'Primitives/AspectRatio', name: 'Aspect ratio', rule: 'P-CO11', blurb: 'Holds 16:9 for footage thumbnails.' },
  { title: 'Primitives/Chart', name: 'Chart', rule: 'L-G2', blurb: 'Recharts wrapper. Series colour is data — the one L-C1 exception lives here.' },
  { title: 'Primitives/Toaster (sonner)', name: 'Toaster', used: true, rule: 'L-M1', blurb: 'Transient confirmations.' },
  {
    title: 'Primitives/Sidebar (stale duplicate)', name: 'Sidebar (stale)', rule: 'P-CO8', deprecated: true,
    blurb: 'An older copy, unreachable from the router. Documented so nobody imports it — use components/Sidebar.tsx.',
  },
]

export const ALL = [...NXUS_COMPONENTS, ...PRIMITIVES]
