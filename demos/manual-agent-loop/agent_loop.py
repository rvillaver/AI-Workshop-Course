#!/usr/bin/env python3
"""Manual agentic loop — the human is the runtime.

Shows how an agent framework actually works: the model REQUESTS tool calls, a
runtime EXECUTES them and feeds results back, and the loop repeats until the
model stops asking and answers. Here that runtime is you, typing tool results by
hand. Stdlib only (urllib) — runs in a fresh Codespace, no pip install.

Providers (auto-detected):
  * If OPENROUTER_API_KEY is set -> OpenRouter free (base openrouter.ai/api/v1,
    default model z-ai/glm-5.2:free).
  * Else -> Ox Alpha via Tokenra (base tokenra.io/v1, model stealth/ox-alpha),
    key from OX_FREE_API_TOKEN.
  Override either with OX_BASE_URL / OX_MODEL.
"""
import json, os, sys, urllib.request, urllib.error

if os.environ.get("OPENROUTER_API_KEY"):
    BASE = os.environ.get("OX_BASE_URL", "https://openrouter.ai/api/v1").rstrip("/")
    # nemotron-super is responsive + clean tool_calls; glm-5.2:free is often rate-limited (429).
    MODEL = os.environ.get("OX_MODEL", "nvidia/nemotron-3-super-120b-a12b:free")
    TOKEN = os.environ["OPENROUTER_API_KEY"]
else:
    BASE = os.environ.get("OX_BASE_URL", "https://tokenra.io/v1").rstrip("/")
    MODEL = os.environ.get("OX_MODEL", "stealth/ox-alpha")
    TOKEN = os.environ.get("OX_FREE_API_TOKEN")

SYSTEM = (
    "You are a home-cooking assistant helping plan a family dish. Use the provided "
    "tools to fetch the recipe, check the pantry, and set timers before answering. "
    "Do not invent recipe details you can get from a tool. When you have enough from "
    "the tools, give the final plan.\n\n"
    "Keep a short ledger at the top of every reply:\n"
    "GOAL: <one line> | DONE: <tool results so far> | NEXT: <next step> | OPEN: <unknowns>"
)

# Toy tools the human executes by hand. Trivial on purpose — the point is the LOOP.
TOOLS = [
    {"type": "function", "function": {
        "name": "get_recipe",
        "description": "Return ingredients and steps for a named dish.",
        "parameters": {"type": "object", "properties": {
            "dish": {"type": "string", "description": "e.g. 'chicken adobo'"}},
            "required": ["dish"]}}},
    {"type": "function", "function": {
        "name": "check_pantry",
        "description": "Check which of the given ingredients are in stock at home.",
        "parameters": {"type": "object", "properties": {
            "items": {"type": "array", "items": {"type": "string"}}},
            "required": ["items"]}}},
    {"type": "function", "function": {
        "name": "set_timer",
        "description": "Start a kitchen timer.",
        "parameters": {"type": "object", "properties": {
            "minutes": {"type": "integer"}, "label": {"type": "string"}},
            "required": ["minutes", "label"]}}},
]


def post(messages):
    body = json.dumps({"model": MODEL, "messages": messages,
                       "tools": TOOLS, "tool_choice": "auto"}).encode()
    req = urllib.request.Request(f"{BASE}/chat/completions", data=body, headers={
        "Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        print(f"\n[HTTP {e.code}] {e.read().decode()[:500]}")
        sys.exit(1)


def show_payload(messages, turn):
    print(f"\n{'='*70}\n  TURN {turn} — sending this payload (watch the messages array grow)\n{'='*70}")
    print(json.dumps({"model": MODEL, "messages": messages, "tools": "<3 tools>"},
                     indent=2, ensure_ascii=False))


def main():
    if not TOKEN:
        sys.exit("OX_FREE_API_TOKEN not set (source your .env first).")
    task = " ".join(sys.argv[1:]) or "I want to cook chicken adobo for the family tonight. Walk me through it."
    messages = [{"role": "system", "content": SYSTEM},
                {"role": "user", "content": task}]

    for turn in range(1, 9):  # safety cap
        show_payload(messages, turn)
        msg = post(messages)["choices"][0]["message"]
        calls = msg.get("tool_calls") or []

        if not calls:  # model stopped asking for tools -> DONE
            print(f"\n{'#'*70}\n  MODEL FINAL ANSWER (no more tool calls = task complete)\n{'#'*70}")
            print(msg.get("content", ""))
            return

        # Append the assistant message (with its tool_calls) verbatim.
        messages.append({"role": "assistant", "content": msg.get("content"),
                         "tool_calls": calls})
        print(f"\n>>> Model REQUESTED {len(calls)} tool call(s) — it did NOT run them. You do:")
        for c in calls:
            fn, args = c["function"]["name"], c["function"]["arguments"]
            print(f"\n  tool: {fn}\n  args: {args}")
            result = input("  you (paste the tool result as text/JSON): ")
            messages.append({"role": "tool", "tool_call_id": c["id"],
                             "name": fn, "content": result})

    print("\n[hit safety cap of 8 turns]")


if __name__ == "__main__":
    main()
