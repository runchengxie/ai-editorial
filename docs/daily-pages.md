# Daily data publication

[简体中文](daily-pages.zh-CN.md)

The reading website and RSS now belong to [ai-editorial-pages](https://github.com/runchengxie/ai-editorial-pages), at [the new website](https://runchengxie.github.io/ai-editorial-pages/). This repository owns free-source collection, ranking, the private workbench and the [public v1 data contract](daily-brief-v1.md). The inherited dynamic app is not the public static reader.

## Producer operations

`Daily Data` (`.github/workflows/daily-pages.yml`) collects enabled free RSS/HTML sources only by explicit manual dispatch on main. Scheduled collection is paused; the workflow has no cron trigger. Every run requires successful push checks on the exact main revision. The existing workflow filename, concurrency group and `daily-public-state` artifact name are retained to preserve real publication history. Successful source-code checks do not publish data automatically; this permits provider-first migration without switching the old website early.

`node scripts/daily-brief/build.ts --out <external-directory>` writes `editions.json`, `latest.json`, minimal redirects for the old home/language/archive URLs and an RSS migration notice linking the new feed. It contains no reader templates, CSS or locale catalogs. New website/RSS development happens only in the reader repository. Never publish `--fixture` output.

The latest successful data run's state artifact restores history (up to 30 dated editions/30 days, artifacts retained 90 days). Collection fails before deployment below 50% source health or with no eligible dated links. A missing previously published archive fails visibly. The producer emits up to eight original source links from seven days, maximum two per source, ranked by topic keywords, source tier and recency; no model-generated summaries or human fact verification are claimed.

Generated production state is held in GitHub Actions artifacts and published as data on the engine's Pages endpoint. Local retained evaluation data belongs under DATA_ROOT/ai-editorial/evaluations/<task-id>/; outputs are never committed to Git. No private workbench state is read by this task. No long-lived token or model key is required.

## Migration and validation

Merge the provider PR first, leaving the existing deployment in place. Deploy the new reader against the already-published v1 endpoint. Only after that website is verified, manually dispatch Daily Data to publish data and redirects, then dispatch the reader to verify the complete chain. Consumers must never depend on an unmerged provider branch.

Run root typecheck, engine/web checks, `node scripts/daily-brief/daily.test.ts` and `node scripts/daily-brief/output.test.ts`. Validate the producer output with the reader's independent validator and record both revisions.

Keep collection manual during evaluation. See [manual evaluation and later reactivation](magazine.md#manual-evaluation-automation-paused). Source checks do not dispatch this workflow.
