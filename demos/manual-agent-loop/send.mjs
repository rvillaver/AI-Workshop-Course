#!/usr/bin/env node
// Send a request payload file to the chat-completions endpoint. The payload is just
// plain text (JSON) — open it in any editor. Saves the reply next to it as
// <name>.response.json, pretty-printed so it's readable in an editor too.
// Usage: node send.mjs wire/turn-1.json
// Node built-ins only, no npm install. Reads the key from the environment (a
// Codespace secret) or the repo-root .env, so it never appears on the command line.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

loadEnv(join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.env'));

const { OPENROUTER_API_KEY, OX_BASE_URL, OX_FREE_API_TOKEN } = process.env;
// Auto-detect provider: OpenRouter if its key is present, else Tokenra/Ox Alpha.
const BASE = (OX_BASE_URL || (OPENROUTER_API_KEY
  ? 'https://openrouter.ai/api/v1' : 'https://tokenra.io/v1')).replace(/\/$/, '');
const TOKEN = OPENROUTER_API_KEY || OX_FREE_API_TOKEN;

const req = process.argv[2];
if (!req) { console.error('pass a request .json file, e.g. node send.mjs wire/turn-1.json'); process.exit(1); }
const out = req.replace(/\.[^./]*$/, '') + '.response.json';

let res;
try {
  res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: readFileSync(req, 'utf8'),
    signal: AbortSignal.timeout(120_000),
  });
} catch (e) {
  console.error(`[network error] ${e.cause?.message || e.message} — check your connection and OX_BASE_URL`);
  process.exit(1);
}
const text = await res.text();
console.log(`[HTTP ${res.status}]  ->  ${out}`);

// Pretty-print the saved file so it's readable, not one long line. Keep the raw body
// if it isn't valid JSON (a stream chunk or a gateway error page).
try { writeFileSync(out, JSON.stringify(JSON.parse(text), null, 2) + '\n'); }
catch { writeFileSync(out, text); }
console.log(readFileSync(out, 'utf8'));

// Minimal .env reader: KEY=VALUE lines, never overrides a value already in the env.
function loadEnv(path) {
  let content;
  try { content = readFileSync(path, 'utf8'); } catch { return; }
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
