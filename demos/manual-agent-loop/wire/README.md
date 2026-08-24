# It's just text — the fill-in-the-blank curl walkthrough

An "AI agent" is not magic wiring. You **POST a request and get a reply back**, over and
over, and *you* are the runtime: each turn the model asks for a tool, **you paste the
result in**, and you resend the whole conversation. These `.json` files let the room do
exactly that by hand.

Run each turn with the sender (auto-reads your key from the repo `.env`):

```
../send.sh turn-1.json     # -> writes turn-1.response.json
# read the reply: the model asks to call get_recipe
../send.sh turn-2.json     # after you fill in the get_recipe result
../send.sh turn-3.json     # after you fill in the check_pantry result
```

## The one manual step per turn
Each `turn-N.json` already carries the whole conversation so far **except one blank** —
the newest tool result, marked:

```
">>> YOU FILL THIS IN: paste the ... result here <<<"
```

Open the file, replace that string with the tool's output, save, send. That's the loop.
`result-1.json` and `result-2.json` are ready-made answers you can paste (or write your
own and watch the model's plan change).

## What each file is
| File | What it is |
|---|---|
| `turn-1.json` | The whole first request: system prompt + tools + your question |
| `turn-2.json` | Turn 1 + the model's `get_recipe` call + **a blank** for its result |
| `turn-3.json` | Turn 2 (result filled) + the model's `check_pantry` call + **a blank** for its result |
| `result-1.json` / `result-2.json` | Ready-made tool outputs to paste into the blanks |
| `model-sees.txt` | The JSON flattened into the single **text** stream the model actually reads |
| `turn-N.response.json` | The model's reply — created when you run `send.sh` |

## The idea to leave with
Look at `turn-1 → turn-2 → turn-3` in order. The "agent" is just:

> **the model asks for a tool → you append the result → you resend the whole thing →
> repeat, until the model writes an answer instead of another tool call.**

The JSON roles and `tool_calls` are only an envelope; `model-sees.txt` shows what's
underneath — one growing text transcript in, more text out.

## Notes
- `tool_call_id`s here are readable placeholders (`call_1_recipe`). A live model makes its
  own ids; the only rule is a `tool` message's id matches the `assistant` call it answers
  **within the same file** — so these files run as-is once you fill the blank.
- Tools are resent every turn — the model is stateless; the text is the only memory.
- **Verified live 2026-08-24** on OpenRouter free (`nvidia/nemotron-3-super-120b-a12b:free`):
  turn 1 → `get_recipe`, turn 2 → `check_pantry`, turn 3 → final plan (`finish_reason: stop`).
