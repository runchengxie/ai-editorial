# Five-commit upstream source update

[简体中文](upstream-five-upgrade.zh-CN.md)

This source update merges exactly `fe46be3`, `04a3d42`, `0c6f287`, `7b446b1` and `4c6e9e1` from AIHOT. It does not install a production release, run production migrations, enable providers or resume publication.

The inherited migration `0169_drop_selected_ledger_visible_at.sql` drops `selected_ledger.visible_at` and its dependent index. The column was redundant with `changed_at`; the new engine no longer reads or writes it. The upstream SQL comment records upstream approval only; it does not authorize changes to this fork’s production database. Obtain the owner’s separate approval, inspect dependencies and retain a verified backup before any production migration.

New code can run before this column is dropped. Old code still references the column, so after the migration it cannot safely be rolled back alone; use a coordinated database restore or a separately reviewed compatibility plan. Do not edit the released migration to manufacture rollback compatibility.

SocialData now uses the default egress path, tiny model input images are padded, and explicitly marked related-story sections are removed during sanitization. `rawDropKeys` was accepted but never implemented by the JSON collector; it is now rejected as an unknown key. Remove obsolete catalog occurrences before validating or importing those sources; no raw-data filtering behavior is lost.
