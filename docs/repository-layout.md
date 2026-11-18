# Repository layout

[简体中文](repository-layout.zh-CN.md)

The engine is a monorepo, so executable apps and reusable packages have separate directories rather than one root `src/`.

| Directory | Owner |
| --- | --- |
| `apps/` | API, background worker and internal dynamic web application |
| `packages/` | Shared contracts and backend implementation |
| `modules/` | Fork-specific features, including workbench and magazine |
| `configs/` | Shared TypeScript options and typed `site/` and `industry/` workspaces |
| `scripts/` | Development, collection, evaluation and operational commands |
| `tests/` | Cross-module, contract and integration checks; module-local tests stay with their module |
| `docs/` | Explanations, setup, operations and retained design records |
| `database/` | Immutable released migrations and new schema changes |
| `assets/`, `deploy/` | Licensed shared resources and deployment templates |

Conventional root entry files remain discoverable: README, AGENTS, CLAUDE, CONTRIBUTING, SECURITY, LICENSE/NOTICE, npm manifests/lock, Dockerfile/Compose, `.gitignore`, `.dockerignore` and `.env.example`. Runtime prompt and policy Markdown stays in the configuration packages because the application loads it. Credentials are outside Git under `CONFIG_ROOT`; generated files and runtime data are under `DATA_ROOT`.

The reader repository is a smaller independent application with `src/`, `tests/`, `docs/` and `configs/`. Its root `tsconfig.json` is a thin discovery entry. Do not move manifests or workflow files merely for visual uniformity, or introduce placeholder directories with no owner.

## Configuration path migration

`industry/` and `site/` moved to `configs/industry/` and `configs/site/`; package imports remain `@aihot/industry` and `@aihot/site`. Shared options moved to `configs/tsconfig.base.json`; project-specific TypeScript entry files stay with their projects. Run `npm ci` after updating the checkout to refresh workspace links. Custom scripts that read old filesystem paths must update them; no compatibility symlink is retained. Docker and built-in readers use the new paths. Upstream merges touching those paths may need explicit conflict resolution.

This source move does not relocate production data, reconfigure or install the immutable local worker, or apply migrations. Replace an installed worker only through the documented checked-release process, separately reviewing migration0169 and its rollback limit.

## Documentation website

The engine's own GitHub Pages can host a MkDocs manual later, without another repository. It currently serves the public `editions.json`/`latest.json` v1 endpoints, redirects and RSS migration notice. The independent reader validates that v1 feed in addition to its v2 release asset. A documentation deploy must include and preserve those endpoints/history and have a single coordinated Pages publisher; a plain MkDocs deploy would overwrite them. MkDocs is a proposed follow-up, not an installed dependency or shipped site. The news reader remains in `ai-editorial-pages`.
