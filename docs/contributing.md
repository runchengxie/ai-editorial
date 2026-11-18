# Contributing to AI Editorial

[简体中文](contributing.zh-CN.md)

Open reproducible issues and focused PRs against [runchengxie/ai-editorial](https://github.com/runchengxie/ai-editorial). Discuss substantial product or architecture changes before implementation. AIHOT's discussions and metrics describe upstream, not support commitments for this fork.

Read [repository instructions](../AGENTS.md) and the relevant docs. Keep industry rules in `configs/industry/`, branding/site configuration in `configs/site/`, and fork-specific functionality in `modules/`. Preserve package names and public contracts when reorganizing paths. Shared machine credentials and production state stay outside Git.

Use a task branch/worktree and an isolated test database. Run the applicable type, standalone, backend, browser, build, migration and smoke checks listed in `AGENTS.md`; report actual results and environmental limits. Tests never use real paid providers or production data. Documentation changes should verify links, commands and current behavior without adding low-value tests.

Released migration files are immutable. New migrations follow the [online migration rules](architecture.md#数据库迁移). Explain data loss, deployment order and rollback limits before operational changes. A merged source change does not authorize production migration, publishing content or resuming a timer.

PRs target this fork's `main` unless upstream work was explicitly requested. Preserve contributors' authorship, satisfy current combined-result checks and repository protections, and do not force-push to rewrite history. Workspace integration authorization governs owner-assigned work. Dependency versions, locks and agent instructions can change when the owner's task requires it; upstream's external-contribution restrictions do not prohibit maintaining this fork.

Never submit secrets, production datasets, generated publications or unlicensed material. Remove sensitive information from diagnostic logs and screenshots. Retain [LICENSE](../LICENSE), [NOTICE](../NOTICE) and third-party resource licenses.
