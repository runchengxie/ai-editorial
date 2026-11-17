# Separate Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Separate the engine and public reader into two independently maintained repositories without disrupting daily publication.
**Architecture:** Keep the existing public editions.json v1 data endpoint in the producer, move static rendering/assets/RSS to ai-editorial-pages, and publish each with its own workflow. Independent schedules avoid new runtime credentials.
**Tech Stack:** Node 24, TypeScript, GitHub Actions/Pages, existing free collectors.
**Spec:** docs/superpowers/specs/2026-11-17-separate-pages-design.md

## Global Constraints
Two repositories only; same reader design; English default/Chinese switch; no model/paid calls; no private editorial data; generated output outside Git; at most 30 editions; newest producer data at most 48 hours old; green exact-main checks required for deployment.

## Review Focus
- Malformed/stale data must preserve the currently published website.
- Archive titles/dates/URLs cannot inject HTML or JSON private fields.
- Consumer builds must not depend on engine source, credentials or runtime databases.
- Producer history must survive the workflow refactor and old links must redirect after migration.
- Provider and consumer merge/deployment order must avoid a broken new-site link.

## Tasks
- [ ] Add producer v1 schema and tests, separate data generation from rendering, remove daily UI assets/tests, update producer CI/docs and keep the existing workflow filename/state artifact for history.
- [ ] Implement independent consumer validator/fetcher and static build with migrated UI/locales/RSS. Unit/browser test malformed inputs, freshness, language, mobile, archive and source attribution. Record cross-repository validation.
- [ ] Add consumer CI and guarded daily deployment. Review both repositories independently, fix important findings, open one PR in each repository.
- [ ] Merge provider first after checks; merge/deploy reader against existing production v1 data; then dispatch producer to switch old entries to redirects and reader to verify new data. Verify websites, schedules, RSS and archive; clean only these task branches/worktrees.

## Ledger
- User explicitly requested this split after confirming two repositories means one new repository; proceed inline under standing integration authorization.
- New repository bootstrapped with documentation/license only at 75e982b; all implementation will go through its feature PR.
- Ruling: retain the producer's workflow filename daily-pages.yml while changing its displayed name to Daily Data. Its recorded runs/state artifacts already exist under this workflow identity; preserving that identity avoids losing published history.
- Review outcome: no code blockers; reviewer identified the scheduled cutover race. Paused producer daily-pages.yml through GitHub (disabled_manually) until new reader deployment is verified, then re-enable and manually publish. No new flag or credential added to either workflow.
- Local validation sequencing: first backend invocation ran before the dynamic web build existed and failed metadata tests with ERR_MODULE_NOT_FOUND. Build the existing dynamic app first, complete browser checks, then rerun backend; no product code change is needed for this setup error.
- Local validation: dynamic web build and69 browser tests pass; full backend rerun1173/1173 pass after building required server artifact. Independent reader contract/build6 tests, browser1 test, typecheck, production-data build and new producer-fixture contract build pass. Migration safety passes. Review final recheck clean, including invalid-input output preservation.
- Final local engine smoke/API/MCP checks pass on task ports21843/21844. Earlier preview attempt collided with a system ephemeral-range port; moved the evaluation ports below that range without changing product code. Current source configuration remains45/30 and private module unchanged.
