# AI Workshop — Demos

The runnable demos for the workshop. Everything runs locally inside **BlitzPi**, which brings its own Bun runtime and
sandboxes the shell, so there is no cloud environment to wait on and nothing else on your machine gets touched.

> The workshop deck and course material are internal and live elsewhere. This repo is the demos.

## Setup

1. Install BlitzPi. One command, no developer tools required:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/rvillaver/BlitzPi/master/install.sh | sh
   ```

   Windows 11 (PowerShell): `irm https://raw.githubusercontent.com/rvillaver/BlitzPi/master/install.ps1 | iex`

2. Get a free **[OpenRouter](https://openrouter.ai/keys)** API key (no card) and put
   `OPENROUTER_API_KEY=sk-or-...` in a repo-root `.env` (see `.env.example`).

3. Clone this repo and pick your security level. Workshops run at `strict`:

   ```bash
   git clone https://github.com/rvillaver/AI-Workshop-Course.git
   cd AI-Workshop-Course
   blitzpi level strict
   ```

## Run a demo

BlitzPi ships its own Bun and does **not** put it on your shell PATH, because commands the agent
runs go through its sandbox. For the demos you drive by hand, add it once:

```bash
export PATH="$HOME/Library/Application Support/BlitzPi/bun/bin:$PATH"   # macOS
export PATH="$HOME/.local/share/blitzpi/bun/bin:$PATH"                  # Linux
```

```bash
# Foundations: drive the tool-call loop by hand
bun demos/manual-agent-loop/agent_loop.mjs

# Development track: the triage board
cd demos/triage-board
bun install
bun run start        # http://localhost:4000
bun test
```

Or start `blitzpi` in the repo and ask it to run them, in which case the sandbox, the OSV package
checks, and the audit trail all apply.

## What's here

| Path | What it is |
|---|---|
| `demos/manual-agent-loop/` | "The human is the runtime": a tool-call loop you drive by hand. No install. |
| `demos/triage-board/` | A small support-ticket app used by the Development track. Express + JSON storage, port 4000. |

## Security levels

BlitzPi runs every command through a sandbox and audits the decisions. `blitzpi level <tier>` sets the tier:

| Level | What it does |
|---|---|
| `strict` | Asks before every package install. What workshops run. |
| `guarded` | The product default. |
| `monitored` | In-project writes and outside-project reads go quiet, still audited. |

A known-malicious package is blocked and a write outside the project still prompts, at every level.
