# Qaza Platform — Unified Design System Guidelines
> Version 2.0
> This is the single source of truth for every Figma Make generation.
> Read this file completely before making any change to any file.
> Every rule here applies to every page, every component, and every
> future generation unless a prompt explicitly overrides a specific rule.

---

## 1. What Qaza Is

Qaza is a Bloomberg-style professional football scouting terminal.
It is used by professional scouts who spend hours inside the system daily.
Every design decision must serve one of these three values:

- **Density** — show as much meaningful data as possible without clutter
- **Clarity** — every element has a clear purpose and clear hierarchy
- **Authority** — the interface feels premium, professional and trustworthy

The aesthetic rule: a visually appealing interface makes users want to
use the system. Functionality comes first, aesthetics second — but
aesthetics are never ignored. When two solutions are equally functional,
always choose the more visually refined one.

---

## 2. Colour System

### The 60/30/10 Rule
Three colour roles define the entire platform. This is a guiding principle,
not a rigid pixel ratio. Aesthetics can bend the rule when visually
justified — but every deviation must be intentional and purposeful.

| Role | Name | Light Mode | Dark Mode | Token | Usage |
|---|---|---|---|---|---|
| 60% | Background | `#D2E7FA` | `#061B2E` | `bg-background` | Page backgrounds, layout canvas |
| 30% | Surface | `#F4FAFF` | `#0A2D4C` | `bg-card` | Cards, KPIs, panels, modals, dropdowns, sidebar |
| 10% | Primary | `#1E88E5` | `#449CE9` | `bg-primary` | Buttons, CTAs, active tabs, structural headers, filter bars, modal headers |

### Functional status colours
Used only to communicate status. Never used for decoration or branding.

| Name | Hex | Strictly used for |
|---|---|---|
| Scout Green | `#22C55E` | Submitted, scouted dot, approved, complete, success status |
| Scout Red | `#E05C4B` | Late, flagged, unscouted dot, destructive actions, unsuccessful status |
| Scout Amber | `#E8A838` | Warning, pending, in-progress, monitor status |
| Muted Light | `#304151` | Secondary labels, helper text in light mode |
| Muted Dark | `#AFC1D0` | Secondary labels, helper text in dark mode |

### The full palette scales
All colours derive from three scales. Use these for any custom tints or gradients.

**Primary Blue Scale:**
```
#D2E7FA → #B4D7F6 → #8FC4F2 → #69B0EE → #449CE9 → #1E88E5 → #1971BF → #145B99 → #0F4473 → #0A2D4C → #061B2E
 blue-50   blue-100   blue-200   blue-300   blue-400   blue-500   blue-600   blue-700   blue-800   blue-900   blue-950
```

**Dark/Navy Scale (text in light mode):**
```
#CDD1D5 → #ACB3B9 → #838D97 → #596774 → #304151 → #061B2E → #051726 → #04121F → #030E17 → #02090F → #010509
 navy-50   navy-100   navy-200   navy-300   navy-400   navy-500   navy-600   navy-700   navy-800   navy-900   navy-950
```

**Light Scale (text in dark mode):**
```
#F6FAFE → #F0F7FD → #E9F3FD → #E1EFFC → #DAEBFB → #D2E7FA → #AFC1D0 → #8C9AA7 → #69747D → #464D53 → #2A2E32
light-50   light-100  light-200  light-300  light-400  light-500  light-600  light-700  light-800  light-900  light-950
```

### Complete semantic token map

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--background` | `#D2E7FA` | `#061B2E` | Page backgrounds |
| `--foreground` | `#061B2E` | `#D2E7FA` | Primary text |
| `--card` | `#F4FAFF` | `#0A2D4C` | Card surfaces |
| `--card-foreground` | `#061B2E` | `#D2E7FA` | Text on cards |
| `--primary` | `#1E88E5` | `#449CE9` | Accent, CTAs |
| `--primary-foreground` | `#F4FAFF` | `#061B2E` | Text on primary |
| `--secondary` | `#E8F3FC` | `#0F4473` | Secondary surfaces |
| `--muted` | `#E8F3FC` | `#0F4473` | Muted backgrounds |
| `--muted-foreground` | `#304151` | `#AFC1D0` | Secondary text, labels |
| `--accent` | `#D2E7FA` | `#0F4473` | Tinted backgrounds |
| `--border` | `#B4D7F6` | `#145B99` | All borders, dividers |
| `--ring` | `#1E88E5` | `#449CE9` | Focus rings |
| `--destructive` | `#E05C4B` | `#E05C4B` | Error states, delete actions |
| `--chalk` | `#D2E7FA` | `#D2E7FA` | Always-light text on primary |

### What is absolutely forbidden
- `#FFFFFF` (pure white) anywhere — use `#F4FAFF`, `#F6FAFE`, or `#D2E7FA`
- `#000000` (pure black) anywhere — use `#061B2E`, `#030E17`, or `#010509`
- Any `gray-*`, `slate-*`, `zinc-*` Tailwind colour classes — use semantic tokens
- Any colour outside this system for any reason
- No gradients unless explicitly specified in a prompt

### The #061B2E rule — non-negotiable
Dark navy `#061B2E` is used EXCLUSIVELY as the dark mode background.
It must never appear as buttons, table headers, filter bars, modal
headers, card surfaces, or logo backgrounds. Use `bg-primary` for all
of those. This is the most common palette violation.

### The one accent card rule
In every dashboard below-KPI section, the right sidebar column must
contain exactly one `bg-primary` accent card. This is the only place
where a card uses primary blue as its background. All other cards use
`bg-card`. The accent card always uses `text-chalk` for all text and
`border-white/10` for internal borders.

---

## 3. Light Mode and Dark Mode

### Default mode
**Light mode is the default.** Users land on light mode on first login.
Dark mode is fully built and available as a toggle on day one.

### Theme persistence
Theme preference saves to the user's profile and persists across
all sessions. It never resets on login.

### Light mode colour application
| Element | Value |
|---|---|
| Page background | `#D2E7FA` |
| Card surface | `#F4FAFF` |
| Card border | `#B4D7F6` |
| Table rows | `#F4FAFF` alternating `#D2E7FA` (accent/30) |
| Table group headers | `#1E88E5` with `#D2E7FA` text — same in both modes |
| Sidebar surface | `#F4FAFF` |
| Primary text | `#061B2E` |
| Muted text | `#304151` |
| Primary accent | `#1E88E5` |

### Dark mode colour application
| Element | Value |
|---|---|
| Page background | `#061B2E` |
| Card surface | `#0A2D4C` |
| Card border | `#145B99` |
| Table rows | `#0A2D4C` alternating `#0F4473` |
| Table group headers | `#449CE9` with `#D2E7FA` text — structural anchor |
| Sidebar surface | `#030E17` |
| Primary text | `#D2E7FA` |
| Muted text | `#AFC1D0` |
| Primary accent | `#449CE9` |

### Elements that never flip
- Text on `bg-primary` always uses `text-chalk` (`#D2E7FA`) — light in both modes
- Semantic status colours stay constant: green (`#22C55E`), red (`#E05C4B`), amber (`#E8A838`)
- Image overlays use fixed dark gradients regardless of mode
- The accent card in the sidebar always has light text

### Theme toggle location
The theme toggle lives in the sidebar near the bottom.
It is present on every page and every role.

---

## 4. Typography System

Two typefaces only. No other fonts permitted under any circumstance.

| Font | Role | Class |
|---|---|---|
| **Figtree** | Headings, page titles, KPI numbers, column labels, group headers, tab text, uppercase labels | `font-heading` |
| **Plus Jakarta Sans** | Body text, table data, descriptions, button labels, form fields, pills, badges | `font-body` |
| **JetBrains Mono** | Statistical columns and numerical table values only | `font-mono` |

### Rejected fonts — do not use
- Manrope — previously considered, replaced by Figtree
- Plus Jakarta Sans was never used for headings, only body

### Fonts — TWO ONLY
- **Figtree** (`font-heading`) — all headings, titles, and uppercase labels.
- **Plus Jakarta Sans** (`font-body`) — all body text AND all numbers. `.font-mono` is aliased to Plus Jakarta with `tabular-nums` for aligned numeric columns.
- **JetBrains Mono and Manrope are retired — never use them.** No third font, ever.

### Type scale — STANDARD RAMP (anchor h1 = 32)
Titles use ONE weight — **semibold (600)** — so hierarchy comes from SIZE, not weight. Only KPI stat numbers are heavier (extrabold). Only sizes in this ramp may be used (all even): **44, 36, 32, 24, 20, 16, 14, 12, 10** (+ 15 for the hero subtitle only).

| Element | Size | Weight | Font |
|---|---|---|---|
| KPI large number | 44px | 800 ExtraBold | Figtree |
| KPI stat (secondary) | 36px | 800 ExtraBold | Figtree |
| Page hero title (h1) | 32px (24 mobile) | 600 Semibold | Figtree |
| Card / major section title (h2) | 24px | 600 Semibold | Figtree |
| Section / widget title (h3) | 20px | 600 Semibold | Figtree |
| Sub-heading (h4) | 16px | 600 Semibold | Figtree |
| Page subtitle (under h1) | 15px | 500 Medium | Plus Jakarta Sans |
| Body text / button text | 14px | 700 Bold (500 for prose) | Plus Jakarta Sans |
| Small / secondary / table data | 12px | 700 Bold | Plus Jakarta Sans |
| Column labels / micro labels (pills) | 10px | 700 Bold uppercase tracked | Figtree |
| Stats / numbers | 14px | 700 Bold + tabular-nums | Plus Jakarta Sans (`font-mono`) |

**Forbidden sizes** (fold to nearest ramp step): 8, 9, 11, 13, 17, 18, 22, 28, 30, 40, 42, 48, 56. **Forbidden on titles:** `font-black` / `font-extrabold` (those weights are for KPI numbers only).

### Text colour assignments
| Context | Token |
|---|---|
| Primary headings, names, values | `text-foreground` |
| Secondary labels, descriptions, metadata | `text-muted-foreground` |
| Text on primary blue surfaces | `text-chalk` or `text-primary-foreground` |
| Interactive/link text | `text-primary` |
| Destructive/error text | `text-destructive` (`#E05C4B`) |
| Warning text | `text-[#E8A838]` |
| Success text | `text-[#22C55E]` |

---

## 5. Page Header Standard

Every single page uses this exact header pattern without exception.

### Structure
```
[Title line: First word + Primary icon circle + remaining title]
[Subtitle line — 18px Plus Jakarta Sans Medium muted]
[Tab row — only on pages that have tabs]
```

### The Primary icon circle
Every page title has a relevant icon inside a Primary Blue filled
circle placed between the first word and the rest of the title.

Circle: `w-14 h-14 rounded-full bg-primary flex items-center
         justify-center shadow-sm shrink-0`
Icon: `text-chalk` at `size={28}`

| Page / View | Icon | Title format |
|---|---|---|
| Dashboard | Sun | Welcome ☀️ [First Name] |
| Players — Country/Head | Users | Qaza 👥 Players |
| Players — Senior/Lead Database | Database | Players 🗄 Database |
| Long List | List | Long 📋 List |
| Short List | Star | Short ⭐ List |
| Target List | Crosshair | Target 🎯 List |
| Scope Settings | Target | Scope 🎯 Settings |
| Matches | Calendar | Competitions 📅 |
| Admin | Settings | Admin ⚙️ Panel |
| Player Profile | User | Player 👤 Profile |

### Subtitle rule
Every page has a subtitle directly below the title.
`font-body font-medium text-[18px] text-muted-foreground mt-4`

| View | Subtitle |
|---|---|
| Dashboard | Rotating fun football subtitle — see Section 12 |
| Players in Scope | "All players within your active scouting scope." |
| Top 10 | "Your current top ten performance and prospect selections." |
| Reserve List | "Players held in reserve for future consideration." |
| Combined Top 10 | "Track regional scout submissions and pipeline status." |
| Database | "All players within your active scouting scope." |
| Long List | "Players flagged for closer evaluation." |
| Short List | "Prioritised candidates for your current cycle." |
| Target List | "Players actively being pursued for acquisition." |
| Scope Settings | "Configure the parameters that define your active scouting scope." |
| Reports | "Scouting reports filed by the team." |
| Matches | "Track fixtures and review match footage for scouted players." |
| Admin | "Manage platform data across bodies, competitions, teams, players, and transfers." |

---

## 6. Spacing System

**Strict 4-point grid.** Every spacing value MUST be a multiple of 4px. 2px (`*-0.5`) is allowed ONLY for hairlines. **6px (`*-1.5`) and 10px (`*-2.5`) are forbidden** — round to the nearest 4-step (6→8, 10→8, 14→16). Any odd value is forbidden.

### Approved spacing scale
| px | Tailwind |
|---|---|
| 2px (hairline only) | `p-0.5` `gap-0.5` |
| 4px | `p-1` `m-1` `gap-1` |
| 8px | `p-2` `m-2` `gap-2` |
| 12px | `p-3` `m-3` `gap-3` |
| 16px | `p-4` `m-4` `gap-4` |
| 20px | `p-5` `m-5` `gap-5` |
| 24px | `p-6` `m-6` `gap-6` |
| 32px | `p-8` `m-8` `gap-8` |
| 40px | `p-10` `m-10` `gap-10` |
| 48px | `p-12` `m-12` `gap-12` |

### Page layout spacing rules
| Element | Value |
|---|---|
| Page horizontal padding — standard pages | `px-16` (64px) |
| Page horizontal padding — full-width table pages | `px-8` (32px) |
| KPI card grid gap | `gap-6` (24px) |
| Below-KPI section gap | `gap-6` (24px) |
| Large card internal padding | `p-8` (32px) |
| Standard card internal padding | `p-6` (24px) |
| Sidebar card padding | `p-5` (20px) |
| Table cell padding | `px-2 py-3` (8px / 12px) |
| Modal internal padding | `p-8` (32px) |
| Tab pills gap | `gap-2` (8px) |
| Button padding (pills) | `px-6 py-2` (24px / 8px) |
| Button padding (CTAs) | `px-6 py-3` (24px / 12px) |

---

## 7. Elevation & Shadow System

Shadows use navy-tinted rgba in light mode and pure black in dark mode.

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(6,27,46,0.05)` | `0 1px 2px rgba(0,0,0,0.20)` | Subtle lift |
| `--shadow-sm` | `0 2px 8px rgba(6,27,46,0.06)` | `0 2px 8px rgba(0,0,0,0.25)` | Buttons, small cards |
| `--shadow-md` | `0 4px 16px rgba(6,27,46,0.08)` | `0 4px 16px rgba(0,0,0,0.30)` | Dropdowns, popovers |
| `--shadow-lg` | `0 8px 30px rgba(6,27,46,0.08)` | `0 8px 30px rgba(0,0,0,0.30)` | KPI cards, content cards |
| `--shadow-xl` | `0 12px 40px rgba(6,27,46,0.10)` | `0 12px 40px rgba(0,0,0,0.35)` | Hover state on cards |
| `--shadow-2xl` | `0 20px 50px rgba(6,27,46,0.14)` | `0 20px 50px rgba(0,0,0,0.40)` | Modals, drawers |
| `--shadow-sidebar` | `4px 0 24px rgba(6,27,46,0.08)` | `4px 0 24px rgba(0,0,0,0.30)` | Sidebar panel |

When to use:
- **No shadow**: Table rows, list items, inline elements
- **shadow-sm**: Active tab pills, small interactive elements
- **shadow-lg**: All cards (KPI, content, sidebar), default elevation
- **shadow-xl**: Card hover state (`hover:shadow-xl`)
- **shadow-2xl**: Modals, drawers, dropdown portals

---

## 8. Border Radius System

| Element | Radius | Tailwind |
|---|---|---|
| KPI cards | 40px | `rounded-[40px]` |
| Dashboard content cards | 40px | `rounded-[40px]` |
| Sidebar stacked cards | 40px | `rounded-[40px]` |
| Report Summary cards | 32px | `rounded-[32px]` |
| Table container | 32px | `rounded-[32px]` |
| Signed List table | 32px | `rounded-[32px]` |
| Modal/dialog | 32px | `rounded-[32px]` |
| Form/settings cards | 20px | `rounded-[20px]` |
| Standard tables | 20px | `rounded-[20px]` |
| Report cards (small) | 20px | `rounded-[20px]` |
| Dropdown menus | 12px | `rounded-xl` |
| Input fields | 12px | `rounded-xl` |
| Icon squares | 16px | `rounded-[16px]` |
| All buttons | pill | `rounded-full` |
| Badges and tab pills | pill | `rounded-full` |
| Avatar circles | pill | `rounded-full` |
| Icon circles | pill | `rounded-full` |
| Position badges | 4px | `rounded` |

---

## 9. Component Specifications

### 9.1 Buttons
Three variants only. No other button styles anywhere in the application.

**Primary — filled:**
```
bg-primary border-2 border-primary text-primary-foreground
hover:bg-primary/80 rounded-full px-6 py-3
font-body font-bold text-[14px] transition-colors shadow-md
```

**Secondary — outline:**
```
bg-card text-muted-foreground border border-border
hover:border-primary hover:text-foreground
rounded-full px-6 py-2
font-body font-bold text-[14px] transition-colors
```

**Destructive — red outline:**
```
border-2 border-destructive text-destructive
hover:bg-destructive/10 rounded-full px-6 py-3
font-body font-bold text-[14px] transition-colors
```

### 9.2 Tab navigation pills
One consistent tab component used on every page with tabs.

**Active tab:**
```
bg-primary text-primary-foreground border-primary shadow-sm
rounded-full px-6 py-2 font-body font-bold text-[14px]
```

**Inactive tab:**
```
bg-card text-muted-foreground border-border
hover:border-primary hover:text-foreground
rounded-full px-6 py-2 font-body font-bold text-[14px] transition-colors
```

**Tab row container:**
`flex items-center gap-2`

### 9.3 Cards
**Standard card — light:**
```
bg-card rounded-[40px] border border-border
shadow-[var(--shadow-lg)]
hover:-translate-y-1 hover:shadow-xl transition-all
```

**Accent card — one per dashboard section:**
```
bg-primary rounded-[40px]
Text: text-chalk
Internal borders: border-white/10
Internal backgrounds: bg-white/10
```

### 9.4 Top navigation bar
Identical on every page. Never varies between pages.
```
sticky top-6 z-50
flex items-center justify-between
bg-card/90 backdrop-blur-xl
border border-border
p-2 pl-6 rounded-[24px]
shadow-[var(--shadow-lg)]
```

Contents left to right:
1. Search input — transparent background, placeholder "Search..."
2. Role indicator pill or Senior/Head toggle
3. Notification bell with unread count badge
4. This Week button — secondary outline
5. Add Report button — secondary outline
6. Add Player button — primary filled
7. Avatar — `w-12 h-12 rounded-full`

### 9.5 Sidebar
Surface colour: `bg-card` in light mode, `bg-[#030E17]` in dark mode.

**Active nav item:**
`bg-primary/10 text-primary border-l-[3px] border-primary`

**Inactive nav item:**
`text-muted-foreground hover:text-foreground hover:bg-accent transition-colors`

**Theme toggle:** Positioned near the bottom of the sidebar.

### 9.6 Data tables

**Table container:**
`w-full max-w-none bg-card rounded-[32px] shadow-[var(--shadow-lg)] border border-border overflow-hidden`

**Column group header row (Row 1 — BIO DATA, GAME STATS, VIDEOS etc):**
```
bg-primary text-primary-foreground
font-heading font-bold text-[10px] uppercase tracking-widest
px-4 py-3 text-center
```
This is the 10% colour used as a structural anchor. Identical in both modes.

**Column sub-header row (Row 2):**
```
bg-card text-muted-foreground
font-heading font-bold text-[11px] uppercase tracking-widest
px-3 py-3
```

**Data rows:**
```
border-b border-border/40 hover:bg-accent transition-colors
py-3 px-2 font-body text-[12px] font-bold
```

**Position group header rows (STRIKERS, MIDFIELDERS etc):**
```
bg-primary text-primary-foreground
font-heading font-bold text-[10px] uppercase tracking-widest
px-4 py-2
```
Player count in parentheses: `STRIKERS (9)`

**Year separator rows:**
```
bg-card text-muted-foreground
font-heading font-bold text-[10px] uppercase tracking-widest
px-4 py-2
```
Show year number only — e.g. `2009`. No YOB prefix.

**Alternating row shading:**
Rows alternate between `bg-card` and `bg-accent/30`.
Shading resets at every position group header — the first player
row after a position header always starts on `bg-card`.

**Full width rule:**
All table pages use `w-full max-w-none` with no max-width constraint.
Page horizontal padding is `px-8` (32px) on table pages.

### 9.7 Identity cluster (frozen left column)
The identity cluster is the sticky left column in every player table.

```
[Initials circle]
w-8 h-8 rounded-full bg-primary text-chalk
font-body font-black text-[11px]

[Player name]
font-body font-bold text-[13px] text-foreground hover:underline cursor-pointer
onClick → navigate to player profile

[Age] text-[12px] text-muted-foreground

[Scout dot]
w-2 h-2 rounded-full
Green #22C55E = scouted
Red #E05C4B = unscouted

[Flag circle]
w-5 h-5 rounded-full overflow-hidden border border-border
```

### 9.8 Videos cluster
Present on ALL table views across ALL scout tiers. Never removed.

```
[F{n} badge — match footage count]
bg-primary/20 text-foreground font-bold
px-2 py-0.5 rounded text-[12px]

[H{n} badge — highlight count]
bg-primary/20 text-foreground font-bold
px-2 py-0.5 rounded text-[12px]
```

### 9.9 Split button (action column — ActionDropdown)
Used in the Action column of all tables.
Single pill container divided by 1px vertical divider.
Left zone: current action icon — executes action immediately on click.
Right zone: chevron — opens dropdown on click.

```
Primary side: w-7 h-7 rounded-l-lg bg-accent text-foreground border border-r-0 border-border
Chevron side: w-5 h-7 rounded-r-lg bg-accent border border-border text-foreground
Hover: hover:bg-primary/80 hover:text-primary-foreground
```

**Behaviour:** Selecting from the dropdown only changes the primary icon
— does NOT execute the action. The user clicks the primary button to
execute. This gives the user control over which action sits on the surface.

**Dropdown portal:**
```
bg-card rounded-[12px] border border-border shadow-[var(--shadow-2xl)]
Renders via createPortal to document.body
position: fixed, z-index: 9999
Positioned via getBoundingClientRect()
Closes on: option select, outside click, table scroll
```

### 9.10 KPI stat cards
```
Container:
bg-card rounded-[40px] border border-border p-8
shadow-[var(--shadow-lg)] h-[220px]

KPI number:
font-heading font-extrabold text-[56px] tracking-tight text-foreground
Animates count-up from 0 on page load (600ms ease-out)

Label:
font-heading font-bold text-[10px] uppercase tracking-widest
text-muted-foreground

Dot indicators:
Filled: w-5 h-5 rounded-full bg-primary
Empty: w-5 h-5 rounded-full border-2 border-dashed border-border
Container: flex items-center gap-1.5 mt-4

Progress bar variant:
Track: flex-1 h-2 bg-border rounded-full overflow-hidden
Fill: h-full bg-primary rounded-full
```

**Image KPI card (one per dashboard):**
Same runners image across all dashboards.
Overlay: `bg-gradient-to-t from-black/70 via-black/30 to-transparent`
CTA button: `bg-primary text-chalk rounded-full`

### 9.11 Form inputs
Applied to every input field across every page.
```
bg-card border border-border rounded-xl
px-4 py-2 text-[14px] font-bold text-foreground
focus:outline-none focus:ring-2 focus:ring-ring/20
focus:border-ring transition-all
placeholder:text-muted-foreground
```

Field label:
`font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-2`

### 9.12 Status pills (Signed List)
Soft translucent backgrounds — never heavy solid fills.

```
Success:    bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20
Unsuccessful: bg-[#E05C4B]/10 text-[#E05C4B] border-[#E05C4B]/20
Pending:    bg-[#E8A838]/10 text-[#E8A838] border-[#E8A838]/20
```

### 9.13 Grade pills
```
A+: bg-primary text-primary-foreground
A:  bg-primary/12 text-foreground
B:  bg-muted-foreground/10 text-muted-foreground
C:  bg-accent text-muted-foreground
```

### 9.14 NXT (Next Step) indicators
```
T (Target):  bg-primary text-primary-foreground
M (Monitor): bg-[#E8A838]/15 text-[#E8A838]
D (Discard): bg-[#E05C4B]/10 text-[#E05C4B]
```

### 9.15 Position pills
```
inline-block px-1.5 py-[2px] rounded font-body text-[10px] font-bold
ST:         bg-destructive/10 text-destructive
LW/RW/CDM/FB: bg-primary/10 text-foreground
CAM:        bg-[#E8A838]/10 text-[#E8A838]
CM:         bg-muted-foreground/10 text-muted-foreground
CB:         bg-muted-foreground/20 text-muted-foreground
```

### 9.16 Modal windows
```
Overlay: fixed inset-0 bg-[#061B2E]/60 backdrop-blur-sm z-[200]
Card: bg-card rounded-[32px] shadow-[var(--shadow-2xl)] border border-border
Header: px-8 py-6 bg-primary rounded-t-[32px] text-chalk
Body: p-8 space-y-4
Actions: w-full bg-primary text-primary-foreground rounded-full py-3
Close: w-8 h-8 rounded-full bg-card/10 text-chalk/60 hover:text-chalk
```

### 9.17 Custom DatePicker
Replaces browser-default date inputs on Scope Settings.
```
Popup: bg-card border border-border/50 rounded-xl shadow-[var(--shadow-2xl)] w-[260px]
Header: Month and Year as separate dropdown buttons (font-heading font-bold text-[13px])
  Month click → 3-column grid overlay (Jan–Dec)
  Year click → scrollable vertical list (±10 years)
  Chevron arrows → step one month at a time
Day grid: 7-column, font-body font-bold text-[12px]
  Selected: bg-primary text-primary-foreground rounded-full shadow-sm
  Today: bg-primary/10 text-primary font-black
  Hover: hover:bg-accent
Footer: "Clear" and "Today" text action links in primary colour
```

---

## 10. Dashboard Layout

Every role-based dashboard follows the same structural pattern.

### Page structure (top to bottom)
```
1. Welcome Header — h1 with icon circle + name
2. Tab Pills Row — horizontal, gap-2
3. KPI Cards Row — grid grid-cols-2 lg:grid-cols-4 gap-6, h-[220px]
4. Below-KPI Section — grid grid-cols-1 lg:grid-cols-3 gap-6
   Left (col-span-2): main content card on bg-card
   Right (col-span-1): stacked sidebar cards
     Top card: neutral (bg-card)
     Bottom card: accent (bg-primary with text-chalk)
```

### Per-role dashboard content

| Section | Country Scout | Head Scout | Lead Scout | Senior Scout |
|---|---|---|---|---|
| KPI 1 | Missing Videos | Missing Videos | Tracked Players | Open Tasks |
| KPI 2 | Missing Match Data | Missing Match Data | Grade A Rate | New Reports |
| KPI 3 | Ready Reports (image) | Ready Reports (image) | Shortlist vs Pending (image) | Packages to Review (image) |
| KPI 4 | Grade A Players | Grade A Players | Pkgs Unwatched | Pipeline |
| Left content | Scout Leaderboard | Scout Leaderboard | Target Tasks | My Tasks |
| Right top | Top Prospect (neutral) | Top Prospect (neutral) | Upcoming Matches (neutral) | Recent Reports (neutral) |
| Right bottom | Upcoming Matches (accent) | Upcoming Matches (accent) | Latest Packages (accent) | Upcoming Packages (accent) |

---

## 11. Icon System

All icons come from **lucide-react**. No other icon library.

| Context | Size |
|---|---|
| Page title icon circle | 28px |
| Card header icon | 20px |
| KPI card icon | 18px |
| Sidebar nav icon | 20px |
| Table action button | 13px |
| Inline small icon | 12px |
| Dropdown menu item icon | 11px |
| Tiny indicator | 9–10px |

### Icon circle containers
```
Large (page title):  w-14 h-14 rounded-full bg-primary — icon: text-chalk
Medium (card header): w-12 h-12 rounded-[16px] bg-primary — icon: text-chalk
Standard (KPI):      w-10 h-10 rounded-full bg-accent — icon: text-muted-foreground
Small (sidebar):     w-9 h-9 rounded-xl bg-accent — icon: text-foreground
```

---

## 12. Role Architecture

### The 11 roles across three modes
| Mode | Roles |
|---|---|
| Scout Mode | Country Scout, Head Scout, Senior Scout, Lead Scout |
| Video Mode | Video Uploader, Video Editor, Video Manager |
| Match Entry Mode | Basic Match Entry, Detailed Match Entry, Advanced Data Entry |
| God Mode | Operations Manager (Admin Superuser) |

### Scout tier tab sets
| Role | Tab set |
|---|---|
| Country Scout | Players in Scope, Top 10, Reserve List, Combined Top 10 |
| Head Scout | Players in Scope, Top 10, Reserve List, Combined Top 10 |
| Senior Scout | Scope Settings, Reports, Database, Long List, Short List, Target List, Signed List |
| Lead Scout | Scope Settings, Reports, Database, Long List, Short List, Target List, Signed List |

### The Scout pipeline flow
**Tier A → Tier B bridge:**
When a Country Scout raises a player, an in-platform and email notification fires.
Player auto-appears on Senior Scout Long List. Direct Ladder icon appears.

**Tier A pipeline:** Players in Scope → Top 10 → Reserve List → Combined Top 10
**Tier B pipeline:** Scope Settings → Database → Long List → Short List → Target List → Signed List

### Reports location
Reports no longer has a standalone page. Report content (summary stats,
champion podium, report cards) lives inside the dashboard's Reports tab.
The players page has a blank Reports tab placeholder.
The sidebar does not have a Reports nav item.

---

## 13. Animation and Interaction Rules

| Element | Animation |
|---|---|
| Dropdown menus | `animate-fade-in` 150ms ease-out |
| KPI numbers on load | Count up from 0, 600ms ease-out |
| Tab switching | Instant — no animation |
| Modal open | Fade + scale 95%→100%, 200ms ease-out |
| Card hover lift | `hover:-translate-y-1` 200ms |
| All hover states | `transition-colors duration-150` |
| Theme switch | Instant — no transition |
| Page navigation | Instant — no transition |
| Pulse dot | 2s ease-in-out infinite, opacity + scale |

---

## 14. Dashboard Subtitle — Dynamic Football Context

The dashboard subtitle rotates on every page load via Anthropic API.
Falls back to a randomised array if the API is unavailable.

---

## 15. What Figma Make Must Never Do

- Never introduce any colour not defined in this guide
- Never use `#FFFFFF` (pure white) or `#000000` (pure black)
- Never use `gray-*`, `slate-*`, `zinc-*` Tailwind classes
- Never add a new page not specified in a prompt
- Never remove an existing page or feature
- Never use a font other than Figtree, Plus Jakarta Sans, or JetBrains Mono
- Never use Manrope under any circumstance
- Never use a spacing value that is not a multiple of 2px
- Never use a border radius not listed in Section 8
- Never remove the Videos cluster from any table view
- Never apply a max-width that causes dead horizontal space
- Never change the default mode from light to dark
- Never use `#061B2E` for anything other than dark mode background
- Never put `text-foreground` on `bg-primary` surfaces — use `text-chalk`
- Never use `shadow-lg` (Tailwind default) — use `shadow-[var(--shadow-lg)]`

---

## 16. Before Every Generation — Checklist

1. Have I read the full Guidelines? If no — stop and read it.
2. Does every colour used exist in Section 2? If no — remove it.
3. Is every spacing value a multiple of 2px? If no — fix it.
4. Is every font Figtree, Plus Jakarta Sans, or JetBrains Mono? If no — fix it.
5. Does every page use the Section 5 header pattern? If no — fix it.
6. Does every table have the Videos cluster? If no — add it.
7. Are editable column headers present on all tables? If no — add it.
8. Is light mode the default? If no — fix it.
9. Is the accent card present in the dashboard sidebar? If no — add it.
10. Do dot indicators use w-5 h-5 with dashed empty borders? If no — fix it.
11. Is every button one of the three variants in Section 9.1? If no — fix it.
12. Am I adding or removing any page or feature not in the prompt? If yes — stop.