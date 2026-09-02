# Operations runbook

## Deployment

1. Confirm the immutable image digest and vulnerability scan.
2. Confirm a recent database backup and migration compatibility.
3. Run `helm diff upgrade` in the target environment when the plugin is available.
4. Deploy with `helm upgrade --install ... --atomic --timeout 5m`.
5. Run `helm test interview-api -n interview` and inspect rollout events.

## Health and diagnosis

```bash
kubectl -n interview get deployment,pods,service,hpa,pdb
kubectl -n interview describe deployment interview-api-interview-api
kubectl -n interview get events --sort-by=.lastTimestamp
kubectl -n interview logs deployment/interview-api-interview-api --tail=200
kubectl -n interview get pods -o wide
```

`/health/live` proves the process can serve HTTP and should not test downstream dependencies. `/health/ready` checks the database and removes a pod from service when it cannot fulfill requests.

## Rollback

```bash
helm -n interview history interview-api
helm -n interview rollback interview-api <revision> --wait --timeout 5m
```

Application rollback does not automatically reverse a database migration. Schema changes must use expand-and-contract: deploy backward-compatible additions, migrate data, switch the application, and remove old schema only in a later release.

## Common incidents

### Pods pending

Check zone labels, topology constraints, resource capacity, and taints. The hard zone constraint requires three eligible zone domains for the baseline deployment.

### Migration job failing

Inspect the retained failed Job logs, confirm the Secret keys and database network path, and verify the target schema version. Fix forward; do not rerun partially destructive SQL without understanding transaction behavior.

### Readiness failures

Check database reachability, credentials, TLS mode, connection saturation, and query latency. Liveness should remain healthy, preventing a database incident from creating an unnecessary restart loop.

### High latency

Compare request latency, CPU throttling, memory, database pool utilization, slow queries, and HPA events. Scaling pods cannot fix a saturated database; reduce expensive queries or scale the data layer first.

## Suggested service objectives

- Availability: 99.9% successful non-5xx requests per rolling 30 days.
- Latency: 95% of reads below 250 ms under the agreed traffic profile.
- Alert on error-budget burn, not isolated probe failures.
- Alert on insufficient ready replicas, migration failure, sustained database saturation, and HPA at maximum capacity.
