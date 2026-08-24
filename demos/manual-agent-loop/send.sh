#!/usr/bin/env bash
# Send a request payload file to the chat-completions endpoint. The payload is just
# plain text (JSON) — open it in any editor. Saves the raw response text next to it
# as <name>.response.txt and pretty-prints it. Usage: ./send.sh wire/turn-1.txt
# Sources ../../.env so the key never appears in the command line.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
set -a; source "$here/../../.env"; set +a

# Auto-detect provider: OpenRouter if its key is present, else Tokenra/Ox Alpha.
if [ -n "${OPENROUTER_API_KEY:-}" ]; then
  : "${OX_BASE_URL:=https://openrouter.ai/api/v1}"; KEY="$OPENROUTER_API_KEY"
else
  : "${OX_BASE_URL:=https://tokenra.io/v1}"; KEY="$OX_FREE_API_TOKEN"
fi

req="${1:?pass a request .json file}"
out="${req%.*}.response.json"

# Body goes to the .response.txt file; the HTTP status goes to the terminal only.
code=$(curl -s "$OX_BASE_URL/chat/completions" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d @"$req" --max-time 120 \
  -o "$out" -w "%{http_code}")

echo "[HTTP $code]  ->  $out"
python3 -m json.tool "$out" 2>/dev/null || cat "$out"
