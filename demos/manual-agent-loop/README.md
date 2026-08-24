# Manual agentic loop — the human is the runtime

A workshop demo (deck §4 opener) that strips the magic off "AI agents." An agent
framework is just a **loop**: the model *requests* tool calls, a runtime *executes*
them and appends the results, and it repeats until the model stops asking and
answers. Here **you** are the runtime — you run each tool by hand and paste the
result back. The task is planning a family dish (chicken adobo).

## Setup — pick a provider (auto-detected from `.env`)
**OpenRouter free (recommended — no cost):** get a free key at openrouter.ai/keys and put
`OPENROUTER_API_KEY=sk-or-...` in the repo-root `.env`. Defaults to model
`nvidia/nemotron-3-super-120b-a12b:free` (✔ verified: responsive, clean `tool_calls`).
Alternatives via `OX_MODEL`: `nvidia/nemotron-3-ultra-550b-a55b:free`, `google/gemma-4-31b-it:free`.
Note: `z-ai/glm-5.2:free` is often rate-limited (429) on the shared pool. Free tier ≈ 20 req/min, 50 req/day.

**Ox Alpha via Tokenra:** `OX_FREE_API_TOKEN=...` in `.env` (needs account quota, else 403).

The scripts use OpenRouter automatically when `OPENROUTER_API_KEY` is set, else Tokenra.
For the curl path, set the `model` field in the `.request.json` to match your provider.

## Two ways to run it
**A. Interactive (recommended for stage):** `python3 agent_loop.py`
Prints the outgoing payload each turn (watch the `messages` array grow), shows the
tool calls the model requests, and prompts you to type each tool result. Loops until
the model returns a final answer with no tool calls. Stdlib only.

**B. By hand with curl — you are the runtime:** see [`wire/`](wire/README.md).
A series of `.json` files you POST in order — `./send.sh wire/turn-1.json`, then
`turn-2.json`, then `turn-3.json`. Each carries the whole conversation so far **except one
blank**: the newest tool result, which **you paste in** before sending. `result-1.json` /
`result-2.json` are ready-made answers; `wire/model-sees.txt` shows the JSON flattened into
the single text stream the model actually reads. The lesson: **the model asks for a tool,
you paste the result and resend — the "agent" is only that loop.**

## The four teaching beats
1. The AI **requests** tools; it never runs them.
2. The "agent" is a **while-loop** resending a growing transcript.
3. `role:"tool"` results (tied by `tool_call_id`) are how the world talks back.
4. **Termination is the model's call** (`stop`, no more `tool_calls`), not ours.

## Tools (toy, on purpose)
`get_recipe(dish)` · `check_pantry(items[])` · `set_timer(minutes,label)` — trivial so
attention stays on the loop, not the tools.

## Status
✔ **Ran live end-to-end** on OpenRouter free (`nvidia/nemotron-3-super-120b-a12b:free`)
2026-08-24, both paths — the `wire/` curl walkthrough (turn 1 → `get_recipe`, turn 2 →
`check_pantry`, turn 3 → final plan, `finish_reason: stop`) and the interactive script.
Evidence: `SAMPLE-RUN.md`. Needs a valid free `OPENROUTER_API_KEY` in the repo `.env`.
