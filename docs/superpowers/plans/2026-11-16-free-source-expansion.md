# Free source expansion

The user delegated source selection with a free/low-cost preference. This is a configuration update to the approved internal workbench, not a new collection engine or a live deployment.

- Preserve the existing 18 source identities and their URLs; reduce fresh-install backfill to two items and use conservative base polling intervals. Seeding remains insert-only and must not overwrite existing administrator settings.
- Add verified official company/engineering pages, practical AI publications, document/data tooling and Chinese AI coverage. Enable a useful core; leave high-volume or specialist feeds paused for explicit opt-in.
- Use RSS/Atom where actual parsing yields source dates. Use public GitHub releases JSON with published_at and stable-release filtering for tool updates; do not reinterpret Atom updated as publication time.
- No new dependency, paid collector, login, source token, full-text redistribution, model invocation or automatic external push.
- Verify bounded public reads and replay the captured responses through the existing collectors. Retain raw inputs and detailed reports only under DATA_ROOT/ai-editorial/evaluations/free-sources-20261116. Put compact provenance, limitations and activation instructions in aligned English/Chinese documentation.
- Run required type, backend, build, web, migration and smoke checks; independently review source selection and budget implications; use the standing PR/merge/cleanup workflow against the owner's fork.

Acceptance: each added configured source produces nonempty titled HTTP(S) items with reliable publication dates in the captured sample; optional candidates that return errors, HTML masquerading as feeds, truncation, or undated entries are not silently enabled. Verify the configured first-import cap in an isolated database with model/push switches off. Live feed availability and public API rate limits remain operational constraints, not quality guarantees.
