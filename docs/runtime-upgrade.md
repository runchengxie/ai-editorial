# Local worker upgrade

[简体中文](runtime-upgrade.zh-CN.md)

The local magazine runs directly on Node.js and PostgreSQL, independently of the static websites. Installing a checked immutable release updates its private release pointer and managed user units. It does not enable generation, publishing or its timer. The installer now uses `npm ci --omit=dev`: the worker needs runtime dependencies, not Vite or other web development tooling. CI verifies that the generation modules import with this dependency set and audits the production dependency tree.

## Before an upgrade

Require successful push-main checks on the exact source revision, a clean primary checkout, an owned project database/cluster and the stable PostgreSQL binary/library paths. Keep the timer disabled and generation service inactive. Record the previous release, unit definitions, receipt counts, quota and public-data digest. Private configuration belongs under CONFIG_ROOT; backups/results belong under DATA_ROOT with owner-only access.

Back up the database using a matching `pg_dump`, restore it into an isolated test database, apply the pending migration there and verify both data preservation and full-backup recovery. Inspect database dependencies before changing production. Do not edit migration history or infer production authorization from an upstream comment.

## Migration 0169

The 18 November rehearsal backed up the database, restored it, dropped `selected_ledger.visible_at` on the isolated copy and proved a full restore recovered the old schema. The ledger had zero rows, and all four receipts/attempts were preserved. The column's only recorded dependencies were its default, NOT NULL constraint and index. Production remains unchanged until the approved installation executes migration 0169. The operator separately approved this deletion and runtime upgrade after the rehearsal; retained task evidence identifies the backup and checksums.

Once applied, old code that still expects this column cannot be restored alone. A rollback must coordinate the previous immutable release, private configuration/units and full database restoration while generation remains stopped. Never restore an old receipt ledger over new calls; investigate any activity after the backup before a rollback.

## Installation and validation

Run the existing `scripts/magazine/install-local.ts` from clean main with explicitly resolved CODE_ROOT, DATA_ROOT, CONFIG_ROOT, MAGAZINE_PG_BIN and MAGAZINE_PG_LIB. The script verifies main checks, ownership and applied migrations, preserves existing quotas and leaves timer activation to the operator. No credentials are copied into source or GitHub.

After installation verify the configured revision, source catalog path/count, imported runtime modules, receipt/attempt counts, quota and schema. Check `systemctl --user is-enabled ai-editorial-magazine.timer` remains disabled and the generation service remains inactive. Test command help/imports with external actions disabled; do not use a generation request as a smoke test. Actual post-upgrade evidence is recorded separately from this procedure.

See [magazine operations](magazine.md) for explicit future generation/publication and [dependency security](dependency-security.md) for the unresolved development-only advisory.
