#!/usr/bin/env node
/**
 * Register (or inspect) the Figma LIBRARY_PUBLISH webhook that drives
 * .github/workflows/figma-published.yml.
 *
 *   node scripts/figma-webhook-register.mjs --list
 *   node scripts/figma-webhook-register.mjs --register
 *   node scripts/figma-webhook-register.mjs --delete <webhook_id>
 *
 * Environment:
 *   FIGMA_TOKEN      personal access token with webhooks:read + webhooks:write
 *   FIGMA_PASSCODE   shared secret; must equal the Worker's FIGMA_PASSCODE secret
 *   WEBHOOK_ENDPOINT https://nxus-figma-webhook.<subdomain>.workers.dev
 *
 * WHY A SCRIPT AND NOT A CURL
 * Registration is not a one-off. Rotating the passcode, moving the Worker, or
 * re-pointing after a subdomain change all mean re-registering, and each of those
 * is a moment to accidentally create a SECOND webhook rather than replace the
 * first -- at which point every publish fires twice and the dedupe in the
 * workflow is the only thing standing between you and duplicate noise. This
 * checks for an existing hook before creating one.
 *
 * QAZA_FE is on the Lighthouse Sports team, which is Pro tier, so webhooks are
 * available. Confirmed 30 Sep 2026. The other four teams on this account are
 * student tier and would not support this.
 */

const TEAM_ID = '1295615808664950815'; // Lighthouse Sports
const EVENT_TYPE = 'LIBRARY_PUBLISH';
const API = 'https://api.figma.com/v2/webhooks';

const token = process.env.FIGMA_TOKEN;
const passcode = process.env.FIGMA_PASSCODE;
const endpoint = process.env.WEBHOOK_ENDPOINT;

if (!token) {
  console.error('FIGMA_TOKEN is not set. It needs webhooks:read and webhooks:write.');
  process.exit(2);
}

const headers = { 'X-Figma-Token': token, 'Content-Type': 'application/json' };

/** Never print the token or the passcode, whatever the API echoes back. */
const redact = (o) => {
  const c = JSON.parse(JSON.stringify(o));
  const walk = (v) => {
    if (!v || typeof v !== 'object') return;
    for (const k of Object.keys(v)) {
      if (/passcode|token|secret/i.test(k)) v[k] = '<redacted>';
      else walk(v[k]);
    }
  };
  walk(c);
  return c;
};

async function call(url, init) {
  const res = await fetch(url, init);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* keep the raw text below */ }
  return { ok: res.ok, status: res.status, json, text };
}

async function list() {
  // The v2 API has moved from team_id to context/context_id. Try the current
  // shape first and fall back, rather than guessing which this plan is on.
  let r = await call(`${API}?context=team&context_id=${TEAM_ID}`, { headers });
  if (!r.ok) r = await call(`${API}?team_id=${TEAM_ID}`, { headers });
  if (!r.ok) {
    console.error(`Could not list webhooks — HTTP ${r.status}`);
    console.error(r.text.slice(0, 500));
    if (r.status === 403) {
      console.error('\n403 usually means the token lacks webhooks:read, or the team is not on a plan that allows webhooks.');
    }
    process.exit(1);
  }
  return (r.json && (r.json.webhooks || r.json.meta?.webhooks)) || [];
}

const args = process.argv.slice(2);

if (args.includes('--list')) {
  const hooks = await list();
  if (!hooks.length) {
    console.log('No webhooks registered for Lighthouse Sports.');
  } else {
    console.log(`${hooks.length} webhook(s):`);
    for (const h of hooks) console.log(' ', JSON.stringify(redact(h)));
  }
  process.exit(0);
}

const delIdx = args.indexOf('--delete');
if (delIdx !== -1) {
  const id = args[delIdx + 1];
  if (!id) { console.error('--delete needs a webhook id (see --list).'); process.exit(2); }
  const r = await call(`${API}/${id}`, { method: 'DELETE', headers });
  console.log(r.ok ? `Deleted webhook ${id}.` : `Delete failed — HTTP ${r.status}\n${r.text.slice(0, 300)}`);
  process.exit(r.ok ? 0 : 1);
}

if (!args.includes('--register')) {
  console.error('Pass --list, --register, or --delete <id>.');
  process.exit(2);
}

if (!passcode || !endpoint) {
  console.error('--register needs both FIGMA_PASSCODE and WEBHOOK_ENDPOINT set.');
  process.exit(2);
}

// Idempotency: never create a second hook pointing at the same endpoint.
const existing = (await list()).find(
  (h) => h.endpoint === endpoint && h.event_type === EVENT_TYPE,
);
if (existing) {
  console.log(`Already registered — webhook ${existing.id} points at this endpoint.`);
  console.log('Nothing to do. Use --delete first if you need to re-create it.');
  process.exit(0);
}

const payload = {
  event_type: EVENT_TYPE,
  endpoint,
  passcode,
  description: 'NXUS token pipeline — nudges GitHub to run the export after a publish',
};

// Same context/team_id fallback as the listing.
let r = await call(API, {
  method: 'POST',
  headers,
  body: JSON.stringify({ ...payload, context: 'team', context_id: TEAM_ID }),
});
if (!r.ok) {
  r = await call(API, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...payload, team_id: TEAM_ID }),
  });
}

if (!r.ok) {
  console.error(`Registration failed — HTTP ${r.status}`);
  console.error(r.text.slice(0, 500));
  if (r.status === 403) {
    console.error('\n403 here means the token lacks webhooks:write, or this team cannot use webhooks.');
  }
  process.exit(1);
}

console.log('Registered:', JSON.stringify(redact(r.json), null, 2));
console.log('\nFigma sends a PING immediately. The Worker answers it with 200;');
console.log('if registration reports the endpoint as unreachable, the Worker is not deployed yet.');
