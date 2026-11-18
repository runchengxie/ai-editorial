# AI Editorial repository instructions

This repository owns the internal dynamic engine, editorial workbench, source configuration and public data production. The independent `ai-editorial-pages` repository owns the static reader, localization, issue RSS, HTML export and Pages deployment. Read [README.md](README.md), [operations](docs/magazine.md) and the relevant module before changing it.

## Layout and boundaries

- `apps/`: API, worker and dynamic web entry points. `packages/`: shared contracts and backend implementation. `modules/`: fork-specific features.
- `configs/site/` and `configs/industry/`: typed npm workspace configuration packages. Preserve `@aihot/site` and `@aihot/industry` names; update filesystem readers, package manifests, tests and documentation together when paths change. Shared TypeScript options live in `configs/tsconfig.base.json`.
- `scripts/`, `tests/`, `docs/`, `database/`, `assets/` retain their distinct responsibilities. Runtime prompt and policy Markdown remains with its configuration package; explanatory documentation belongs in `docs/`.
- Respect the workspace's external data/configuration roots. Never commit credentials, raw evidence, generated publications, runtime state or test outputs. See [data contract](docs/editorial-data-contract.md).
- Keep the dynamic app internal through loopback binding or an authenticated perimeter. Its inherited anonymous endpoints are not the public static reader. Do not use AIHOT branding.

## Validation

Use Node.js 24.22.2 or later for this fork. Run `npm ci --no-audit --no-fund`, `npm run typecheck`, `npm run build -w @aihot/web`, `npm run test:standalone`, `npm test`, `npm run test:web`, and the two `scripts/daily-brief/*.test.ts` checks as relevant. Backend test database names must end in `_test` or `_ci`; tests create isolated copies and need `CREATEDB`, compatible PostgreSQL backup clients and `tar`. Never use production data for tests.

CI also checks migration safety, built-site smoke/MCP behavior. Use Chromium and WebKit for the inherited browser suite. Missing browser system libraries are an environment failure, not grounds to skip tests. Record exact revisions and actual results; see [validation history](docs/editorial-release-validation.md). No separate lint, coverage threshold or security-scanner gate is currently configured. Run dependency audits explicitly when inspecting dependency security; `npm ci --no-audit` does not establish security status.

## Stable safety and architecture rules

- The dynamic web frontend reaches the backend over HTTP only. Dynamic public outlets read through `packages/backend/src/publication/`; the magazine has a separate sanitized, versioned public projection. Validate provider and consumer together when changing either contract.
- Models run only in background or explicit operator jobs, never while serving reader requests. Billable requests use existing receipts and budgets. Unknown outcomes require investigation before another attempt.
- News automation is paused. CI does not publish; cloud publication workflows are manual-only, and installing the local worker does not authorize timer activation. Read [manual operations](docs/magazine.md#manual-evaluation-automation-paused). Source integration, content publication, worker installation and production migration are separate actions.
- Tests use local fixtures/stubs and keep external actions off. Collection/model/push safety flags are enabled only by explicit operational authorization. Source full-text publication defaults remain off.
- Preserve released migrations. New migrations follow the single online-safe statement convention in [architecture](docs/architecture.md#数据库迁移). Removing stored data requires an explicit migration and documented compatibility/rollback impact. Migration comments from upstream do not authorize production changes here.
- Preserve real history, necessary compatibility endpoints and task ownership. Do not force-push, weaken gates or delete another task's work. Follow workspace integration authorization for assigned work and repository protections.
- English is canonical for new reader-facing documentation, with aligned `zh-CN` counterparts for current setup/operations/contracts. Locale changes presentation only; IDs, schema, configuration keys, dates and source facts stay stable.

## Upstream contributions

Default PRs target the owner's fork, not AIHOT upstream. Upstream-only changes follow its contribution policy and require separate scope; this fork's product configuration and modules remain local. See [contributing](docs/contributing.md) and the [inherited engine guide](docs/upstream-guide.md).
