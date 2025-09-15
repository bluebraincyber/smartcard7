#!/usr/bin/env bash
set -euo pipefail

ALLOWED=$(jq -r '.allow[]' .trae/rules/allowlist.json | tr '\n' ' ')
DENIED=$(jq -r '.deny[]'  .trae/rules/denylist.json  | tr '\n' ' ')

echo "▶ Trae Guard — validando paths alterados…"

# Detecta base branch (CI) ou usa HEAD~1 (local)
BASE_REF="${BASE_REF:-origin/$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo main)}"
if [[ "${CI:-}" == "true" && -n "${GITHUB_BASE_REF:-}" ]]; then
  BASE_REF="origin/${GITHUB_BASE_REF}"
fi

CHANGED=$(git diff --name-only "${BASE_REF}"...HEAD || true)
echo "Arquivos alterados:"
echo "${CHANGED}"

# Se mudou nada, passa
[[ -z "${CHANGED}" ]] && { echo "✅ Sem mudanças."; exit 0; }

# Checa denylist
if [[ -n "${DENIED// /}" ]]; then
  while read -r f; do
    [[ -z "$f" ]] && continue
    for d in ${DENIED}; do
      if [[ $(printf "%s\n" "$f" | grep -E "^${d//\*/.*}$" || true) ]]; then
        echo "❌ Bloqueado por denylist: $f (padrão: $d)"
        exit 1
      fi
    done
  done <<< "${CHANGED}"
fi

# Checa allowlist (pelo menos um padrão precisa casar)
function allowed_file() {
  local file="$1"
  for a in ${ALLOWED}; do
    if [[ $(printf "%s\n" "$file" | grep -E "^${a//\*/.*}$" || true) ]]; then
      return 0
    fi
  done
  return 1
}

# Cada arquivo deve cair na allowlist
while read -r f; do
  [[ -z "$f" ]] && continue
  if ! allowed_file "$f"; then
    echo "❌ Arquivo fora da allowlist: $f"
    echo "   Ajuste o escopo da mudança ou atualize .trae/rules/allowlist.json."
    exit 1
  fi
done <<< "${CHANGED}"

echo "✅ Trae Guard aprovado."
