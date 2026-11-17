# Daily Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate upstream and deploy an automatically refreshed public source brief.
**Architecture:** Existing guarded collectors feed a public-only DTO in the publication layer; a separate static generator builds bilingual HTML, RSS and JSON. GitHub Actions preserves successful editions and deploys Pages.
**Tech Stack:** Node 24, TypeScript, existing collectors, GitHub Pages/Actions.
**Spec:** docs/superpowers/specs/2026-11-17-daily-pages-design.md

## Global Constraints
No human gate; no private editorial data export; no paid calls or model keys; eight entries/two per source/seven-day window; fail below 50% source health or zero eligible entries; English default with Chinese switch; retain 30 dated editions outside Git.

## Review Focus
- Untrusted title/URL cannot execute HTML or script.
- Source failure cannot replace a working edition with empty output.
- Invalid/future/stale dates and duplicate URLs cannot distort selection.
- Previous state cannot introduce private fields, unsafe URLs or unlimited history.
- Only validated main is deployed; failed build leaves current website unchanged.

## Tasks
- [ ] Integrate upstream 7fa763d; verify types, engine/module tests, migrations and browser checks; preserve custom sources/module.
- [ ] Write failing offline tests for public DTO selection, health threshold, escaping and retained archive validation; implement publication/daily.ts and standalone renderer/build script; run tests to green.
- [ ] Add pinned daily Pages workflow, bilingual operations docs and README links; verify fixture build and browser behavior, then real free collection.
- [ ] Independent whole-branch review; fix important findings, validate current combined revision; PR, merge and deploy; verify live website/schedule, cleanup task branch/worktree.

## Execution ledger
- User explicitly requested immediate automatic deployment; proceed inline without another design approval round.
- Upstream merge has no textual conflicts. This is a merge, not replacement by upstream files.
- Validation: upstream merged without conflicts; 1173 backend tests, 294 standalone tests, 69 web tests, 8 daily unit tests and 1 dedicated browser test pass. Root typecheck, web build, migration safety, API smoke and MCP contract pass. Real source probe: 26/30 available, eight selected links; checked desktop/mobile screenshots.
- Review: independent reviewer found restored publication-date attribute injection; reproduced RED, fixed ISO validation/canonicalization and escaped attributes, GREEN. Final recheck found no important issues. Workflow restore skips all-skipped successful runs and refuses to lose missing published archive state.
- Ruling: public first release uses rule-ranked metadata rather than model prose because no live model credentials/budget have been provisioned; clearly disclosed in both languages, no secret lookup or paid calls added.
- CI found the new files duplicated Beijing-time handling; the architecture test enumerates tracked files, so the first pre-commit local run did not cover the untracked files. Reproduced after commit; replaced both with shared contracts/time helpers. Rerun validation on tracked sources before integration.
