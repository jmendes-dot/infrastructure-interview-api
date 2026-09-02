# Changelog

All notable changes to this project are documented here. The format follows Keep a Changelog and releases use semantic versioning.

## [1.0.0] - 2026-09-01

### Added

- Hardened multi-stage container image.
- Helm deployment with three-zone spreading, PDB, HPA, probes, migrations, NetworkPolicy, and optional Ingress.
- Automated four-node kind environment and Terraform alternative.
- Unit/API, smoke, Helm, and load test scenarios.
- CI validation and signed multi-architecture GHCR releases with SBOM and provenance.

### Changed

- Modernized Node.js, Express, TypeORM, and MySQL dependencies.
- Replaced automatic schema synchronization with explicit migrations.
- Added bounded validation, structured redacted logging, graceful shutdown, and dependency-aware readiness.

### Security

- Removed hard-coded production credentials.
- Added non-root execution, read-only filesystem, dropped capabilities, seccomp, restricted network policy, and automated vulnerability scanning.
