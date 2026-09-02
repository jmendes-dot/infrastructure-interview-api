# Architecture decisions

## Availability model

The API is stateless. Three baseline replicas are scheduled with `DoNotSchedule` zone spreading over `topology.kubernetes.io/zone`; a second hostname constraint reduces same-node concentration. A PodDisruptionBudget preserves two healthy replicas during voluntary maintenance. Rolling updates allow zero unavailable pods and one surge pod.

This design tolerates the loss of a pod or node without interrupting service. A zone failure leaves two baseline replicas. Kubernetes can then replace capacity in the remaining eligible zones, subject to cluster capacity and autoscaler behavior.

## Data layer

The production chart consumes an existing MySQL-compatible database and an existing Secret. It never generates credentials or runs schema synchronization. A Helm hook executes explicit, versioned migrations before install or upgrade.

For a global 24/7 service, use a managed multi-zone database with automated backups, point-in-time recovery, encryption, a tested failover policy, and connection monitoring. Database replication topology and cross-region recovery are platform decisions, not concerns that belong in an application Helm chart.

## Scaling and performance

The HPA uses CPU and memory as safe initial signals and maintains at least three pods. Resource requests make scheduling and HPA calculations deterministic. List pagination is bounded. Database pool size is configurable and intentionally conservative.

For mature production traffic, replace or supplement resource metrics with request concurrency, latency, or queue depth. Run the included k6 scenario against an isolated environment, record a baseline, and tune resource requests before changing HPA targets.

## Security boundaries

- The container runs as an unprivileged user with a read-only root filesystem.
- Linux capabilities are dropped, privilege escalation is disabled, and RuntimeDefault seccomp is applied.
- Service account token mounting is disabled because the API does not use the Kubernetes API.
- Secrets are referenced, never templated into source control.
- Request sizes and input shapes are bounded; HTTP hardening headers are enabled.
- Logs are structured and redact authorization, cookies, and credential fields.
- CI scans the final image and blocks known high or critical vulnerabilities with available fixes.
- Releases contain an SBOM, build provenance, and a keyless Sigstore signature.

## Cost choices

Three small baseline pods are the minimum that directly satisfies the three-zone requirement. HPA scales down slowly to avoid churn. The database is not duplicated inside every cluster; a managed service centralizes durable storage and operational work. Development uses ephemeral MariaDB and kind so it incurs no cloud cost.

## Deliberate exclusions

- No service mesh: it adds operational cost without a demonstrated requirement.
- No in-cluster production database: single-cluster storage would weaken durability and failover.
- No cloud-specific Terraform: the task prohibits the need for a paid account. The Helm interface is portable; a production platform module can supply a managed Kubernetes cluster, DNS, certificates, and database separately.
- No application-specific authentication was invented for the sample API. Before storing sensitive data, put the service behind an identity-aware gateway and define authorization from product requirements. Enforce rate limits at the shared edge so limits remain consistent across replicas.
