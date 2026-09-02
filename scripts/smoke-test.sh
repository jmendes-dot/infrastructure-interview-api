#!/usr/bin/env bash
set -Eeuo pipefail

readonly BASE_URL="${1:-http://127.0.0.1:3000}"

for binary in curl jq; do
  if ! command -v "${binary}" >/dev/null 2>&1; then
    echo "Required command not found: ${binary}" >&2
    exit 1
  fi
done

curl --fail --silent --show-error "${BASE_URL}/health/live" >/dev/null
curl --fail --silent --show-error "${BASE_URL}/health/ready" >/dev/null

created_post="$(curl --fail --silent --show-error \
  -H "Content-Type: application/json" \
  -d '{"title":"Smoke test","text":"Deployment verified","categories":[{"name":"devops"}]}' \
  "${BASE_URL}/posts")"

post_id="$(jq -er '.id | numbers' <<<"${created_post}")"
if [[ -z "${post_id}" ]]; then
  echo "POST /posts did not return an id" >&2
  exit 1
fi

curl --fail --silent --show-error "${BASE_URL}/posts/${post_id}" >/dev/null
echo "Smoke tests passed"
