# Upstream integration, 23 November 2026

[简体中文](upstream-integration-20261123.zh-CN.md)

Integrate AIHOT through `a1fbcb4` (23 commits after `88b114d`) into fork base `c093b2e`. Preserve upstream ancestry to support future updates. The engine remains internal and the independent static reader keeps its current deployment and magazine contract.

Adopt publication/API projection consistency, summary-only suppressed originals, evidence-aware story digest versions, surviving-story links and report deduplication, source-aware cover checks, material identity/X-account reliability, grouped provider-outage alerts, dynamic-site accessibility/layout/link improvements and upstream test/CI reliability checks. No package or lockfile dependency change is needed.

## Fork adaptations and exclusions

- Keep English/Chinese entry documentation, the historical upstream guide, fork branding/configuration, magazine evidence validation and paused publication workflows. Do not add the upstream Japanese README.
- Combine the new extraction `sourceId` option with the fork's `includeCover: false` and `paidFallback: false` behavior. Free magazine extraction still avoids database-backed cover discovery and paid fallback.
- Unknown billable outcomes require operator review and explicit recovery, for both generic providers and Codex. Retain structured attempt metadata, but the compatibility automatic-release entry point releases nothing. Selected-news admin status and operator alerts agree with this rule. Manual release stays transactional with audit and queue resumption.
- Defer fixed persisted issue numbering. Review found collisions between legacy date-ranked rows and newly persisted numbers when historical issues are inserted. Keep existing whole-series numbering across index, detail and navigation. Nullable issue-number schema additions are retained for upstream migration continuity; no current writer/reader enables this feature.
- Place six upstream SQL additions under `packages/backend/migrations/`. Released migrations are unchanged. These additions retain data; the summary-only constraint is `NOT VALID` and does not retroactively scan existing rows. Existing inconsistent rows would need investigation before a separately authorized production rollout.

## Verification and operational boundary

Local checks use Node 24.22.2, PostgreSQL 18.6, disposable task databases and local provider stubs. Source integration does not authorize production migration, installation of a new stable worker, collection/model calls, publication or timer activation. Production remains on its existing release until a separate authorized rollout.

See the [implementation and verification record](superpowers/plans/2026-11-23-upstream-integration.md) for checks and encountered failures. Exact PR/main checks provide the integration gate. The six new engine migrations must precede any future runtime adoption; a source merge alone does not run them.
