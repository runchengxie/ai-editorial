# AI Editorial Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The user selected native execution on 2026-11-16. This is the historical implementation checklist; actual results are recorded in `docs/editorial-release-validation.md`.

**Goal:** Give one editor a private, evidence-backed AI topic board and manually exportable drafts for financial-research and development audiences.

**Architecture:** Add a site module to the AIHOT fork, sharing article/event identities and existing admin protections. Keep module tables and private content separate from engine publication. Validate locally before any live collection or public service.

**Tech Stack:** Node.js 24.22.2+, TypeScript, Fastify, React Router, PostgreSQL, pg-boss, existing npm workspaces.

**Spec:** `docs/superpowers/specs/2026-11-16-editorial-workbench-design.md`

## Global Constraints

- One authenticated editor; no membership, payments or external posting.
- Whole service is internal-only: loopback or an authenticated perimeter, including upstream public outputs.
- Workflow statuses: `inbox`, `candidate`, `in_progress`, `published`, `discarded`.
- Human review statuses: `unreviewed`, `verified`, `needs_changes`.
- Audience tags: `finance-research`, `development`; one topic may carry both.
- Private notes must never appear in drafts, public outputs or source publications.
- Frontend only uses HTTP; worker jobs alone may invoke models through receipts and budgets.
- Keep collection, model and push switches disabled during development and testing.
- Persistent data goes under DATA_ROOT; authoritative secrets under CONFIG_ROOT; no machine paths or secrets committed.
- New module UI defaults to English with Chinese locale selection and semantic catalogs. Final public brand and legal text are not selected.
- Preserve original license notices, historical migrations and numeric selection thresholds.

## Review Focus

- Anonymous requests and forged write requests cannot access or modify editorial records (Task 2).
- A draft with unresolved questions or stale evidence cannot become published (Task 3).
- Private editor notes never enter exports, public APIs, RSS or MCP (Tasks 2 and 3).
- Re-imported article links do not create duplicate topics, and missing/withdrawn evidence stays visible (Tasks 2 and 3).
- Invalid status, audience, URL or concurrent stale edits produce explicit errors without losing newer changes (Tasks 2 and 4).

## Task 1: Establish a repeatable internal development baseline

**Files:** Create `docs/editorial-setup.md`, `docs/editorial-setup.zh-CN.md`, `docs/editorial-data-contract.md`; preserve inherited README entry points until the project README replacement is prepared.

**Interfaces:** Consumes upstream revision `209417b0dd614460926ba7d96760794d07d83711`; produces documented local endpoints, isolated database names and test commands.

- [ ] Fetch origin and upstream; verify fork parent, clean status, current main and worktrees before selecting execution branch.
- [ ] Inspect `docs/deploy.md`, `tests/databases.ts`, `packages/backend/src/config.ts`, `.env.example` and Docker volume paths. Resolve a supported PostgreSQL runtime without modifying a shared database or installing system services implicitly.
- [ ] Install exact lockfile dependencies with `npm ci`; record any registry/runtime incompatibilities rather than changing pinned versions opportunistically.
- [ ] Document secret injection and external data mounts; bind API/web/database to loopback with distinct available ports. Do not run the initialization script with its live switches enabled.
- [ ] Run `npm run typecheck`, `DATABASE_URL=<isolated _test URL> npm test`, `npm run build -w @aihot/web`, `npm run test:web`, then `node scripts/smoke.ts --base <local URL>` against the unmodified baseline. Record pass/failure and tested revision; stop feature execution on an unexplained failing baseline.
- [ ] Write reciprocal English/Chinese setup links and commit this independently useful baseline record.

## Task 2: Persist private topics and protect module APIs

**Files:** Create `modules/editorial-workbench/{package.json,module.ts,server.ts,contracts.ts}`, `backend/topics.ts`, `api/routes.ts`, `migrations/0101_editorial_topics.sql`, `migrations/0102_editorial_evidence.sql`, `migrations/0103_editorial_history.sql`, `tests/topics.test.ts`, `tests/access.test.ts`. Modify `site/modules/{index.ts,server.ts}`, `site/package.json`, lockfile workspace metadata, and Dockerfile package-copy list. Check migration filenames against current upstream before using these numbers.

**Interfaces:** `TopicStatus`, `ReviewStatus`, `Audience`, `EvidenceKind` use exact spec values. `createTopic(input: CreateTopicInput, actor: string): Promise<Topic>`; `updateTopic(id: string, expectedVersion: number, patch: TopicPatch, actor: string): Promise<Topic>`; `listTopics(filter: TopicFilter): Promise<{rows: Topic[]; nextCursor: string | null}>`. `Topic` includes UUID id, title, audiences, status, reviewStatus, privateNotes, version and timestamps. Evidence carries articleId, source URL/date, claim, limitations and kind.

- [ ] Write failing integration tests for CRUD persistence, duplicate source import, invalid enum/audience input, unknown article, stale versions and audit/history preservation.
- [ ] Write failing API tests: no session denied; missing/invalid CSRF denied; valid admin accepted; all responses `private, no-store`; note text absent from engine public outputs.
- [ ] Run the new tests under the existing database harness and confirm the failures identify the absent feature.
- [ ] Implement module-local tables with one statement per migration, schema checks and parameterized queries. Use existing adminHandler from `apps/api/src/routes/admin-auth.ts` for every `/api/admin/editorial/*` route, preserving CSRF and actor identity. No custom login or module preview privilege escalation.
- [ ] Expose GET/POST `/api/admin/editorial/topics`, GET/PATCH `/api/admin/editorial/topics/:id`, and POST `/api/admin/editorial/topics/:id/evidence`. Validate payloads with existing Zod dependency; return 400/404/409 for validation/missing/stale writes. Bound title to 300, notes to 20000, evidence claim/limitations to 10000 characters each; require at least one valid audience and HTTP(S) evidence URLs. Never fetch a user-supplied URL in this module.
- [ ] Use a unique evidence article association so importing the same article returns the existing topic; update topic and history in the same transaction. No engine publication writes.
- [ ] Run focused tests and type checking; commit the private topic API.

## Task 3: Build evidence packets, human review and safe export

**Files:** Create `modules/editorial-workbench/backend/drafts.ts`, `backend/review.ts`, `tests/drafts.test.ts`, `tests/review.test.ts`; extend module contracts, routes and new module migrations for draft storage as necessary without editing released migrations.

**Interfaces:** `prepareDraft(topic: TopicDetail): DraftPacket`; `exportDraft(topic: TopicDetail): {markdown: string; warnings: string[]}`. DraftPacket contains angle, factualSummary, audienceImpact, verificationQuestions and references. `verifyTopic(id: string, expectedVersion: number, actor: string): Promise<Topic>` requires evidence and zero unresolved verification questions.

- [ ] Write failing tests for explicit unknown dates, missing/withdrawn evidence warnings, source links, unresolved questions and private-note omission from Markdown.
- [ ] Write failing tests that evidence/draft edits invalidate verification, `published` requires verified review plus a valid external publication URL, and corrections preserve prior history while setting `needs_changes`.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement deterministic evidence-packet preparation with editable fields; empty facts remain empty and unknowns remain explicit. This is not an assertion of model-generated reporting. Exports escape raw HTML and keep source links; a separate DTO allowlist omits privateNotes and internal audit records.
- [ ] Add POST `/api/admin/editorial/topics/:id/draft` to prepare a packet, PATCH on the topic draft to edit it, POST `/:id/verify` for explicit human review, and GET `/:id/export` for authenticated download with unresolved-review warnings. No remote publication occurs.
- [ ] Enforce verification invalidation and publication preconditions in the backend, including direct API requests. No model calls needed for this release's packet; model-assisted prose drafting remains an unimplemented follow-up through the existing worker/budget mechanism.
- [ ] Run focused tests and existing publication boundary tests; commit review and export behavior.

## Task 4: Add the administrator's bilingual topic board

**Files:** Create `modules/editorial-workbench/web.tsx`, `web/board.tsx`, `web/topic.tsx`, `web/locales/{en.ts,zh-CN.ts}`, `web/locale.ts`, `tests/locale.standalone.test.ts`; modify module declaration and `site/modules/web.ts`. Add behavioral browser coverage in `apps/web/tests/editorial-workbench.test.ts` following existing browser harness patterns.

**Interfaces:** Admin pages `/admin/editorial` and `/admin/editorial/:id`; authenticated HTTP only. Locale helper `message(locale: 'en' | 'zh-CN', key: MessageKey): string`, falls back to English; persist the language selection in localStorage without storing editorial content there.

- [ ] Write failing behavioral tests for importing a source item, changing status/audiences, saving and reloading notes, visible stale-edit conflicts, review warnings, publication validation and Markdown export.
- [ ] Test English default, Chinese selection persistence and English fallback for a missing translation.
- [ ] Implement module admin pages with `adminPageGet`, existing admin shell/components and CSRF-aware HTTP writes. The source import UI uses existing content search and article IDs; no freeform URL scraping.
- [ ] Render workflow and review as separate controls. Show source kind/date, claims, limits, draft fields and unresolved questions; surface errors without clearing unsaved input. Use catalogs for every new visible string, including module navigation.
- [ ] Run browser tests with local fake services, type checking and web build. Inspect desktop/mobile layout and confirm anonymous users cannot open pages or data.
- [ ] Commit the usable internal workbench.

## Task 5: Document and validate the pilot release

**Files:** Create `docs/editorial-pilot.md`, `docs/editorial-pilot.zh-CN.md`, `docs/editorial-release-validation.md`; update project README and reciprocal language links while retaining original license/attribution and linking upstream documentation.

**Interfaces:** Pilot assessment records under `DATA_ROOT/ai-editorial/evaluations/<explicit-task-id>/`; no collected source data in Git. No shared latest/current pointer is updated automatically.

- [ ] Document a proposed 100-item labeled pilot covering both audiences, useful omissions, wrong event merges, unsupported summaries, editor time, accepted topics and actual processing cost. The corpus and calibrated thresholds remain pending real editorial labels.
- [ ] Document disabled live collection, internal-only perimeter, unimplemented model-assisted prose drafting, and future membership/publication work. Do not claim member feeds are implemented.
- [ ] Run all Task 1 checks on the complete branch; add end-to-end anonymous-access, note-leakage, stale-review and export checks with no external provider calls. Record exact source revision, commands and results.
- [ ] Review diff for credentials, machine paths, unsafe Docker exposure, accidental public routes, dependency churn and source copyright/attribution changes. Inspect every new output for private notes.
- [ ] Verify outgoing commits and origin push URL; open PR only against `runchengxie/ai-editorial:main`. Follow standing review/check/merge authorization; if main advances, validate the combined revision before merging. Never bypass failing required checks or upstream branch protections.
- [ ] Verify merged revision and local smoke result. No deployment is authorized by this release plan. Remove only this task's merged branch and worktree once clean, and fast-forward the clean main checkout.

## Plan self-review

The tasks cover discovery, evidence, selection, draft preparation, manual publication records and follow-up history. Model-assisted prose is deliberately deferred behind a usable editable packet; it must not be described as implemented. Membership and public exposure remain outside this release. No numeric ranking policy or final source catalog is silently approved. A real PostgreSQL baseline and browser tests are prerequisites, not completed checks.
