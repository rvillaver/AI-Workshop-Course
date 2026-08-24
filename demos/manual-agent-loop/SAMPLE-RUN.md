# Sample run — captured evidence

✔ Real run 2026-08-24. Provider: OpenRouter free · model `nvidia/nemotron-3-super-120b-a12b:free`.
Task: *"I want to cook chicken adobo for the family tonight. Walk me through it."*
Tool results below were typed by the human (the runtime). This is the R13 verification artifact.

Re-verified via the `wire/` fill-in-the-blank curl path (POST `turn-1/2/3.json`, human pastes
each tool result): identical loop shape — turn 1 `get_recipe` → turn 2 `check_pantry` → turn 3
`finish_reason: stop` with the ledgered plan below. Both the script and the curl path pass.

## Turn 1 — messages in payload: 2 (system, user)
- `finish_reason: tool_calls` — **no answer yet**
- model REQUESTED: `get_recipe({"dish":"chicken adobo"})`
- human EXECUTED → `{"ingredients":["chicken","soy sauce","vinegar","garlic","bay leaves","black peppercorns","water","cooking oil"],"steps":[...]}`

## Turn 2 — messages in payload: 4 (+ assistant tool_call, + tool result)
- `finish_reason: tool_calls`
- model REQUESTED: `check_pantry({"items":[...8 ingredients...]})`
- human EXECUTED → `{"have":["chicken","soy sauce","garlic","cooking oil","black peppercorns"],"missing":["vinegar","bay leaves"]}`

## Turn 3 — messages in payload: 6
- `finish_reason: stop` — **model decided it's done** (did NOT call `set_timer`, only suggested it)
- Final answer opened with the GoodBehavior ledger:
  > **Goal:** Cook chicken adobo for the family tonight.
  > **Done:** Retrieved the recipe … checked the pantry — missing vinegar and bay leaves.
  > **Next:** Obtain the missing ingredients before cooking.
  > **Open:** Shop or substitute; set a 30-min timer at the simmer step.
- …followed by the step-by-step plan (have vs need, 4 steps, "Adobo simmer" 30-min timer suggestion).

## What it proves (the four beats)
1. The AI **requested** tools; it never ran them (empty `content`, `finish_reason: tool_calls`).
2. The loop = resending a **growing** `messages` array (2 → 4 → 6).
3. `role:"tool"` results (by `tool_call_id`) are how the world answers back.
4. **Termination was the model's call** (`stop`), not hard-coded.
