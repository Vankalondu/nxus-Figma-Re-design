# How we work: from Figma to Storybook

Read this first. It explains how a design becomes code, who approves what, and what to do
in every common situation, so you should not need to ask anyone how the process works.

This repo is the **NXUS prototype**: the reference implementation of the design. We prove
the process here first; once it works, the same pieces are copied into the real app.

---

## The map: where everything lives

| What | Where | What it is for |
|---|---|---|
| **Figma** (the spec) | [NXUS design file](https://www.figma.com/design/qefpAyr3MEEklQRV96YlSv) | *What* to build and *why*: screens, components, tokens. Source of truth for design. |
| **Tokens** (the shared values) | `src/styles/globals.css` → `npm install nxus-tokens` | Colours, spacing, type, shadows. Never type a hex value; use a token. |
| **The app** (this repo) | `src/app/` | The working prototype: [qaza-2so.pages.dev](https://qaza-2so.pages.dev) |
| **Storybook** (the parts list) | Stories next to each component (`*.stories.tsx`), docs in `src/docs/`, config in `.storybook/` | *What already exists* and how to use it: [qaza-2so.pages.dev/storybook](https://qaza-2so.pages.dev/storybook/) |
| **The rules** | `guidelines/Guidelines.md` (also in Storybook → Guides → UI Style Guide) | Numbered design laws (e.g. L-C1, P-CO4). The automated checks enforce many of them. |

The Figma file has one page per role. For the video work:

- [**Video Manager**](https://www.figma.com/design/qefpAyr3MEEklQRV96YlSv?node-id=1515-26217): Dashboard row and Players Page row
- [**Uploaders**](https://www.figma.com/design/qefpAyr3MEEklQRV96YlSv?node-id=1515-26233): Package Uploader row and Full Match Uploader row
- [**Lead Scout**](https://www.figma.com/design/qefpAyr3MEEklQRV96YlSv?node-id=1449-2) is the finished example of how a role page is laid out.

Each page has three sections side by side (**Desktop 1440 · Tablet 834 · Mobile 390**), and
each row lists its screens left to right in the same order as the app's tabs.

---

## The pipeline in one picture

There are two ways a change starts. Both end in the same place.

```
 A. A DESIGN-TOKEN change (a colour, a spacing, a text size): starts with Vanessa
    Figma variable changed ──> plugin "Send" ──> pull request "Figma token update" opens
       (it already contains the code change: globals.css + the Figma record)
                                                   │
 B. EVERYTHING ELSE (screens, components, fixes): starts with you
    you write code on a branch ──> you open a pull request
                                                   │
                                                   ▼
             Automated checks run on the pull request:
               · Build & E2E tests       does the app build and work?
               · Token lint + Figma drift are the design rules kept? do tokens match Figma?
               · Visual check            screenshots of 152 components/screens vs. approved ones,
                                         posted as ONE summary comment with before/after images
                                                   │
                                                   ▼
             The PM (@Whitelash) reads the summary and approves, or asks for changes
                                                   │
                                                   ▼
             Merged into main ──> you are tagged on GitHub + Google Chat gets a message
                                                   │
                                                   ▼
             Vanessa presses "make it live" ──> app + Storybook update at qaza-2so.pages.dev,
                                                and nxus-tokens is published if a token changed
```

### What does NOT happen automatically

- **Figma screens do not become code.** Only *tokens* sync. You build screens in code, using
  the Figma design as the spec.
- **Code does not update Figma.** If the code needs something Figma does not have, ask
  (see "I need…" below).
- **Approved is not live.** Merging puts it on `main`; it goes live when Vanessa says so.

---

## Your task: the video roles

Build the **Video Manager**, **Package Uploader** and **Full Match Uploader** screens, and use
the pipeline above to get them reviewed. Much of it already exists; start from there.

| Role | Log in with (any password) | Route | Main code |
|---|---|---|---|
| Video Manager | `manager@nxus.test` | `/video-manager` (+ `/players`, `/matches`) | `src/app/pages/VideoManagerDashboard.tsx` |
| Package Uploader | `package@nxus.test` | `/package-uploader` (+ `/players`) | `src/app/pages/UploaderDashboard.tsx` |
| Full Match Uploader | `fullmatch@nxus.test` | `/full-match-uploader` (+ `/players`) | `src/app/pages/UploaderDashboard.tsx` |

Shared pieces you will touch:

- `src/app/state/videoStore.ts`: the live approval loop between uploaders and the Video Manager
- `src/app/components/VideoTrackerGrid.tsx`: the players grid (stories in `VideoTrackerGrid.stories.tsx`)
- `src/app/components/UploadVideoModal.tsx`: upload flow (has stories)
- `src/app/components/dashboard/TasksTab.tsx`: shared Tasks tab (has an uploader story)

Login is mock and client-side: the role comes from the email. Nothing is saved to a server.

---

## Step by step

1. **Get it running**
   ```bash
   npm install
   npm run dev          # app on http://localhost:5173
   npm run storybook    # Storybook on http://localhost:6006
   ```
2. **Make a branch**: `git checkout -b video-manager-overview` (one branch per piece of work).
3. **Build from Storybook parts.** Look in Storybook first. Reuse a component before making a
   new one. Use token classes (`bg-surface-card`, `text-heading`, `border-default`), never hex.
4. **If you create or change a component, add or update its story** (`*.stories.tsx` next to
   it). The visual check screenshots every story, so a story is how your work gets reviewed.
5. **Check before you push**
   ```bash
   npm run lint:tokens   # design rules
   npm run test:e2e      # app tests
   ```
6. **Push and open a pull request** to `main`. Describe what you built and link the Figma frame.
7. **Read the Visual check comment** (it appears in a few minutes):
   - ✅ *Nothing changed visually*: wait for the PM.
   - 👀 *Visual changes need a decision*: look at the images. If they are what you meant, say so
     in the pull request; the PM (or you, once the PM agrees) adds the label
     **`accept-visuals`**, and the check re-runs and goes green. If something changed that you
     did not mean, fix it and push again.
   - ❌ *Failed to render*: a story or screen crashed. Fix it first.
8. **The PM approves and merges.** You are tagged; it goes live when Vanessa makes it live.

---

## I need… (so you do not have to ask)

| Situation | What to do |
|---|---|
| A colour / spacing / size that no token covers | Do not hard-code it. Say so in your pull request; Vanessa adds it in Figma and it arrives as a "Figma token update" pull request. |
| The Figma design and the app disagree | Figma wins for design. If you think Figma is wrong, comment on the frame in Figma. |
| A screen is not in Figma yet | Build it from existing Storybook parts and the rules; say "no Figma frame yet" in the pull request so the PM looks closely. |
| The visual check shows a change I did not make | Pull `main` into your branch; someone else's change may have landed. If it persists, mention it in the pull request. |
| I added a new story and it shows as "New" | Expected. It is accepted with `accept-visuals` like any change. |
| Can I generate the approved screenshots myself? | **No.** They are only made on GitHub's runner (fonts render differently on laptops). Use the label. |
| Which tokens package? | **`nxus-tokens`**. The older `@lighthousesports/nxus-ui` has an outdated token copy. |

---

## Working with an AI agent

Agents can read Figma directly. A good request looks like:

> Build the Video Manager **Overview** tab from this Figma frame: *(paste the frame link from the
> Video Manager page)*. Use only existing components from Storybook and token classes from
> `nxus-tokens`; follow `guidelines/Guidelines.md`. Add or update the stories for anything you
> change, then run `npm run lint:tokens` and `npm run test:e2e`.

You still own the result: read the Visual check comment before asking for review.

---

More detail on the automation (settings, how the checks are built, how to copy them into the
real app): `docs/review-pipeline.md` and `docs/figma-sync.md`.
