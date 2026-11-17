# Automatic public daily brief

[简体中文](daily-pages.zh-CN.md)

Read the [daily website](https://runchengxie.github.io/ai-editorial/) or subscribe to its [RSS](https://runchengxie.github.io/ai-editorial/feed.xml). English is the default; the language switch remembers an explicit selection. Original article titles are not translated.

## Current scope

The first release automatically selects up to eight source links from the past seven days, at most two per source. Financial-workflow and development/data keywords influence ranking alongside source tier and recency. These labels are rules, not model judgments. Entries retain their original publication time, source and link. No source bodies, internal notes or editorial drafts are exported. This version does not run a model, generate editorial summaries, verify claims or test products. The site says so visibly.

Only enabled RSS and free HTML listings in `industry/sources.json` participate. Optional paused sources remain paused. This standalone scheduled reader uses repository defaults, not administrator database overrides; changing its source set requires a reviewed source-config change. It neither requires nor exposes the internal API or PostgreSQL. Runtime administrator workflows remain separate.

## Publication

`.github/workflows/daily-pages.yml` targets 00:17 UTC / 08:17 Asia/Shanghai each day. GitHub schedules may be delayed. Successful main `Check` runs also trigger publication; manual dispatch is available on main. All routes require a successful push `Check` on the exact main revision. No human content approval is required.

GitHub may disable scheduled workflows after 60 days without repository activity. Check the workflow state during routine maintenance and re-enable it if disabled; manual dispatch is also available. See [GitHub schedule behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).

GitHub Pages must use the Actions publishing source. Build artifacts contain only whitelisted public metadata and static assets. Pages deployment uses the `github-pages` environment and GitHub's temporary token; no PAT or model secret belongs in the workflow.

If fewer than half of enabled sources return entries, or no safe dated entry is eligible, generation fails before deploy and the previous site remains. Source health and actual generation time are visible. A successful source read is not fact verification. The seven-day window avoids presenting an old article as today's release. Publication dates after generation are excluded.

The workflow restores only the latest successful Daily Pages run's `daily-public-state` artifact and retains up to 30 dated editions (and no edition older than 30 days). Artifacts expire after 90 days. If a previously published artifact is missing/expired, restore fails visibly rather than silently losing history; recover with a validated public `editions.json` in a reviewed maintenance change. Initial publication starts with no archive. Generated files live under the runner's temporary directory, never Git. Local retained evaluations belong under DATA_ROOT/ai-editorial/evaluations/<task-id>/.

## Local checks

```sh
npm ci --no-audit --no-fund
node scripts/daily-pages/daily.test.ts
node scripts/daily-pages/browser.test.ts
node scripts/daily-pages/build.ts --fixture --out /tmp/ai-editorial-preview
# Live free listing reads, no paid/model calls:
node scripts/daily-pages/build.ts --out /tmp/ai-editorial-live
```

`--state <external-file>` restores validated public editions; unknown fields are removed. Output directories must be outside this repository. Do not publish fixture output. The ordinary engine/module checks still apply when integrating upstream.
