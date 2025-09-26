#!/usr/bin/env bash

set -euo pipefail

get_required_go_version() {
  # If _VERSION_GO is set, use it directly
  if [[ -n "${_VERSION_GO:-}" ]]; then
    echo "${_VERSION_GO:-}"
    return
  fi

  _VERSION_GO="$(jq -r '.go_version' "${_ROOT_DIR:-$(git rev-parse --show-toplevel)}/${_MANIFEST_SUBPATH:-internal/module/info/manifest.json}" 2>/dev/null || echo "")"
  if [[ -n "${_VERSION_GO:-}" && "${_VERSION_GO:-}" != "null" ]]; then
    echo "${_VERSION_GO:-}"
    return
  fi

  local go_mod_path="${1:-go.mod}"

  if [[ ! -f "${go_mod_path}" ]]; then
    echo "1.25.1" # fallback
    return
  fi

  # Extract go version from go.mod
  _VERSION_GO="$(awk '/^go / {print $2; exit}' "${go_mod_path}")"
  if [[ -z "${_VERSION_GO:-}" ]]; then
    echo "1.25.1" # fallback
  else
    echo "${_VERSION_GO:-}"
  fi
}

get_current_go_version() {
  if ! command -v go >/dev/null 2>&1; then
    echo "not-installed"
    return
  fi

  go version | awk '{print $3}' | sed 's/go//'
}

echo "$(get_required_go_version "go.mod")"

echo "$(get_current_go_version)"
