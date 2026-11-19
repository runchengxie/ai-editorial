# Delivery status

[简体中文](project-status.zh-CN.md)

## Last completed delivery

PR18 completed the Material manual and private quality diagnostics on19November2026. Its source and installed worker revision is `a68a06a3ab7d143fde9f5c6c2cf805f3e31870a1`. Exact-main checks passed336 standalone,69 browser and1221 backend tests. The [manual](https://runchengxie.github.io/ai-editorial/) supports system/light/dark modes. The independent [reader](https://runchengxie.github.io/ai-editorial-pages/) serves news.

The delivery retained the existing public v2 asset `ec79fdf5805283b270bcffc5ee60d719d59a65c738e1706e6942c66c448add24`, produced from `cd2aab9`; the reader renderer was `f2ccc365ab778d46cf620f87ff8669188ac8cee3`. Its manual-only publication preserved all8 captured v1 compatibility files byte-for-byte.

Private acceptance produced7 features/13 briefs for the daily and10/21 for the weekly. The weekly original failed strict numeric/citation checks; a separate source-anchored variant passed without another model call. The report retained that failure. The daily brief target remains15–20, and direct filing material needs more coverage. The two calls brought the historical receipt count to6. The rolling-day budget was restored to3, the timer stayed disabled and the generation service inactive.

Migration0169 was applied on18November with a verified backup/restore. The19November upgrade had zero pending migrations and preserved all receipt contents. Full/runtime npm audits and the Material Python environment reported zero findings. The picomatch advisory had been withdrawn, and dependency versions stayed unchanged.

Current deployment and release identity come from successful workflow runs, reader `build.json`, the public manifest and the private worker configuration. [Magazine operations](magazine.md) explains the manual commands and diagnostics. [Runtime upgrade](runtime-upgrade.md) explains release installation. The retained task reports under the external evaluations directory record exact revisions and adoption checks.

## Historical audit snapshot, 18 November 2026

The following retained record describes the earlier audit's starting state and work. Its old revisions, unapplied-migration state and proposed MkDocs work are historical, not the current status above.

This 18 November2026 snapshot separates source integration, published content, installed runtime and consumer adoption. The audit covers the engine's editorial/magazine/static-data paths, configuration layout, repository instructions, current documentation, quality gates and the independent reader. It is not a renewed function-by-function audit of the inherited engine.

## Ownership and starting state

Both primary checkouts were clean on `main`, with no existing task branches or linked worktrees in either repository. No `.gitmodules` or mode 160000 gitlinks are registered, so there is no submodule SHA or missing checkout to initialize. The reader is an independent repository, not a submodule. The audit uses one isolated task worktree per repository; unrelated workspace projects are outside scope.

| Layer | Verified starting state | Meaning |
| --- | --- | --- |
| Engine source | `cd2aab93a36a68fc5cafd4a8c8e82c07bbd75171` on own `main` | PRs 13/14 merged; all five upstream updates included. Fetched upstream has no unmerged commits at this snapshot. |
| Public v2 asset | `ec79fdf5805283b270bcffc5ee60d719d59a65c738e1706e6942c66c448add24` | Published immutable asset records engine revision `cd2aab9`; expanded weekly has 12 features,25 briefs,45 article references from 28 feeds. |
| Reader source/deployment | `5bd79c80b37d994abc38909a52adbd3263ee9af6` | [Pages run 44280418210](https://github.com/runchengxie/ai-editorial-pages/actions/runs/44280418210) succeeded; live `build.json` identifies this reader and the v2 digest above. |
| Installed local worker | `b115a0db0275fbc2c48dcce85bc19e142d331a9e` | Private installed-release configuration still selects this older immutable release. New source configuration is not automatically installed. |
| Production database | Migration 0165 applied;0169 not applied | `selected_ledger.visible_at` remains. No production migration, runtime installation or configuration update is part of this audit. |
| Automation | Timer disabled, generation service inactive; cloud workflows manual-only | A manual content deployment does not resume schedules. |

The public reader adopted the expanded data, not the newer collection runtime. Its v1 source-link compatibility feed remains independently required and records an older producer run. The v2 release tag is a stable container; its original tag commit is not the asset's producer revision. No paid subscription, membership or public dynamic-workbench deployment is delivered.

## Corrections in this audit

- Moved typed site/industry configuration under `configs/`, preserving npm package identities, source bytes and public schemas. Updated direct filesystem readers, CSS discovery, module composition, architecture checks, Docker manifests and workspace lock links. External dependency records did not change. See [path migration and layout](repository-layout.md).
- Moved the inherited long English README and explanatory resource/industry guides under `docs/`. Runtime prompt and policy Markdown remains beside its configuration; licenses and standard root discovery files remain in place.
- Replaced upstream-oriented agent/contribution guidance with fork-specific responsibilities and safe commands. Removed the inherited force-push/single-commit requirement and upstream-only support routing. `CLAUDE.md` remains a single delegation to `AGENTS.md`; no global memory or personal tooling was edited.
- Marked initial workbench validation as historical and corrected documents that still described the expanded weekly as unpublished. English facts precede aligned Chinese versions.
- The reader corrects legacy daily 08:17 schedule promises, completed-split instructions and dual-contract/build provenance descriptions. A bilingual regression checks the paused-publication disclosure. Locale does not change data or schema.
- Added standalone tests to engine CI after the required web build. Previously local 326-test coverage was absent from that workflow; no tests or thresholds were removed.

## Validation and exceptions

Baseline exact-main CI for the engine is [44274789941](https://github.com/runchengxie/ai-editorial/actions/runs/44274789941):1211 backend tests,69 browser tests, type/build, daily contract, migration safety, Docker and smoke/MCP gates passed. This is baseline evidence, not a claim that an uncommitted audit tree passed those checks. Audit PRs must validate their exact combined result against current main before integration.

Local audit checks include isolated `npm ci`, engine typecheck/build,326 standalone tests,7 daily selection tests,1 daily output test and migration safety; reader baseline 12 tests rose to 13 with the disclosure regression, plus typecheck, Chromium and fixture builds. Retained paired evaluation uses saved public v1/v2 data and records both revisions. The final task report records exact PR/main CI and resulting integration revisions.

One initial standalone run started before its fresh worktree's web build completed:8 cases failed with a missing `build/server/index.js`. After building first, all 326 passed. This was a validation-order error, not repaired by changing tests. The reader's initial sandbox child spawning returned `EPERM`; escalated runs passed. Inherited WebKit requires system libraries missing from the default local setup; hosted CI supplies them. Do not suppress those tests.

There is no separate lint configuration, coverage report/threshold, unused-code scanner or security-scanner CI gate. TypeScript is strict with existing `skipLibCheck` and base `noUncheckedIndexedAccess:false`; these were not expanded. Architecture guards exclude generated/dependency paths and module tests/scripts by design; they are convention checks, not a comprehensive dead-code or configuration audit. No skip declarations surfaced in the inspected project tests. Ignore rules cover dependencies, environment files and generated builds/cache; no tracked caches/logs/runtime outputs were found. Valid fixtures, migration history, design records, data compatibility feeds and reusable evaluation scripts remain.

## Dependency-security finding and remaining work

`npm audit --json` reports five high-severity development-dependency nodes in the engine: `@react-router/dev`, `vite`, `tinyglobby`, `fdir`, `picomatch`. They trace to the [picomatch ReDoS advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf). The reader reports zero advisories in this audit. All affected lockfile nodes are development-only and external dependency versions are unchanged from the baseline. This is an existing finding, not a new path-migration regression or proof of exploitability in the static site. Suggested automatic fixes include incompatible major-version changes; no audit fix, override or downgrade was applied. Investigate a compatible patched toolchain separately and rerun build/browser/Docker gates.

Other open work: deliberately upgrade the installed worker after reviewing migration 0169 and backup/rollback needs; test new quantity prompts in a future budget-authorized generation; further measure financial-source coverage and editorial quality; settle branding/legal text before public dynamic or member features. No model calls, source recollection, archive cleanup, production migration, schedule activation or content publication occurs in this audit. Code integration is distinct from deployment; follow-up publication remains explicit.

The engine Pages can become a MkDocs manual while preserving v1 endpoints, history and a single coordinated publisher. No MkDocs dependency, workflow or site has been installed. See [documentation website constraints](repository-layout.md#documentation-website).
