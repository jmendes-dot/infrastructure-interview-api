#!/usr/bin/env bash
set -Eeuo pipefail

if ! command -v kind >/dev/null 2>&1; then
  echo "Required command not found: kind" >&2
  exit 1
fi

kind delete cluster --name interview
