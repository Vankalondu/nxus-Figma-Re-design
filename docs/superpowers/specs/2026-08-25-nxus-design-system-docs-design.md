# NXUS Design System Documentation — Design

_Date: 2026-08-25 · Status: awaiting review_

## 1. Context

NXUS is a football-scouting terminal (React 18 + Vite 6 + Tailwind v4 + shadcn/Radix
primitives). Vanessa owns the design system; its origin is her Figma library (QAZA_FE).

A second team at LightHouse builds a narrower product that shares two of her dashboards
(Lead Scout and Senior Scout). They port from her work, and their code already treats her
design system as the authority — their library source says "Vanessa's canonical design",
their token file resolves every legacy `--qaza-*` property to her tokens via `var()`
aliases, and their component comments cite numbered "design laws". But their rulebook
lives on their side, and she has never seen it.

**This spec designs the artifact that fixes that: a rulebook authored from her work,
self-contained, that another team can copy and be governed by without access to her app
or her Figma.**

### Authority direction

One-way: **Figma → her repo (reference implementation) → other teams copy.**

Her repo does not consume the other team's npm package. That would couple her release
cadence to a downstream product and invert the authority direction. Where their
engineering is genuinely useful (Storybook 10 config, `react-docgen-typescript` setup,
`vite-plugin-dts`, the OIDC publish workflow) it is **lifted as configuration**, not
depended on as a package.

### Interop contract

The shared surface is **tokens plus the rulebook** — not components. Component idiom stays
local to each repo (hers Tailwind utility classes, theirs CSS Modules). Both bind the same
tokens. Nobody rewrites ~60 components to match the other side.

This is the mechanism their `qaza-tokens.css` already demonstrates: a pure `var()` alias
layer, no copied literals, so a theme change on her side re-resolves everywhere downstream.

## 2. Goal and non-goals

**Goal:** turn `guidelines/Guidelines.md` from a document addressed to an AI generator into
a rulebook addressed to a human developer, numbered so it can be cited from code and PRs,
and scoped so it binds a product its author has never seen.

**Non-goals for this phase:**

- Standing up Storybook (phase 2 — see §10).
- Extracting components into an installable package (later; the endgame, not now).
- The Figma → token automation pipeline (last; it automates a contract that must exist and
  be correct first).
- Migrating the 1003 bracketed-hex sites (§9 scopes this honestly).
- Anything about the other team's v2 product, their `nextfe` repo, or their port-rules doc.
  Deliberately out of scope: this rulebook is authored from Vanessa's side, and they copy
  from it.

## 3. Why rules first

Rules and the token contract are pure authorship. No refactor, no new tooling, nothing that
can break the build or the Playwright suite. They are also the part another team can copy
immediately, before any catalog exists. A browsable catalog of undocumented rules governs
nothing.

## 4. The three-tier split

### Laws — non-negotiable, portable, mechanically detectable

- Bind tokens, never raw values (the master Law; §7's "never Tailwind `shadow-lg`, always
  `shadow-[var(--shadow-lg)]`" is an instance of it)
- No `#FFFFFF`, no `#000000`, in any property or mode
- No `gray-*` / `slate-*` / `zinc-*`; no colour outside the system
- `#061B2E` is the dark-mode background only — never buttons, table headers, filter bars,
  modal headers, card surfaces, logo backgrounds
- Status colour semantics: green = success/complete/scouted · red = late/destructive/
  unscouted · amber = pending/warning/in-progress. Identical in both modes.
- Elements that never flip: text on `bg-primary` is always `text-chalk`; status colours are
  mode-constant
- Two fonts only; the forbidden size list
- The 4-pt grid, scoped per the §8 ruling
- `lucide-react` only
- All buttons are pills (`rounded-full`) — the one component-shape Law: binary, greppable,
  and the most recognisable signature of the system. Note this is the *shape only*, drawn
  from §8's radius table; §9.1's full button class strings stay Patterns.
- Both modes must be fully supported; no element styled for one mode only

Target count: **12–15 Laws.** Short enough to memorise, which is the point.

### Patterns — recommended shapes; deviation allowed with a stated reason

- The 60/30/10 rule. The document already calls it "a guiding principle, not a rigid pixel
  ratio… aesthetics can bend the rule" — that is the definition of a Pattern. It leads the
  Patterns section because it explains why the token roles exist.
- The one-accent-card rule. Phrased as a Law ("must contain exactly one") but it presupposes
  her specific below-KPI grid; a team with a different page shape cannot obey it, and a Law
  that cannot be obeyed everywhere is not a Law. The generalisable core — scarcity of the
  10% colour — is extracted as a Law: *primary is never the background of more than one card
  per view.*
- Page header anatomy (title + icon circle + subtitle)
- All component specs, §9.1–9.17, without exception (see §8 for why)
- Dashboard page skeleton (header → tabs → KPI row → 2/3 + 1/3 split)
- Shadow usage mapping; table anatomy; animation rules

### Reference — lookup tables, mirroring `globals.css` one-to-one

Palette scales, the semantic token map, the type ramp, the spacing scale, shadow tokens,
radius roles, icon sizes. Each hex appears **exactly once**. The §3 light/dark application
tables are cut as redundant with the token map.

## 5. The Law test

A rule is a Law only if all three hold:

1. **Detectable without intent.** A grep or linter could flag a violation without knowing
   what the component is for. (`#FFFFFF` — yes. "KPI cards should be 220px tall" — no.)
2. **PR-blocking on its own.** You would reject an otherwise perfect PR solely for this,
   with no discussion. If the honest answer is "it depends on the layout", it is a Pattern.
3. **Portable.** It binds a product you have never seen. If the rule names a specific page,
   tab, dashboard, or role, it cannot be a Law.

Fails any one → Pattern. Pure lookup → Reference.

This test also diagnoses the current document's central failure: §9.10's KPI spec fails
tests 1 and 3, which is exactly why the code drifted from it without anyone noticing.

## 6. Numbering

**Tier prefix + permanent topic code + append-only serial.**

`L-C3` = Law, Colour, third. `P-T2` = Pattern, Tables. `R-TY` = Reference, Typography
(reference tables are cited whole, not by row).

Topic codes are permanent: `C` colour · `TY` type · `S` spacing · `E` elevation ·
`R` radius · `CO` components · `M` motion · `I` icons.

Every specific ID used in this spec (`L-C1`, `L-C4`, `P-CO2`, `L-C2`) is **illustrative**.
Real serials are assigned in document order at authoring time and are fixed from then on.

Two properties do the real work:

- **Append-only within a topic.** A new colour law is `L-C7` even if it belongs logically
  between C2 and C3. Document order can be curated; the ID never encodes position.
- **Tombstones, never deletion.** A retired rule keeps its ID as a one-line stub:
  `L-C4 — retired 2026-08, superseded by L-C6`. This is what keeps a years-old
  `// per L-C1` code comment truthful.

This supersedes the plain `§4.2` scheme proposed earlier in conversation. Positional
numbering dies at the first reorganisation — and since the other team already cites rules by
number, renumbering would silently rot every citation on their side. The tier prefix also
does free work in review: `// L-C1` tells a reviewer "non-negotiable" without opening the
document.

## 7. Rule entry anatomy

Five parts. The rationale is load-bearing — it is what lets a reader apply the rule to a
case the author never imagined.

```
ID · Tier · Statement (one testable sentence)
Why (consequence, not restatement)
Do / Don't (token-level code, both sides)
Scope & exceptions (explicit "none" for Laws)
Catch (the grep, or the review question to ask)
```

Worked examples:

> **L-C1 — No pure white, no pure black.** `#FFFFFF` and `#000000` never appear, in any
> mode, in any property (background, text, border, shadow, gradient).
> **Why:** every neutral in this system is blue-cast; a single pure-white surface reads as a
> hole punched in the page and breaks the tinted atmosphere that makes the product
> recognisable. **Do:** `bg-card`, `text-foreground`. **Don't:** `bg-white`, `text-black`,
> `#fff` in SVGs. **Exceptions:** none, including imported assets.
> **Catch:** `grep -riE '#fff\b|#ffffff|#000\b|#000000|bg-white|text-black' src/`

> **L-C4 — Status colours carry meaning, never decoration.** `--scout-green` = success/
> complete/scouted; `--scout-red` = late/destructive/unscouted; `--scout-amber` = pending/
> warning/in-progress. Identical in both modes.
> **Why:** scouts scan hundreds of rows; a green dot must mean the same thing in every view
> or the scanning skill users build stops transferring. **Do:** `bg-scout-amber/15
> text-scout-amber` for a pending pill. **Don't:** green as a decorative accent; a red
> border for emphasis. **Exceptions:** none.
> **Catch:** in review ask "what state does this colour report?" — no answer, no colour.

> **P-CO2 — Status pill shape.** Tint at `/15`, text in the status colour, pill radius,
> 10–12px bold body text. Never a heavy solid fill.
> **Why:** solid status fills compete with `bg-primary` structural anchors; translucent
> tints keep dozens of pills per screen scannable without shouting.
> **Do:** `TASK_STATE_META` in `src/app/components/dashboard/shared.tsx:25`.
> **Don't:** `bg-[#22C55E] text-white`. **Deviation allowed when:** a single dominant state
> must be unmissable (e.g. destructive confirmation) — say so in the PR.

Note `P-CO2` cites live code, not a Figma frame. Entries should cite files, because the
other team ports from code.

## 8. Contradictions to adjudicate

The current document contradicts itself and the shipped code in four places. The rewrite
must rule, not carry them over. A rulebook whose own examples violate its first Law will not
survive being copied.

| # | Conflict | Ruling |
|---|---|---|
| 1 | §6 says strict multiples of 4, 6px and 10px forbidden. §15 says "multiple of 2px". Shipped code uses `py-1.5`, `px-1.5`, `py-0.5` throughout (`shared.tsx:92`) | Keep the 4-pt Law for **layout** spacing (gaps, padding, margins between blocks). Explicitly exempt intra-atom micro-spacing (≤8px inside a pill/badge/hairline). A Law the system's own components violate teaches readers that Laws are optional — scope it honestly or it poisons the others. |
| 2 | §4's first table gives JetBrains Mono a role (line 169); the paragraph below retires it (line 178) | Retired. Code confirms: `globals.css:350` aliases `.font-mono` to Plus Jakarta Sans + `tabular-nums`. |
| 3 | §4 documents a fixed type ramp; `globals.css:359–369` ships a **responsive** ramp via `.text-h1`…`.text-micro` utilities that §4 never mentions | Document the responsive ramp. Reference mirrors the CSS that ships, not the Figma memory of it. |
| 4 | §9.10 specifies KPI cards as `rounded-[40px] p-8 h-[220px]`, 56px number, chip `bg-accent text-muted-foreground`. `KpiCard.tsx:19,28` ships `rounded-[32px] p-6 min-h-[190px]`, `text-4xl`, chip `bg-primary/10 text-primary` | Update the Pattern to the shipped component — which is also better: it is a `<button>`, keyboard-focusable, with a named action link. |

## 9. Missing rules the code already follows

Written nowhere, honoured in code:

- **`L-C2` (new) — consume status and priority colour through the semantic tokens
  (`scout-green` / `scout-amber` / `scout-red`), never bracketed hex.** Evidence:
  `globals.css:320–322` deliberately exposes `--color-scout-*` so `text-scout-green` and
  `bg-scout-amber/15` resolve; `shared.tsx:26–29` and `:87–88` consume them exclusively that
  way. The Guidelines still write `bg-[#22C55E]/10` (§9.12, §4) — purge that from every
  example.
- **Priority semantics** — High = red tint, Medium = amber, Low = muted
  (`shared.tsx:87–89`). Followed consistently, stated nowhere.
- **`tabular-nums` on every large numeral** — `KpiCard.tsx:28` applies it directly. The
  Guidelines only imply it via the `.font-mono` alias.
- **Content is never gated on JavaScript** — currently in `CLAUDE.md`, absent from
  Guidelines. Belongs here as a Law.

### Enforcement reality — stated honestly

`L-C2` and `L-C1` are correct as Laws, but current compliance is partial:
**1003 bracketed-hex uses across 42 of 119 `.tsx` files.** The debt is concentrated, not
diffuse:

| Bucket | Examples | Disposition |
|---|---|---|
| Raw Figma output | `imports/JuniorScoutDashboard.tsx` (114), `imports/VideoDashboard.tsx` (109), `imports/Container/Container.tsx` (81) | **Quarantine.** `src/app/imports/` is generated output, excluded from Law enforcement and from the lint scope. |
| Dead, unrouted code | `VideoDepartmentDashboard.tsx` (62), `GlobalPulseDashboard.tsx` (52), `OperationsDashboard.tsx` | **Delete**, don't migrate. Confirmed unrouted. |
| Live code, small counts | `CardView.tsx` (39), `CountryScoutDashboard.tsx` (33), ~20 more | **Migrate opportunistically** — when a file is next touched. |

Off-system colours confirmed present and dominant: `#333640` (155×), `#0A0E1A` (90×),
`#43A047` (68×), `#51A2FF` (65×). None exist in the palette. These are real §2 violations,
mostly inside the quarantine and dead-code buckets.

The Law ships with a **documented enforcement scope**, not a pretence of clean compliance.
A CI lint rule over the non-quarantined scope is a phase-2 item.

## 10. Deliverables

**Phase 1 — this spec's scope (rules + token contract):**

1. `guidelines/LAWS.md` — 12–15 Laws, full entry anatomy, tombstone section.
2. `guidelines/PATTERNS.md` — component and layout anatomies, corrected to shipped code,
   citing files.
3. `guidelines/REFERENCE.md` — tables mirroring `globals.css` one-to-one, each hex once.
4. `guidelines/TOKENS.md` — the token contract: what each token means as a *role*, which are
   theme-invariant, which flip. This is the artifact another team aliases onto.
5. `guidelines/DECISIONS.md` — demoted decision log: rejected fonts (Manrope history),
   light-mode default, theme-toggle placement, the runners image. Archaeology, not rules.
6. `guidelines/Guidelines.md` — becomes a short index pointing at the five above, addressed
   to a human developer. The "single source of truth for every Figma Make generation"
   preamble is deleted.
7. App-specific content moved out of the rulebook into `docs/app/`: §5's icon and subtitle
   copy tables, §10's per-role KPI table, §12 role architecture and pipeline flows, §14 the
   API-driven rotating subtitle.
8. §15 dissolved — duplicate items folded into their Laws once; generator-leash items
   ("never add a page not in the prompt") deleted. §16 reborn as a short human PR checklist
   where every line cites a rule ID. Its item 7 ("editable column headers on all tables")
   cites a rule that exists nowhere in the document — either write the rule or drop the
   line.

Expected net effect: roughly a third shorter than the current 30KB.

**Phase 2 (not this spec):** Storybook as the browsable home — catalog plus these documents
as MDX. Prerequisite: add `typescript` + a `tsconfig.json` as devDependencies (currently
neither is installed, though components carry TS annotations). Zero build risk — Vite builds
via esbuild, which strips types without checking them. Plus the CI lint rule for `L-C1`/
`L-C2` over the non-quarantined scope.

**Phase 3 (not this spec):** primitives → components map; extraction into an installable
package; Figma → token automation with Code Connect.

## 11. Success criteria

- A developer on another team, given only `guidelines/`, can style a new page correctly
  without seeing the NXUS app or the Figma file.
- Every Law passes all three tests in §5.
- No example anywhere in the rulebook violates any Law in it.
- Every Pattern that cites a measurement matches shipped code, verified by file reference.
- Each **palette** hex appears exactly once across all five documents, in `REFERENCE.md`.
  Forbidden values (`#FFFFFF`, `#000000`) and off-system offenders cited as violations are
  exempt — they are named where a rule needs to name them.
- `npm run build` clean and Playwright 20/20 unaffected — phase 1 touches no application
  code.

## 12. Open questions

1. **Tombstone start.** Do retired rules from the current document get tombstone IDs
   retroactively, or does numbering start clean at the rewrite? Recommendation: start clean;
   nothing cites the current section numbers from code yet on her side.
2. **Where the rulebook ultimately lives.** `guidelines/` in the app repo now. If the design
   system is later extracted into a package, the rulebook should travel with it. Worth
   deciding before phase 3, not now.
3. **Sharing mechanism.** Once written, do the other team read these files from her public
   repo directly, or does she publish them (Storybook site / versioned rules package)? Bears
   on phase 2 but does not block phase 1.
