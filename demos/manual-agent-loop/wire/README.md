# Wire-format agent loop — turn-by-turn JSON walkthrough

An "AI agent" is not magic. You **POST a request and get a reply back**, over and over. The "agent" is just **the model asking for a tool → you append the result → you resend → repeat** until the model stops asking and gives you an answer.

These `.json` files show exactly that — pure JSON payloads, turn by turn, so you see the loop's structure with zero abstraction.

## Two ways to send them

### Option A: the send script (recommended)
Run from `demos/manual-agent-loop/`:
```bash
bun send.mjs wire/turn-0.json
bun send.mjs wire/turn-1.json
bun send.mjs wire/turn-2.json
```
Each writes the reply next to the request as `<name>.response.json`.

### Option B: Manual curl (you see the network call)
```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d @turn-0.json
```

## The files, in order

| File | What it shows | Your role |
|------|---------------|-----------|
| **turn-0.json** | One API call, no tools — "AI is enough" | Send it; see the model's direct answer |
| **turn-1.json** | First request with tools defined | Send; the model asks for a tool call |
| **turn-2.json** | Turn 1 + model's request + **blank** for tool result | Fill in the result; resend |
| **turn-3.json** | Turn 2 + second tool request + **blank** for result | Fill in; resend |
| **result-1.json** | Pre-made answer for turn 1's tool call | Copy-paste into turn-2.json's blank |
| **result-2.json** | Pre-made answer for turn 2's tool call | Copy-paste into turn-3.json's blank |
| **model-sees.txt** | The JSON flattened into the text stream the model reads | Reference; shows how roles/content merge into one flow |

## The progression

**Turn 0 (no tools):**
```json
{
  "model": "...",
  "messages": [{"role": "user", "content": "Who are you?"}]
}
```
→ Model replies directly. **This shows "AI alone is enough."**

**Turns 1–3 (with tools):**
1. Send turn-1.json → Model sees tools, asks for one
2. Fill turn-2.json's blank with the tool result → Resend
3. Model asks for another tool
4. Fill turn-3.json's blank → Resend
5. Model says "done" (no more tool_calls)

**The teaching:** The "agent loop" is just appending messages and resending. No magic. The model stays dumb (it can't run tools, only ask for them). You (or a framework) run the tools and feed results back.

## Running it live

### Step 1: Set your API key
```bash
export OPENROUTER_API_KEY=sk-or-... # from openrouter.ai/keys
# OR for Laguna free:
export LAGUNA_API_KEY=... # if you're using the Laguna provider
```

### Step 2: Send turn-0
With the send script (from `demos/manual-agent-loop/`):
```bash
bun send.mjs wire/turn-0.json
```

With curl:
```bash
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d @turn-0.json
```

See? The model answers directly (no tool requests). That's it — one call. **AI is enough on its own.**

### Step 3: Send turn-1 (with tools)
Same command, different file. Now the model sees the tools and asks for one.

### Steps 4–5: Fill in results, resend
Open turn-2.json. Find the line:
```json
">>> YOU FILL THIS IN: paste the get_recipe result here <<<"
```

Replace it with the tool's output (from `result-1.json` or your own answer). Save. Send again.

Repeat for turn-3.json.

## The idea to leave with

```
turn-1.json (request + tools)
  ↓
model asks: "call get_recipe"
  ↓
turn-2.json (turn-1 + model's call + your result)
  ↓
model asks: "call check_pantry"
  ↓
turn-3.json (turn-2 + model's call + your result)
  ↓
model says: "Here's your plan" (no more tool_calls)
  ↓
Done.
```

That's the agent. No mystery. The text grows, the model responds, the loop repeats.

## Notes

- **tool_call_id:** Placeholders here (`call_1_recipe`). Live models generate IDs; the rule is: a `tool` message's ID must match the `assistant` call it answers.
- **Tools are resent every turn:** The model is stateless. The text is the only memory. Every file includes all prior turns.
- **Verified live 2026-08-24** on OpenRouter free (`nvidia/nemotron-3-super-120b-a12b:free`):
  - turn-0: Direct answer ✔
  - turn-1 → turn-2: `get_recipe` call ✔
  - turn-2 → turn-3: `check_pantry` call ✔
  - turn-3: Final answer, `finish_reason: stop` ✔

## File reference

```
wire/
├── turn-0.json        ← One call, no tools (start here)
├── turn-1.json        ← First request with tools
├── turn-2.json        ← Result blank for turn-1
├── turn-3.json        ← Result blank for turn-2
├── result-1.json      ← Pre-made get_recipe answer
├── result-2.json      ← Pre-made check_pantry answer
├── model-sees.txt     ← The JSON as text stream
├── send.mjs           ← Old helper (deprecated; use BlitzPi instead)
└── README.md          ← This file
```

**Start with turn-0.json. Send it. See "AI is enough".**
