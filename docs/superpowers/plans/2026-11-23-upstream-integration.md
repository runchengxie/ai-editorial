# Upstream engine integration plan

**Goal:** Integrate AIHOT through `a1fbcb4` on fork base `c093b2e`, retaining the internal editorial product and paused operations.

**Architecture:** Preserve upstream ancestry with a merge and adapt conflicts to the fork's workspace packages. Keep English/Chinese product documentation and the independent static reader contract. Do not install a production release, migrate production, publish news or enable timers.

**Approaches:** Selected history-preserving integration with explicit exclusions, as authorized by the owner's request to integrate selectively. Cherry-picking anonymous engine-sync commits would hide dependencies; taking the upstream tree wholesale would overwrite fork boundaries.

## Tasks

- [x] Adapt extraction to combine `sourceId` with `includeCover: false`; preserve canonical configuration paths and adopt tag display mappings. Relocate six new migrations without modifying released SQL. Exclude the Japanese README and preserve the fork's entry documentation.
- [x] Test unknown generic-provider and Codex receipts older than the recovery threshold remain blocked. Watch failures before disabling automatic release; retain authorized manual recovery and historical structured attempt metadata.
- [x] Validate migration history, typecheck, build, standalone/backend/browser suites, daily contract checks, manual build, production imports, built-site smoke and MCP. Use only disposable synthetic databases and stub providers. Record exact source revisions and actual results.
- [ ] Obtain a fresh whole-branch review, fix material findings, verify the current target result and open a PR to the owner's fork. Merge after applicable checks, verify exact-main checks/manual deployment and remove only this task's branches/worktree.

## Review focus

- Free magazine extraction must still skip paid fallback and database-backed cover discovery.
- Unknown or stale receipts must not cause another billable request without operator recovery.
- Suppressed original content must remain summary-only across API/feed/sync outlets.
- Migration paths and report category identifiers must match this fork's existing schema/contracts.
- Automation must remain paused; source integration must not mutate production configuration or data.

## Progress

- Native worktree registration failed because the task root is a workspace container; Git fallback created the prescribed task worktree.
- Initial sandboxed standalone run failed on loopback `listen EPERM`; rerun outside that restriction is required. This was an environment failure, not an accepted test skip.

- Independent review found mixed legacy/persisted issue numbers can collide. Fixed-number allocation and its read fallback are excluded; existing whole-series numbering stays. Nullable schema additions are retained for upstream migration continuity, without enabling the feature.
- Recovery tests reproduced automatic release for both generic and Codex services before the compatibility entry point was made a no-op. Selected-news recovery state and alert wording now require operator action.
- First full backend run: 1247/1251 passed; three failures expected the excluded automatic release, and the new upstream clock-fixture gate exposed two pre-existing workbench timestamps. Tests now exercise authorized recovery; fixtures use an explicit past time.
- Web suite: 69/69 passed across Chromium and WebKit. Standalone: 356/356 passed. Manual preservation build passed.

## Final local validation

- Full backend suite: 1250 passed, zero failures/skips (final run; confirm runner summary).
- Typecheck and dynamic web build passed.
- Standalone: 356 passed; browser suite: 69 passed on Chromium and WebKit.
- Focused recovery/alerts/translation/Jina/ordinal suite: 69 passed.
- Both daily-brief checks: 7 + 1 passed.
- Migration history/online safety and manual/public-state preservation build passed.
- Seeded built-site smoke and MCP contract check passed on separate empty/synthetic task database.
- Production-only magazine import passed; explicit production dependency audit found zero vulnerabilities.
- Independent whole-branch review found one issue (mixed issue numbering); resolved by excluding that feature. No other material findings reported.
- Local results use fork base c093b2e and upstream a1fbcb4, with documented adaptations. GitHub checks must cover the committed PR and merged main revision.
