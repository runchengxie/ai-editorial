# Internal pilot validation

The workbench is implemented for internal pilot use. It is not publicly deployed, member-gated or connected to live model/collection credentials.

## Reviewed source

- Upstream baseline: `209417b0dd614460926ba7d96760794d07d83711`.
- Independent review: feature commit `4205ac7`; findings fixed in `891f0d7`.
- Validated implementation: `891f0d7fc8394e26436b2341a86c6f72d4410bb5`. Later workflow/documentation commits do not alter application behavior.
- Node.js 24.22.2; local PostgreSQL 18.6; Chromium 149 and WebKit 26.5.

## Evidence

| Check | Result |
|---|---|
| `npm ci --no-audit --no-fund` | Passed; lockfile preserved except the new local workspace |
| `npm run typecheck` | Passed |
| `npm run build -w @aihot/web` | Passed |
| `npm test` | 1173 passed, zero failures |
| Focused backend plus architecture | 24 passed, zero failures |
| New editor browser workflow | 2 passed, including anonymous denial, pending-save protection, conflict preservation, language persistence and export |
| `npm run test:web` | 67 passed, zero failures in the final sequential run |
| Migration history/online safety | Passed against upstream baseline |
| `node scripts/smoke.ts --base <loopback-url>` | All checks passed on a separate empty smoke database |
| `node scripts/mcp-check.ts <loopback-url>/api/mcp` | Contract check passed, including expected invalid-input errors |
| Visual inspection | Desktop board/detail and Chinese mobile layout inspected using synthetic preview data |
| GitHub PostgreSQL 17 and Docker jobs | [CI run for `653e9d2`](https://github.com/runchengxie/ai-editorial/actions/runs/43886967921); current-head checks are linked from [PR #1](https://github.com/runchengxie/ai-editorial/pull/1) |

Tests use only synthetic data and local provider stubs. No live collection, paid model calls, external messages or public deployment were performed. The real-source pilot, editorial thresholds and processing costs have not been measured.

## Review findings addressed

Checked evidence now carries the source revision the editor viewed, and stale revisions are refused. Inputs are disabled while a save or draft preparation is pending. List and detail responses agree when a source revision invalidates review. Published topics retain a valid publication link. Tests reproduced these failures before the fixes, then passed. No review findings were deferred.

## Implementation decisions and limits

1. Reused the original task worktree/PR for this one deliverable; no unrelated workspace was modified.
2. Used PostgreSQL 18 locally because it was available as an extractable runtime, while inherited CI retains PostgreSQL 17. Cross-version compatibility depends on that CI result.
3. Continued implementation while correcting known baseline setup errors, with final validation required before integration.
4. Committed topic and draft APIs together because they share review/version transaction contracts.
5. Disabled disk durability only on the disposable synthetic-test cluster after external-drive checkpoint stalls. These runs do not establish database crash durability, and no production database was changed.
6. Treated stale review badges and removable publication links as meaningful editorial correctness problems and fixed both, despite their initial Minor review labels.
7. Used task-only browser bundle copies to preserve the temporary library path because the bundled WebKit launcher overwrites it. Shared browser caches and system libraries were not changed.

<details>
<summary>Validation setup findings</summary>

An early smoke service held the test template database open; later smoke checks use a separate database. An original-checkout baseline run lacked its built web assets; all final checks build first. Early WebKit runs preceded browser installation or lacked shared libraries. Rebuilding while a browser suite was running invalidated hashed assets; the final browser run uses a stable build. One WebKit keyboard test failed under concurrent local load and then passed in isolation on both upstream and the implementation; the final sequential suite is recorded above.

The upstream backup tests passed independently (15/15). A full run initially timed out during disposable-database teardown on the external drive; after addressing test-cluster checkpoint waits, the final complete backend suite passed. None of these setup failures were hidden by skipping tests or weakening checks.

</details>
