# Wire-format agent loop — the loop is just JSON

A workshop demo (deck §4 opener) that strips the magic off "AI agents." An agent is just a **loop**: the model *requests* tool calls, you *append the results*, resend the whole conversation, and repeat until the model stops asking and gives you an answer.

See the loop as pure JSON — no abstractions, no scripts. Start with **turn-0** (no tools — "AI is enough") → then **turn-1 through turn-3** (watch the tool loop unfold).

## Start here: turn-0 (no tools)

```bash
export OPENROUTER_API_KEY=sk-or-...  # from openrouter.ai/keys
bun send.mjs wire/turn-0.json
```

One API call. Model answers directly. **That's all "AI" needs to be useful.**

## Then: turn-1 through turn-3 (with tools)

```bash
bun send.mjs wire/turn-1.json       # Model sees tools, asks for one
# Output tells you which tool it wants
bun send.mjs wire/turn-2.json       # Resend with the first result filled in
bun send.mjs wire/turn-3.json       # Resend with the second result filled in
# Model says "done"
```

See [`wire/README.md`](wire/README.md) for step-by-step walkthrough.

## API provider

**OpenRouter free (recommended):** Get a key at https://openrouter.ai/keys. Free, no card.
```bash
export OPENROUTER_API_KEY=sk-or-...
```

**Laguna free (optional):** If available, same key setup.
```bash
export LAGUNA_API_KEY=...
```

BlitzPi auto-detects which key you have set and uses it.

## The lesson

```
Send turn-0 (one call, no tools) → Model answers
Send turn-1 (same call + tools defined) → Model asks for a tool
Fill the result → Send turn-2 → Model asks for another tool
Fill the result → Send turn-3 → Model says "done"
```

That's the agent. The "loop" is just **model asks → you append result → resend → repeat**.

## Tools (toy, on purpose)

`get_recipe(dish)` · `check_pantry(items[])` · `set_timer(minutes,label)` — trivial so attention stays on the loop structure, not the tool complexity.

## Status

✔ **Verified live 2026-08-24** on OpenRouter free (`nvidia/nemotron-3-super-120b-a12b:free`):
- turn-0: Direct answer ✔
- turn-1 → turn-2: `get_recipe` tool call ✔  
- turn-2 → turn-3: `check_pantry` tool call ✔
- turn-3: Final answer, model stops asking ✔

Evidence: `SAMPLE-RUN.md` (old). New wire/ walkthrough: see `wire/README.md`.
