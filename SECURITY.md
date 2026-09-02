# Security policy

## Supported version

Only the latest tagged release is supported. Dependencies and base images are monitored by Dependabot and the CI image scan.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use the repository's private vulnerability reporting feature and include affected versions, reproduction steps, and impact. Acknowledge reports within two business days and provide a remediation plan after triage.

## Secret handling

Never commit `.env` files, kubeconfigs, database credentials, registry tokens, or cloud keys. Production secrets should be delivered from a secret manager through an approved controller. Rotate a credential immediately if it appears in a log, commit, CI output, or support artifact.

## Release verification

Tagged images are built by GitHub Actions with an SBOM and provenance and signed with Sigstore keyless signing. Deploy by digest and verify the signature against the repository's GitHub Actions identity before admission in a regulated environment.
