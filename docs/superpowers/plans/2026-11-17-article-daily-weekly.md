# Article Daily and Weekly Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically generate grounded bilingual daily/weekly articles with Codex and publish the reference-inspired reading experience.
**Architecture:** A site-specific engine magazine module collects public evidence, invokes the local Codex worker through existing receipts/budgets, stores a public v2 issue library, and publishes hash-addressed release data. The independent reader validates and renders that library.
**Tech Stack:** Node24, TypeScript/Zod, PostgreSQL, installed Codex CLI, GitHub Actions/Pages, systemd user timers.
**Spec:** docs/superpowers/specs/2026-11-17-article-daily-weekly-design.md

## Global Constraints
Preserve v1 and source configuration; no credential transfer; paid/quota calls use receipts and explicit3/day budget; no automatic retry of unknown outcomes; public payload excludes raw text/quote anchors/private notes; retain30 daily and12 weekly editions; English default/Chinese switch; generated data outside Git; production uses a checked stable release, not a worktree.

## Review Focus
- External evidence cannot cause tools, credential reads or arbitrary public URLs.
- Invalid citations, quotes, numbers and future dates cannot be published as grounded facts.
- Failed/uncertain CLI runs do not consume repeated quota or replace published content.
- Reader rejects corrupt/stale/hash-mismatched data before deployment; daily and weekly periods remain truthful.
- Local timers, source release and publication use explicit roots and preserve unrelated services.

## Tasks
- [x] Build/test magazine schemas, period selection, free evidence packets and private-to-public projection.
- [x] Build/test Codex receipt adapter, bounded worker composition/cache and release publisher; evaluate a real grounded daily and weekly result without public writes.
- [x] Build/test independent v2 reader contract, reference-style layout, daily/weekly archive/navigation, RSS and export HTML; browser-check desktop/mobile.
- [ ] Independent whole-task review; complete checks and merge provider before consumer. Provision only this project's stable local runtime/config/timer, publish generated library, deploy reader, verify live chain and clean task branches.

## Ledger
- User explicitly chose existing non-interactive Codex login for generation. Initial fictional structured-output probe succeeded; it is not a published issue.
- Existing project has no model API configuration or production PostgreSQL. Provision a dedicated instance; reuse no test cluster and copy no Codex credentials.

- Implementation reviewed independently; pending/unknown receipt replay, persistence recovery, database ownership and startup readiness findings fixed and re-reviewed. Local validation: 1,189 backend tests, 69 web tests, root typecheck, whole-site smoke and MCP passed; reader contract/build/browser/typecheck passed. Real isolated Codex evaluation generated one daily and one weekly issue using two quota calls, with saved responses revalidated without repeat calls. Production integration/deployment remains the final task.
