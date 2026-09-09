# Figma → GitHub: how a token sync would actually work

> Status: **design note, nothing built.** Written so the decision can be made before
> any code exists. Last updated 7 Sep 2026.

## The short version

There is no button that makes Figma edit the repo. What is realistic is a **one-way
pipeline that turns a Figma variable change into a pull request**, which a human then
reads and merges. That is not a compromise — it is the correct shape, because a token
change is a design decision and the repo's own rule is that drift is *raised as a
question, never synced silently*.

Everything below is about building that PR reliably.

---

## What exists today

Two files, and a human:

| Piece | What it does |
|---|---|
| `scripts/figma-tokens.json` | A committed snapshot of the Figma variables — Qaza, Allias, Mapped, Responsive |
| `scripts/figma-css-diff.mjs` | Compares that snapshot against `src/styles/globals.css` and reports match / drift / figma-only |
| A person | Reads Figma, updates the snapshot, runs the diff |

Today it reports **68 match · 0 drift · 0 figma-only · 0 ramp drift**.

Be clear about the limitation when you explain this: **the diff trusts the snapshot and
cannot detect its own staleness.** If someone changes a variable in Figma right now,
the diff keeps saying "0 drift" until a human re-reads Figma. It is a drift *detector*
with a manual refresh, not a pipeline.

---

## The three shapes this could take

### A. Scheduled pull — a robot asks Figma every night — **RULED OUT 9 Sep 2026**

```
cron ──> GitHub Action ──> Figma REST API ──> regenerate snapshot ──> diff ──> open PR
```

The cleanest design, and the one most teams describe. It needs the **Variables REST
API** (`GET /v1/files/:key/variables/local`).

**Tested, and it is not available on this plan.** The scope list when generating a
personal access token on Pro is, in full:

```
Users        current_user:read
Files        file_comments:read/write · file_content:read · file_metadata:read
             file_versions:read
Design sys.  library_assets:read · library_content:read · team_library_content:read
Development  file_dev_resources:read/write
Folders      folders:read
Webhooks     webhooks:read · webhooks:write
```

There is **no variables scope at all** — not mis-named, not hidden. The endpoint returns
`403 Invalid scope(s)` because no grantable scope unlocks it. Absence of the checkbox is
stronger evidence than the 403 itself: this is an Enterprise feature, and no amount of
token configuration will reach it.

What *was* proven, and it is the part that mattered: **GitHub Actions can authenticate
to Figma and read this file on Pro.** `GET /v1/files/:key/meta` returns 200. That is why
step 1 below works.

### B. Plugin push — the designer publishes, and a PR appears

```
Figma ──> "Export tokens" plugin ──> repository_dispatch ──> Action ──> open PR
```

A small Figma plugin reads the variables through the **Plugin API** — the same API this
repo already drives — serialises them into the `figma-tokens.json` shape, and calls a
GitHub webhook. The Action regenerates the snapshot, runs the diff, and opens a PR if
anything moved.

**This works on Pro.** The Plugin API has no tier gate; that is how the existing
snapshot was produced. It needs a click, but the click lands exactly where design intent
settles — the moment someone publishes a change.

#### B+ — a webhook removes the "designer forgets" failure mode

The scope list has **`webhooks:write`**, which I had not accounted for. Figma can call a
URL when the library is published:

```
Figma publish ──> webhook ──> Cloudflare Worker ──> repository_dispatch ──> Action
```

A Worker is the natural relay because Cloudflare already hosts this project, and because
GitHub will not accept an arbitrary webhook — `repository_dispatch` needs an
authenticated POST, so something has to hold that credential.

**Be precise about what this does and does not buy.** A webhook says *that* the file
changed, never *what* changed — reading the variables still needs the plugin, because a
plugin needs a human in the editor. So it does not make the loop hands-free. What it
does is kill the top failure mode in the table above: instead of a snapshot quietly
ageing until someone notices, a publish immediately opens an issue saying "Figma was
published, the snapshot is now stale, run the export."

Worth doing *after* the plugin, not before. Without the plugin there is nothing for the
notification to prompt.

### C. What we do now — an agent reads Figma on request

Works, is accurate, and costs a person's attention every time. Fine for a migration,
wrong as a steady state.

---

## Recommended: B, and why

1. **It runs on the plan you already have.** No upgrade, no procurement conversation.
2. **The trigger is meaningful.** A nightly cron syncs half-finished exploration; a
   publish is someone saying "this is ready".
3. **It fails safe.** No token, no network, plugin not run — the repo simply keeps the
   last known-good snapshot. Nothing silently rots.
4. **It produces a PR, never a push.** Which is the rulebook's own governance model,
   expressed as a mechanism.

---

## What the PR would contain

A single commit touching, at most:

- `scripts/figma-tokens.json` — the refreshed snapshot
- `src/styles/globals.css` — **only** where a Mapped role's value changed
- the diff output, pasted into the PR body so the reviewer sees what moved and why

CI already runs the token lint, 20 Playwright tests, the app build and the Storybook
build on every PR. A token change that breaks a Law fails before anyone looks at it.

---

## What it can never do

Say these out loud to the devs, because each one is a question that will otherwise come
up mid-build:

- **It cannot decide who wins.** The governing rule is that Figma owns *naming and
  structure*, the code owns *values*. A machine cannot tell "the designer corrected a
  hex" from "someone nudged a swatch by accident". The PR surfaces it; a person rules.
- **It cannot see a rename.** A variable renamed in Figma looks exactly like one deleted
  and another added. The PR will show both; a human maps them.
- **It is one-way.** Code → Figma is a different, harder problem and is not in scope.
  Writing to Figma stays a deliberate act, as it was for the 8 variables added this week.
- **It cannot verify what the change looks like.** Only 44 of 113 app files are reachable
  from the router, so the computed-style snapshot cannot see most components. A green PR
  means the tokens are consistent, not that every screen still looks right.

---

## Failure modes worth designing for

| Failure | What happens | Mitigation |
|---|---|---|
| Plugin not run after a publish | Snapshot goes stale silently — today's exact problem | Stamp `_verified` with a date; have CI warn when it is older than N days |
| GitHub token leaks from the plugin | Anyone can open PRs on the repo | Use a fine-grained token, contents+PR scope only, one repo |
| Figma rate limits | Export fails midway | Pro + Full seat is 200 MCP calls/day, 15/min; a plugin export is one call and is not affected |
| Two people publish at once | Competing PRs | Overwrite a single long-lived `figma-sync` branch rather than branching per run |
| A value changes that no code uses | Noisy PR nobody wants to merge | Diff only the 41 roles in `_cssPair`; ignore the rest of the collection |

---

## Build order

### Step 1 — truthful staleness — **BUILT, needs one secret**

`scripts/figma-freshness.mjs` asks Figma when the file last changed and compares that
to the snapshot's `_verified` stamp. This is the highest value per unit of work in the
whole plan: it turns *"the snapshot claims it is fresh"* into *"Figma agrees it is
fresh"*, and it needed no plugin.

It runs in CI already and is a **no-op until `FIGMA_TOKEN` exists**. To switch it on:

1. Figma → your avatar → **Settings → Security → Personal access tokens → Generate**.
   Give it the smallest scope that reads file metadata. It never reads variables or
   node content — only the file's name and `lastModified`.
2. GitHub → the repo → **Settings → Secrets and variables → Actions → New repository
   secret**. Name it exactly `FIGMA_TOKEN`.
3. Push anything. The `Token lint + Figma drift` job will report either the real
   comparison, or a 401/403 saying the scope or plan is the problem.

Behaviour, all five paths tested:

| Situation | Result |
|---|---|
| No token | Skips, says so, exits 0 |
| Token rejected (401 — wrong or **expired**) | **FAIL** — regenerate it |
| Scope or plan forbids it (403) | Reports why, exits 0 |
| Figma older than the snapshot | PASS |
| Figma edited the same day | PASS — deliberately conservative |
| Figma newer than the snapshot | **FAIL**, naming how many days |

The 401/403 split is the point: **403 is a plan or scope limit nobody can fix from a pull
request, so it must not go red. 401 means the token is wrong or expired, which somebody
can fix** — and skipping it would leave freshness unchecked while CI stayed green, which
is the silence this whole script exists to remove.

So pick a **90-day expiry, or none**. A one-day token would fail the build tomorrow.

### Step 2 — verify the plan question

Try the **Variables** REST endpoint with the same token. If it returns 200, shape A
(scheduled pull) becomes available and is less work than the plugin. A 403 confirms the
Enterprise gate and settles the design. Worth doing at the same time as step 1, since
the token is already in hand.

### Step 3 — the plugin export

Write it, and prove its output is **byte-identical** to the committed
`figma-tokens.json`. Until that matches, nothing downstream can be trusted.

### Step 4 — the Action that opens the PR

`repository_dispatch` → regenerate → diff → open a PR against a single long-lived
`figma-sync` branch.

### Step 5 — wire the plugin's network call

The only step that needs a second secret, and the last one, so everything before it is
testable without one.

---

## The honest summary for the devs

> We have a reliable *detector* and a manual refresh. Making it automatic is a small
> Figma plugin plus one GitHub Action, and the output is a pull request rather than a
> commit — deliberately, because deciding whether Figma or the code is right is a design
> judgement, not something a script should settle.
