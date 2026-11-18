# Repository layout

[简体中文](repository-layout.zh-CN.md)

The engine is a monorepo, so executable apps and reusable packages have separate directories rather than one root `src/`.

| Directory | Owner |
| --- | --- |
| `apps/` | API, background worker and internal dynamic web application |
| `packages/` | Shared contracts, backend and editorial feature packages |
| `configs/` | Shared TypeScript options and typed `site/` and `industry/` workspaces |
| `scripts/` | Development, collection, evaluation and operational commands |
| `tests/` | Cross-module, contract and integration checks; module-local tests stay with their module |
| `docs/` | Explanations, setup, operations and retained design records |
| `packages/backend/migrations/` | Immutable released engine migrations |
| `packages/backend/assets/og-fonts/` | Licensed server-side sharing fonts |

Conventional root entry files remain discoverable: README, AGENTS, CONTRIBUTING, SECURITY, LICENSE/NOTICE, npm manifests/lock, `.gitignore`. Runtime prompt and policy Markdown stays in the configuration packages because the application loads it. Credentials are outside Git under `CONFIG_ROOT`; generated files and runtime data are under `DATA_ROOT`.

The reader repository is a smaller independent application with `src/`, `tests/`, `docs/` and `configs/`. Its root `tsconfig.json` is a thin discovery entry. Do not move manifests or workflow files merely for visual uniformity, or introduce placeholder directories with no owner.

## Configuration path migration

`industry/` and `site/` moved to `configs/industry/` and `configs/site/`; package imports remain `@aihot/industry` and `@aihot/site`. Shared options moved to `configs/tsconfig.base.json`; project-specific TypeScript entry files stay with their projects. Run `npm ci` after updating the checkout to refresh workspace links. Custom scripts that read old filesystem paths must update them; no compatibility symlink is retained. Built-in readers use the new paths. Upstream merges touching those paths may need explicit conflict resolution.

This source move does not relocate production data, reconfigure or install the immutable local worker, or apply migrations. Replace an installed worker only through the documented checked-release process, separately reviewing migration 0169 and its rollback limit.

## Documentation website

The engine's own GitHub Pages hosts the MkDocs manual and preserves the public `editions.json`/`latest.json` v1 endpoints, dated redirects and RSS migration notice. A single manual-only workflow publishes the combined artifact. See [manual website operations](manual-site.md). The news reader remains in `ai-editorial-pages`.

## Package path migration

`modules/editorial-*` moved to `packages/editorial-*`; npm package names and public artifacts are unchanged. Engine SQL moved from `database/migrations/` to `packages/backend/migrations/`, and fonts from `assets/og-fonts/` to `packages/backend/assets/og-fonts/`. SQL filenames, bytes and `schema_migrations.name` identities remain unchanged; moving files does not require a database migration. Migration checks compare the established old/new paths and still reject edits, deletions and duplicate names. Run `npm ci` to rebuild workspace links. External scripts using old paths must update; no compatibility links are installed. The retired `README.en.md` forwarding file was removed; use `README.md` or `docs/upstream-guide.md`. Root npm manifests remain required. Existing immutable worker releases keep their original layout until a separately authorized upgrade.
