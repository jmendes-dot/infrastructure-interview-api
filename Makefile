.PHONY: install lint typecheck test build verify container helm-lint bootstrap destroy load-test terraform-fmt

install:
	npm ci --ignore-scripts

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm test

build:
	npm run build

verify: lint typecheck test build helm-lint terraform-fmt

container:
	docker build --tag infrastructure-interview-api:local .

helm-lint:
	helm lint deploy/helm/interview-api

bootstrap:
	./scripts/bootstrap-kind.sh

destroy:
	./scripts/destroy-kind.sh

load-test:
	k6 run tests/load.js

terraform-fmt:
	terraform fmt -check -recursive terraform
