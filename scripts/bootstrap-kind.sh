#!/usr/bin/env bash
set -Eeuo pipefail

readonly CLUSTER_NAME="interview"
readonly KUBE_CONTEXT="kind-${CLUSTER_NAME}"
readonly NAMESPACE="interview"
readonly IMAGE="infrastructure-interview-api:local"
readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

for binary in docker kind kubectl helm; do
  if ! command -v "${binary}" >/dev/null 2>&1; then
    echo "Required command not found: ${binary}" >&2
    exit 1
  fi
done

cluster_exists=false
while IFS= read -r cluster; do
  if [[ "${cluster}" == "${CLUSTER_NAME}" ]]; then
    cluster_exists=true
    break
  fi
done < <(kind get clusters)

if [[ "${cluster_exists}" == "false" ]]; then
  kind create cluster --config "${PROJECT_DIR}/deploy/kind/cluster.yaml" --wait 120s
fi

docker build --tag "${IMAGE}" "${PROJECT_DIR}"
kind load docker-image --name "${CLUSTER_NAME}" "${IMAGE}"

kubectl --context "${KUBE_CONTEXT}" create namespace "${NAMESPACE}" --dry-run=client -o yaml \
  | kubectl --context "${KUBE_CONTEXT}" apply -f -
kubectl --context "${KUBE_CONTEXT}" -n "${NAMESPACE}" create secret generic interview-api-database \
  --from-literal=username=posts \
  --from-literal=password=local-development-only \
  --from-literal=root-password=local-root-only \
  --dry-run=client -o yaml | kubectl --context "${KUBE_CONTEXT}" apply -f -

kubectl --context "${KUBE_CONTEXT}" -n "${NAMESPACE}" apply -f "${PROJECT_DIR}/deploy/local/mariadb.yaml"
kubectl --context "${KUBE_CONTEXT}" -n "${NAMESPACE}" rollout status deployment/mariadb --timeout=180s

helm upgrade --install interview-api "${PROJECT_DIR}/deploy/helm/interview-api" \
  --namespace "${NAMESPACE}" \
  --kube-context "${KUBE_CONTEXT}" \
  --values "${PROJECT_DIR}/deploy/helm/interview-api/values-kind.yaml" \
  --atomic \
  --timeout 5m

kubectl --context "${KUBE_CONTEXT}" -n "${NAMESPACE}" rollout status deployment/interview-api-interview-api --timeout=180s
"${PROJECT_DIR}/scripts/smoke-test.sh" "http://127.0.0.1:8080"

echo "Deployment is ready at http://127.0.0.1:8080"
