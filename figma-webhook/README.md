# The publish relay

A Cloudflare Worker. Figma publishes QAZA_FE → this → a GitHub issue saying the
token snapshot is stale and the export needs running.

It is the last piece of the pipeline in [`../docs/figma-sync.md`](../docs/figma-sync.md),
and it is the smallest one. It reads nothing, decides nothing, and stores nothing.

## Why a Worker exists here when step 5 dropped it

Step 5 removed the Worker on purpose: the export plugin could call `api.github.com`
directly, because a human was sitting in the Figma editor to type a token into
`figma.clientStorage`, which is per-user and sandboxed and never enters this
repository.

A webhook has no human and no client storage. Figma POSTs a fixed body to a URL and
**cannot send custom headers**, while `repository_dispatch` requires an
authenticated POST. Something has to hold that credential, and this repository is
public — so it cannot be the repository.

## What it will and will not do

It fires only when **all** of these hold:

- the request is a POST carrying the right `passcode`
- `event_type` is `LIBRARY_PUBLISH` (a `PING` gets a 200 and nothing else)
- `file_key` is QAZA_FE
- the publish actually touched a variable — a components-only publish is ignored

That last filter is the difference between a nudge and noise. If the payload
carries no variable arrays at all, it notifies anyway: a spurious issue is
recoverable, a silently stale snapshot is the failure this pipeline exists to remove.

**It never reads variables.** A webhook says *that* the file changed, never *what*.
Reading variables needs the plugin, and a plugin needs a human in the editor. So the
output is a nudge to run the export, never a pull request.

## Deploy

From this directory.

```
npx wrangler deploy
```

Then set the two secrets. They are never committed:

```
npx wrangler secret put FIGMA_PASSCODE
npx wrangler secret put GITHUB_TOKEN
```

- **`FIGMA_PASSCODE`** — any long random string. Generate one and keep it; you pass
  the *same* value when registering the webhook.
- **`GITHUB_TOKEN`** — a **fine-grained** PAT scoped to this one repository, with
  **Contents: read and write** and nothing else. That is the minimum
  `repository_dispatch` accepts. It does not need Issues — the workflow opens the
  issue with its own token.

Note the `*.workers.dev` URL the deploy prints. That is the endpoint.

## Register the webhook

```
FIGMA_TOKEN=<pat>  FIGMA_PASSCODE=<same value as above> \
WEBHOOK_ENDPOINT=https://nxus-figma-webhook.<subdomain>.workers.dev \
node ../scripts/figma-webhook-register.mjs --register
```

The `FIGMA_TOKEN` here needs `webhooks:read` and `webhooks:write`. The script checks
for an existing hook on the same endpoint before creating one, so running it twice
is safe — without that check you get two hooks, every publish fires twice, and the
workflow's dedupe is the only thing between you and duplicate issues.

Figma sends a `PING` the moment you register. The Worker answers it with 200. If
registration reports the endpoint as unreachable, the Worker is not deployed yet.

Inspect or remove:

```
node ../scripts/figma-webhook-register.mjs --list
node ../scripts/figma-webhook-register.mjs --delete <webhook_id>
```

## Testing it without publishing anything

The workflow also accepts `workflow_dispatch`, so the issue-raising half can be
exercised on its own:

```
gh workflow run "Figma published"
```

That runs the freshness check, the dedupe and the issue body against real data
without touching Figma.

## The failure mode this does not fix

`LIBRARY_PUBLISH` only fires when you publish. If you change a variable and never
publish, no nudge arrives.

That is covered elsewhere and deliberately: `scripts/figma-freshness.mjs` runs in CI
on **every push** and fails when Figma's `lastModified` is newer than the snapshot's
`_verified` stamp. So publishing gives the fast, deliberate nudge; the freshness
check is the slow backstop that catches an edit you never published. Neither is
load-bearing alone.
