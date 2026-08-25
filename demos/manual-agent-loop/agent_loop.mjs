#!/usr/bin/env node
// Manual agentic loop — the human is the runtime.
//
// Shows how an agent framework actually works: the model REQUESTS tool calls, a
// runtime EXECUTES them and feeds results back, and the loop repeats until the
// model stops asking and answers. Here that runtime is you, typing tool results by
// hand. Node built-ins only (global fetch + readline) — runs in a fresh Codespace,
// no npm install.
//
// Providers (auto-detected):
//   * If OPENROUTER_API_KEY is set -> OpenRouter free (base openrouter.ai/api/v1,
//     default model nvidia/nemotron-3-super-120b-a12b:free).
//   * Else -> Ox Alpha via Tokenra (base tokenra.io/v1, model stealth/ox-alpha),
//     key from OX_FREE_API_TOKEN.
//   Override either with OX_BASE_URL / OX_MODEL.
import { createInterface } from 'node:readline/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load the repo-root .env if present so it "just works" locally. In Codespaces the
// key arrives as a real env var (the OPENROUTER_API_KEY secret), so this is a no-op.
loadEnv(join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.env'));

const { OPENROUTER_API_KEY, OX_BASE_URL, OX_MODEL, OX_FREE_API_TOKEN } = process.env;
const [BASE, MODEL, TOKEN] = OPENROUTER_API_KEY
  ? [OX_BASE_URL || 'https://openrouter.ai/api/v1',
     OX_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free', OPENROUTER_API_KEY]
  : [OX_BASE_URL || 'https://tokenra.io/v1',
     OX_MODEL || 'stealth/ox-alpha', OX_FREE_API_TOKEN];

const SYSTEM =
  'You are a home-cooking assistant helping plan a family dish. Use the provided ' +
  'tools to fetch the recipe, check the pantry, and set timers before answering. ' +
  'Do not invent recipe details you can get from a tool. When you have enough from ' +
  'the tools, give the final plan.\n\n' +
  'Keep a short ledger at the top of every reply:\n' +
  'GOAL: <one line> | DONE: <tool results so far> | NEXT: <next step> | OPEN: <unknowns>';

// Toy tools the human executes by hand. Trivial on purpose — the point is the LOOP.
const TOOLS = [
  { type: 'function', function: {
    name: 'get_recipe',
    description: 'Return ingredients and steps for a named dish.',
    parameters: { type: 'object',
      properties: { dish: { type: 'string', description: "e.g. 'chicken adobo'" } },
      required: ['dish'] } } },
  { type: 'function', function: {
    name: 'check_pantry',
    description: 'Check which of the given ingredients are in stock at home.',
    parameters: { type: 'object',
      properties: { items: { type: 'array', items: { type: 'string' } } },
      required: ['items'] } } },
  { type: 'function', function: {
    name: 'set_timer',
    description: 'Start a kitchen timer.',
    parameters: { type: 'object',
      properties: { minutes: { type: 'integer' }, label: { type: 'string' } },
      required: ['minutes', 'label'] } } },
];

async function post(messages) {
  let res;
  try {
    res = await fetch(`${BASE.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, messages, tools: TOOLS, tool_choice: 'auto' }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch (e) {
    console.log(`\n[network error] ${e.cause?.message || e.message} — check your connection and OX_BASE_URL`);
    process.exit(1);
  }
  if (!res.ok) {
    console.log(`\n[HTTP ${res.status}] ${(await res.text()).slice(0, 500)}`);
    process.exit(1);
  }
  return res.json();
}

function showPayload(messages, turn) {
  const bar = '='.repeat(70);
  console.log(`\n${bar}\n  TURN ${turn} — sending this payload (watch the messages array grow)\n${bar}`);
  console.log(JSON.stringify({ model: MODEL, messages, tools: '<3 tools>' }, null, 2));
}

// Minimal .env reader: KEY=VALUE lines, ignores comments/blanks, never overrides a
// value already in the environment. No dependency — the point is zero-install.
function loadEnv(path) {
  let text;
  try { text = readFileSync(path, 'utf8'); } catch { return; } // no .env — fine
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

if (!TOKEN) {
  console.error('No API key found. Set OPENROUTER_API_KEY (a Codespace secret, or in the repo-root .env).');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const task = process.argv.slice(2).join(' ') ||
  'I want to cook chicken adobo for the family tonight. Walk me through it.';
const messages = [
  { role: 'system', content: SYSTEM },
  { role: 'user', content: task },
];

for (let turn = 1; turn <= 8; turn++) { // safety cap
  showPayload(messages, turn);
  const msg = (await post(messages)).choices[0].message;
  const calls = msg.tool_calls || [];

  if (calls.length === 0) { // model stopped asking for tools -> DONE
    const bar = '#'.repeat(70);
    console.log(`\n${bar}\n  MODEL FINAL ANSWER (no more tool calls = task complete)\n${bar}`);
    console.log(msg.content || '');
    break;
  }

  // Append the assistant message (with its tool_calls) verbatim.
  messages.push({ role: 'assistant', content: msg.content, tool_calls: calls });
  console.log(`\n>>> Model REQUESTED ${calls.length} tool call(s) — it did NOT run them. You do:`);
  for (const c of calls) {
    console.log(`\n  tool: ${c.function.name}\n  args: ${c.function.arguments}`);
    const result = await rl.question('  you (paste the tool result as text/JSON): ');
    messages.push({ role: 'tool', tool_call_id: c.id, name: c.function.name, content: result });
  }

  if (turn === 8) console.log('\n[hit safety cap of 8 turns]');
}

rl.close();
