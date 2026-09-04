#!/usr/bin/env bash
# Runs once on Codespace create. Installs the agent CLIs so an AI assistant (Claude
# Code / Codex / Copilot) can drive the environment. manual-agent-loop needs no install;
# triage-board has one dependency, pre-installed here so the room isn't waiting on npm.
set -e

echo "▸ Installing agent CLIs (Claude Code, Codex)…"
npm install -g @anthropic-ai/claude-code @openai/codex

echo "▸ Installing triage-board dependencies…"
npm --prefix demos/triage-board install --no-audit --no-fund

echo ""
echo "✅ Ready. Quick start:"
echo "   • Agent demo:   node demos/manual-agent-loop/agent_loop.mjs"
echo "   • Triage board: npm --prefix demos/triage-board start   (port 4000)"
echo "   • Claude Code: claude       |   Codex: codex"
echo ""
if [ -z "${OPENROUTER_API_KEY:-}" ]; then
  echo "ℹ️  Set OPENROUTER_API_KEY (Codespace secret) to run the free-model agent demo."
fi
