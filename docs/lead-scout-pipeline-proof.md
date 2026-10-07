# Proving the Figma → GitHub pipeline on a real screen

> Status: **plan, nothing built.** Written 30 Sep 2026, after the step 1–5 pipeline was
> finished on 16 Sep. Three workstreams; A and B are independent and can run in parallel,
> C needs both.

## Why this exists

The pipeline built in September is verified *as a pipeline* — a token moves, a branch
appears, CI catches it. What it has never done is prove that a token change is **visible**.
`docs/figma-sync.md` says so in its own limits section:

> It cannot verify what the change looks like.

So the pipeline can be green while a screen is wrong, and nobody would know. This plan
closes that by building one real screen on both sides of the loop — in Figma and in the
app — and then pushing a token through it and watching both ends move.

## Settled decisions (30 Sep 2026)

| Question | Answer | Consequence |
|---|---|---|
| Desktop canvas width | **1440**, matching the app | Figma frame = browser viewport, so screenshots overlay directly. Diverges from Player Profile's 1580 artboards — deliberate. |
| Webhook trigger | **`LIBRARY_PUBLISH`** | Publishing becomes the "this is ready" ritual. The forget-to-publish gap is covered by the existing freshness check (see A5). |
| Figma build scope | **KPI row + one table**, at 390 / 834 / 1440 | Covers surface / border / text / status roles plus the responsive spacing ramp, without rebuilding the whole dashboard three times. |

---

## What was established before planning

Facts checked against the live file and repo on 30 Sep, not carried from memory:

- **`Dashboard Page` (`289:8`) is empty.** The Lead Scout dashboard does not exist in Figma.
  This is a from-scratch build, not an export of something already drawn.
- **Every existing Figma screen is desktop-only at 1580px.** There are no mobile or tablet
  frames anywhere in the file.
- **Mapped (54) and Responsive (52) match the snapshot exactly.** The snapshot is current;
  there is no hidden drift to clean up first.
- **The `Responsive` collection's modes are `Mobile` / `Tablet` / `Desktop`**, and the app's
  Playwright tiers are 390 / 834 / 1440. They correspond one-to-one.
- **Screens bind to a mix of layers.** `get_variable_defs` on Player Profile returns
  primitives (`Colors/Primary/Base`, `Colors/Blue/200`), Mapped roles (`Color/Text/body`,
  `Color/Surface/page`, `Color/Border/default`) and Responsive (`Spacing/*`,
  `Text/Body/caption/*`) together.
- **`_cssPair` maps 41 Mapped roles to CSS variables and zero primitives** — but the plugin's
  `resolve()` follows aliases to a final hex, so a primitive edit still cascades into the
  Mapped values the diff reads. **A primitive change is detected.**
- **`Color/Surface/page` and `Colors/Primary/100` both resolve to `#d2e7fa`** — the role
  aliases the primitive. That makes it the ideal test token: one edit moves the CSS diff
  *and* is visible as a page background.
- **The collection names are settled and are not to be changed.** `Qaza` (stored as `"Qaza "`,
  with a trailing space), `Allias`, `Mapped`, `Responsive`. The plugin already accommodates the
  trailing space (`c.name.trim() === 'Qaza'`). The names are deliberate; the fragility to fix is
  on the plugin's side, not the file's — see risk R3.

---

## Workstream A — the publish webhook

**Goal:** publishing the QAZA_FE library opens a GitHub issue saying the snapshot is stale
and the export needs running.

### A0 — which team owns QAZA_FE? — **ANSWERED 30 Sep 2026: Lighthouse Sports (Pro). Not blocked.**

QAZA_FE is on the **Lighthouse Sports** team, which is Pro tier, so `webhooks:write` is available
and the webhook is buildable. The rest of this section is kept for the reasoning, not as a gate.

The tier question was worth asking rather than assuming: Vanessa's single account spans five
teams and four of them are student tier, two named `Backup Qaza` and `Qaza Emergency`.



Figma webhooks are registered against a context, and only **Lighthouse Sports** is a Pro
team — `whoami` shows the other three (`Vanessa Kalondu's team`, `Backup Qaza`,
`Qaza Emergency`, `Boni's Bacup`) are student tier. If QAZA_FE sits on a student team the
webhook may be gated, exactly as the TaniAfrika file was walled off by Starter quota.

Answer it before writing a line of Worker code. Either read the team from the file's
breadcrumb in the Figma UI, or run:

```
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/qefpAyr3MEEklQRV96YlSv/meta"
```

The token is in the GitHub secret `FIGMA_TOKEN`, not on this machine.

**If it is not on a Pro team:** stop and reconsider. Either move the file, or drop the
webhook and rely on the freshness check alone (A5), which needs no webhook at all.

### A1 — verify the narrowest registration scope

Figma's v2 webhook API takes a context. Prefer **file-scoped** (`context: 'file'`,
`context_id: qefpAyr3MEEklQRV96YlSv`) so the hook fires for this file only. Fall back to
team scope if file context is not accepted for `LIBRARY_PUBLISH`. Confirm against the live
API rather than assuming — this plan does not claim to know which contexts that event
supports.

### A2 — the Cloudflare Worker relay

A relay is unavoidable here, and this is the one place the step-5 reasoning does not carry
over. The plugin could call `api.github.com` directly because a human was present to type a
token into `figma.clientStorage`. A webhook has no human and no client storage: Figma POSTs
a fixed body to a URL and **cannot send custom headers**, while `repository_dispatch`
requires an authenticated POST. Something has to hold the credential.

Cloudflare is already in the stack (Pages hosts the app), so a Worker is the natural home.

Behaviour:

```
Figma publish ──> Worker ──> verify passcode ──> repository_dispatch ──> Action
                    │
              PING event ──> 200 OK, do nothing
```

- Verifies Figma's `passcode` against a Worker secret before doing anything.
- Answers Figma's registration `PING` with 200 — registration fails otherwise.
- Holds two secrets as **Worker secrets, never in the repo** (this repository is public, so
  a committed credential is a published one — the same rule that shaped step 5).
  - `FIGMA_PASSCODE`
  - `GITHUB_TOKEN` — fine-grained PAT, this one repository, **Issues: write** only.

### A3 — the Action

New `.github/workflows/figma-published.yml`, on `repository_dispatch` type
`figma-published`:

1. Run `scripts/figma-freshness.mjs` to confirm the snapshot really is behind. A publish
   that changed no variable should not raise an issue.
2. **Dedupe** — if an open issue already carries the `figma-stale` label, add a comment
   rather than opening a second one. Without this, three publishes in an afternoon produce
   three identical issues and the signal is gone within a week.
3. Otherwise open one, labelled `figma-stale`, whose body says what to do: run the plugin,
   press Send to GitHub, and links `docs/figma-sync.md`.

`permissions:` is `issues: write` and nothing else.

### A4 — register and prove it

Register the webhook, confirm the `PING` lands, then do a real publish and watch the issue
appear. Close the loop by merging the resulting PR and confirming the issue auto-closes or
is closed by hand.

### A5 — the backstop, and why the chosen trigger is safe

`LIBRARY_PUBLISH` only fires when you publish. The risk of the choice is forgetting to.
That risk is already covered: `figma-freshness.mjs` runs in CI on **every push** and fails
when Figma's `lastModified` is newer than the snapshot's `_verified` stamp. So a variable
edited and never published still gets caught — just on the next push rather than instantly.

- Publish → fast, deliberate nudge.
- Freshness check → slow, unavoidable backstop.

Neither is load-bearing alone. Say this out loud when explaining the design, because "what
if I forget?" is the first question anyone will ask.

---

## Workstream B — the Lead Scout dashboard in Figma

Independent of A. Can start immediately.

### B0 — read the real thing first

The shipped dashboard is `src/app/pages/LeadScoutDashboard.tsx` (1358 lines). The KPI row is
four `KpiCard`s at lines 908–918 — Reports 27, Coverage, Pipeline 20, Top Grade 33%. Capture
the live app at 390 / 834 / 1440 with the existing Playwright harness; those screenshots are
the reference the Figma build is measured against.

Pick the table in the same pass — whichever sits on the Overview tab beneath the KPI row.

### B1 — audit what can be instanced

`🧩 Atoms` (89), `🧱 Molecules` (35), `🏛️ Organisms` (21) and `🏛️ Organisms — Tables` (12)
are already populated. Find the existing KPI-card and table-row equivalents before building
anything new. Composing existing instances is the house method
(see the design-system notes) and it is also what makes the test honest — it exercises the
components the rest of the file uses.

### B2 — build three frames on `Dashboard Page` (`289:8`)

`Lead Scout — Desktop 1440` · `Lead Scout — Tablet 834` · `Lead Scout — Mobile 390`.

The three frames differ by **mode, not by hand-editing**: set each frame's Responsive
collection mode with `setExplicitVariableModeForCollection`, so tablet and mobile inherit
their spacing and type from the collection rather than from manual overrides. If a frame
needs hand-tuning beyond the mode, that is a finding about the Responsive collection and
should be recorded, not patched silently.

### B3 — binding rule, stated plainly

- **New structure** (frames, containers, spacing, backgrounds) binds to **Mapped** for
  colour and **Responsive** for spacing and type.
- **Instanced components keep the bindings they already have**, which today lean primitive.
  That is fine and it is not a defect — but it means the test moves through primitives as
  well as roles, which is why `Colors/Primary/100` is the chosen test token rather than a
  Mapped role.
- Primitives only where no role exists. If that happens often, it is evidence the Mapped
  layer has a gap — record it as an OR-style open item.

House rules that apply: **L-C1** (never `#FFFFFF`/`#000000` at any opacity — use `--chalk` /
`--midnight`), light mode only, every text node bound to a named style, 4-pt grid.

### B — BUILT 7 Oct 2026. What was made, and four findings

Three frames on `Dashboard Page` (`289:8`), each pinned to its Responsive mode:
`Lead Scout — Desktop 1440` (`1424:2`) · `Tablet 834` (`1424:288`) · `Mobile 390` (`1424:516`).
New `KPI Card` component (`1422:321`) on Molecules with four TEXT properties and a swappable
icon; four new lucide icon components on Foundations (`Icon/Target` already existed and was
reused, not duplicated).

**Finding 1 — the Lead Scout dashboard has no table.** Its Overview is the KPI row, Target
breakdown, Latest Videos and Matches. The agreed scope said "KPI row + one table", so the
second section built is **Target breakdown** instead — it carries more token surface anyway
(surface-card, border-default, surface-accent, brand-primary, status-success, four text roles).
The `Table/*` organisms do exist on `🏛️ Organisms — Tables`, but they are **fixed-width 1386px
and desktop-only**, so none can go into an 834 or 390 frame without a responsive rebuild. That
rebuild is its own job, not a side-effect of this one.

**Finding 2 — `createAutoLayout()` returns an opaque white frame.** 64 structural containers
shipped with `{r:1,g:1,b:1}` fills nobody asked for — an L-C1 breach created by the tool, not a
decision. Cleared. Recorded as LESSONS #16: in a Figma build script, `fills = []` is part of
creating a layout container, not cleanup.

**Finding 3 — `Sidebar` and `Top Navigation Bar` are fixed-layout.** At 390 the TopNav overflows
its frame. The app's own TopNav collapses at `lg`; the Figma component has no such behaviour and
no variants for it. So the mobile frame is honest about the KPI row and the card, and wrong
about the nav. Fixing it means giving those two components responsive variants — again its own
job.

**Finding 4 — `Color/Text/link` now has its first real use.** It is one of the eight roles OR-8
lists as defined and rendered nowhere; the KPI card's action link binds to it. Seven left.

### B4 — verify

Screenshot each of the three frames and compare against the B0 app captures. Differences are
either a build error or a genuine Figma↔code divergence; both are worth knowing, and the
second is the more interesting result.

---

## Workstream C — the actual pipeline test

Needs B built. Steps C3 needs A finished; everything else does not.

| # | Step | Expected |
|---|---|---|
| C1 | Run the plugin → **Send to GitHub**, unchanged | "matches the committed snapshot", no branch. Proves the green path is still green with the new screens present. |
| C2 | In Figma, change `Colors/Primary/100` from `#d2e7fa` to a visibly different tint | The three Lead Scout frames change on screen |
| C3 | Publish the library | Webhook fires → `figma-stale` issue opens *(tests workstream A)* |
| C4 | Run the plugin → Send to GitHub | `figma-sync` branch pushed, drift report in the commit message naming `Color/Surface/page` |
| C5 | Open the PR | CI runs token lint + Figma drift + freshness + 20 Playwright tests + both builds |
| C6 | Merge, then deploy | `--surface-page` changes in `globals.css`; the live app's page background moves |
| C7 | Revert the variable in Figma, re-export | Everything returns to clean; the issue closes |

C6 is the step that has never been proven. It is the whole point: a designer changed a
colour in Figma and it arrived in the browser, through a pull request a human read.

**C6 needs an explicit go-ahead before deploying.** Standing rule: "make it live" plus a
confirmed go-ahead, gated on tests.

---

## Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | QAZA_FE is on a student-tier team → webhook gated | A0 answers it first; fall back to the freshness check alone |
| R2 | The Worker is a new deployed service to secure and maintain | Minimum surface: one route, one event, two secrets, fine-grained PAT scoped to Issues on one repo |
| R3 | An empty extracted section reads as mass deletion | Not a naming problem — **the collection names stay as they are.** The gap is in `figma-merge.mjs`: its guard refuses a *missing* section but accepts an **empty** one, so any future cause of an empty extract (a permissions blip, an API change) would merge as a wholesale delete. Fix the guard to reject an empty section too, and glance at the plugin's `N Qaza · N Mapped · N Responsive` counts before pressing Send. |
| R4 | The three responsive frames need hand-tuning beyond mode switching | That is a finding about the Responsive collection, not a build detail — record it |
| R5 | Building from existing instances drags in primitive bindings | Expected and accounted for; it is why the test token is a primitive that cascades |

## What this still will not prove

The verification gap from `docs/figma-sync.md` narrows but does not close. One screen is
now visually verified end to end. The other screens are not, and the import closure from
`App.tsx` still reaches only 44 of 113 app files. A green PR after this work means *the
tokens are consistent and the Lead Scout dashboard is right*. It does not mean every screen
is right.
