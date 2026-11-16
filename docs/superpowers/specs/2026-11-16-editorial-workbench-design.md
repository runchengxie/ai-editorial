# AI Editorial: Internal Workbench Design

Status: product design and native implementation approved in conversation on 2026-11-16; implemented for internal pilot. See `docs/editorial-release-validation.md` for validation evidence and limitations.

## Purpose

Help one editor produce useful AI coverage for people using AI in financial research, financial statements, data processing, and software development. Start with an internal workbench; member subscriptions are a later product.

The workflow is discovery → source verification → topic selection → draft preparation → manual publication → follow-up. Success means less time finding and verifying material, with useful topics supported by original sources.

## Approaches and decision

1. Fork AIHOT: reuse collection, processing, events, operations and administration; add editorial workflow in a site module. Chosen by the user because it also offers a path to a subscription website.
2. Horizon: attractive for internal briefings and editorial profiles, but requires additional website and content-management work later. Reference its editorial approach rather than embed its runtime.
3. Build a small custom tool: closest fit to the workflow, but requires rebuilding collection and operations. Deferred without evidence that AIHOT is unsuitable.

Retain upstream history and license notices. Do not use AIHOT branding. `ai-editorial` is an approved temporary technical directory, not a final public brand.

## First release

- One authenticated editor; existing administrator session and CSRF protection.
- Shared source items and events, with `finance-research` and `development` audience tags. A topic may serve both.
- Topic statuses: `inbox`, `candidate`, `in_progress`, `published`, `discarded`.
- A separate human review status: `unreviewed`, `verified`, `needs_changes`. Workflow status never substitutes for review.
- Link topics to upstream articles; retain source URL, publication time, claims, limitations and evidence classification (`official_claim`, `independent_test`, `community_report`). Missing dates and unavailable sources must be visible.
- Store private editor notes separately from an exportable draft.
- Draft fields: angle, factual summary, audience impact, open verification questions and source references. Start with a deterministic evidence packet for editing; model-assisted drafting is a worker job through existing receipts/budgets, not a page-load call.
- Manual Markdown export and publication-link recording. Export is an explicit editor action and must warn about unresolved verification. No automatic external publishing.
- Archive discarded topics rather than delete source records.

## Editorial policy proposal

Favor practical workflow changes, reproducible examples, conditions, costs and failure cases. Reduce repetitive announcements and unsupported promotion. Distinguish reported results from editor-tested results. These are proposed defaults, not a calibrated scoring model. Keep the upstream numeric selection thresholds until labeled samples support changes.

Finance research covers retrieval, financial documents and tables, data analysis, spreadsheets, coding and traceability. It does not mean selecting investments in AI companies.

## Publication boundary

AIHOT's existing machine selection/publication is not human approval. The module must never write notes or drafts into upstream publication records. No new public module pages, feeds, APIs or MCP tools in this release.

Run the whole first release on loopback or behind an authenticated perimeter: the upstream application still has anonymous publication routes. An admin-only module does not make those routes private. Do not expose the fork publicly or describe existing feeds as member-ready. Any future subscription release requires a separate access-control design covering every output and cache.

`published` records that the editor published externally; it does not automatically syndicate the topic. Verification is required before marking a draft published; subsequent evidence edits invalidate verification. Published corrections retain history and return the review to `needs_changes`.

## Architecture and storage

Baseline inspected: AIHOT `209417b0dd614460926ba7d96760794d07d83711`.

Use `modules/editorial-workbench/`, registered through `site/modules/`. Reuse backend database, admin authentication, audits and event/article identities. Module migrations own editorial tables; do not change historical engine migrations. Frontend reads only HTTP; no database or credentials in the web process.

Source lives under `CODE_ROOT/ai-editorial`; task worktrees under `CODE_ROOT/.worktrees/ai-editorial-<task>`. Persistent PostgreSQL data, exports and evaluation results belong under `DATA_ROOT/ai-editorial`. Secrets belong under `CONFIG_ROOT/projects/ai-editorial`; reference them explicitly rather than assume the framework reads root settings. Concrete machine paths stay outside committed documentation.

New module UI supports English by default and an explicit Chinese switch, with semantic locale catalogs and persisted selection. Existing upstream UI language is an inherited limitation, not an assertion of complete bilingual support. Reader-facing project documentation uses English with explicitly named Chinese translations and reciprocal links.

## Exclusions

No payments, membership accounts, personalized recommendation, social-platform login or automated posting. No large source expansion, borrowed production source lists, alternate deduplication runtime or public deployment. Final branding, source catalog and public legal text remain decisions for the owner/editor.

## Validation and pilot

Test authorization, CSRF, private-data isolation, input validation, review invalidation, export boundaries and persistence. Run upstream type checking, backend tests, web build/tests and smoke checks against the tested revision. Use task-specific databases ending `_test` or `_ci`, local fake providers and disabled collection/model/push switches.

Pilot with an initial 100 manually assessed items covering both audiences: record missed useful items, incorrect event merges, unsupported summaries, editor time, accepted topics and actual processing cost. This sample size is a proposed starting point, not a statistical quality guarantee. Enable live collection/model calls only after configuration and budget are explicitly established; do not invent usage costs from documentation.

## Current constraints

Node 24.22.2 is available. Docker, PostgreSQL binaries and an existing test database were not found in the initial shell inspection. Network operations require sandbox escalation; GitHub access and designated account identity were verified outside the sandbox. No dependencies have been installed and no runtime tests have run yet.
