/**
 * NXUS Figma publish relay.
 *
 * Figma publishes the QAZA_FE library -> this Worker -> GitHub repository_dispatch
 * -> .github/workflows/figma-published.yml opens a "snapshot is stale" issue.
 *
 * WHY A RELAY EXISTS AT ALL
 * Step 5 of docs/figma-sync.md deliberately dropped the Worker: the export plugin
 * could call api.github.com itself, because a human was sitting in the editor to
 * type a token into figma.clientStorage. A webhook has neither. Figma POSTs a
 * fixed body to a URL and cannot send custom headers, while repository_dispatch
 * requires an authenticated POST. Something has to hold the credential, and the
 * repository is public, so it cannot be the repository.
 *
 * WHAT THIS DOES NOT DO
 * It never reads variables. A webhook says THAT the file changed, never WHAT
 * changed -- only the plugin can read variables, and a plugin needs a human in
 * the editor. So the output is a nudge to run the export, not the export.
 */

/** Constant-time string compare, so a wrong passcode leaks nothing by timing. */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Did this publish touch any variables?
 *
 * LIBRARY_PUBLISH carries created/modified/deleted arrays for components, styles
 * AND variables. A publish that only moved a component should not raise a token
 * issue -- that is the difference between a useful nudge and noise nobody reads.
 *
 * Fails SAFE: if the variable keys are absent entirely (an older payload shape, a
 * future rename), we assume variables may have moved and notify anyway. A
 * spurious issue is recoverable; a silently stale snapshot is the exact failure
 * this whole pipeline exists to remove.
 */
function touchedVariables(body) {
  const keys = ['created_variables', 'modified_variables', 'deleted_variables'];
  const present = keys.filter((k) => Array.isArray(body[k]));
  if (present.length === 0) return { touched: true, reason: 'payload carried no variable arrays — notifying to be safe' };
  const total = present.reduce((n, k) => n + body[k].length, 0);
  return total > 0
    ? { touched: true, reason: `${total} variable change(s) in the publish` }
    : { touched: false, reason: 'publish touched components/styles only, no variables' };
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('This endpoint only accepts POST from Figma.\n', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response('Body was not valid JSON.\n', { status: 400 });
    }

    // Authenticate BEFORE anything else is inspected or logged.
    if (!safeEqual(body.passcode || '', env.FIGMA_PASSCODE || '')) {
      return new Response('Forbidden.\n', { status: 403 });
    }

    // Figma sends PING once when the webhook is registered. Registration fails
    // unless this answers 200, so it is handled before any event filtering.
    if (body.event_type === 'PING') {
      return new Response('pong — NXUS figma relay is listening.\n', { status: 200 });
    }

    if (body.event_type !== 'LIBRARY_PUBLISH') {
      return new Response(`Ignored event_type ${body.event_type}.\n`, { status: 200 });
    }

    // The webhook is registered against the team, so other files on Lighthouse
    // Sports reach this endpoint too, and only QAZA_FE drives the token pipeline.
    //
    // But this filter DELIBERATELY DOES NOT DROP on a mismatch, and that needs
    // explaining. LIBRARY_PUBLISH reports the key of the published *library*, and
    // it has never been observed here -- no real publish has happened yet. If the
    // library key turns out to differ from the design file key, a hard filter
    // would silently swallow every genuine publish, and the symptom would be
    // "the webhook does nothing", which points at the Worker rather than at the
    // one line of config that is actually wrong.
    //
    // So a mismatch is passed through and labelled. One real publish then shows
    // exactly what Figma sends, and the filter can be tightened to a hard drop
    // with evidence instead of a guess.
    const expectedKey = env.FIGMA_FILE_KEY || null;
    const keyMatches = !expectedKey || body.file_key === expectedKey;

    const { touched, reason } = touchedVariables(body);
    if (!touched && keyMatches) {
      return new Response(`Ignored: ${reason}.\n`, { status: 200 });
    }

    const note = keyMatches
      ? reason
      : `UNVERIFIED FILE KEY — expected ${expectedKey}, got ${body.file_key}. `
        + `Passing through so one real publish can settle it; tighten the filter afterwards. (${reason})`;

    const dispatch = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          // GitHub rejects requests with no User-Agent.
          'User-Agent': 'nxus-figma-webhook',
        },
        body: JSON.stringify({
          event_type: 'figma-published',
          client_payload: {
            file_key: body.file_key || null,
            file_name: body.file_name || null,
            timestamp: body.timestamp || null,
            triggered_by: (body.triggered_by && body.triggered_by.handle) || null,
            description: body.description || '',
            reason: note,
            file_key_matched: keyMatches,
          },
        }),
      },
    );

    if (!dispatch.ok) {
      // Surface the status to Figma's webhook log. Figma retries failures, which
      // is what we want -- but never echo the response body, which can contain
      // request context we would rather not mirror back out.
      return new Response(`GitHub dispatch failed with ${dispatch.status}.\n`, { status: 502 });
    }

    // Echo the note, not the bare reason, so a key mismatch is visible in Figma's
    // own webhook delivery log as well as in the issue.
    return new Response(`Dispatched to GitHub — ${note}\n`, { status: 202 });
  },
};
