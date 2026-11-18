# AI Editorial

[Online manual](https://runchengxie.github.io/ai-editorial/) · [Manual publishing](docs/manual-site.md)

Read the [AI news website](https://runchengxie.github.io/ai-editorial-pages/) · [RSS](https://runchengxie.github.io/ai-editorial-pages/feed.xml). See [daily publication and its current limits](docs/daily-pages.md).

[简体中文](README.zh-CN.md)

An internal AI news workbench for an editor serving people who use AI in financial research, financial statements, data processing and software development. Built as a fork of [AIHOT](https://github.com/KKKKhazix/AIHOT), with an isolated editorial module.

Find source material, import topics, record claims and limitations, prepare editable evidence packets, review the draft and export Markdown for manual publication. Internal notes stay separate from exports. Changes to evidence invalidate review.

Scheduled generation/publication is paused; see [manual collection, generation and publication](docs/magazine.md#manual-evaluation-automation-paused). The existing website remains online.

## Start here

- [Article daily/weekly magazine](docs/magazine.md): local Codex generation, evidence, quota receipts and publication.
- [Free source catalog](docs/editorial-sources.md): 84 configured sources (79 enabled), core/optional selection and cost controls.
- [Local setup](docs/editorial-setup.md): Node.js, PostgreSQL, disabled external actions and local validation.
- [Data and configuration contract](docs/editorial-data-contract.md): source, private configuration, runtime data and evaluation outputs.
- [Validation record](docs/editorial-release-validation.md): tested revisions, checks and limitations.
- [Pilot workflow](docs/editorial-pilot.md): editor acceptance and source/quality assessment.
- [Design](docs/superpowers/specs/2026-11-16-editorial-workbench-design.md) and [implementation plan](docs/superpowers/plans/2026-11-16-editorial-workbench.md).
- [Project status and audit](docs/project-status.md): source, deployment, runtime adoption and pending work.
- [Repository layout](docs/repository-layout.md): configuration packages, documentation and stable public endpoints.
- [Inherited engine guide](docs/upstream-guide.md) and [architecture](docs/architecture.md).

After local setup, open `/admin/editorial`. The new workbench supports English and Chinese; inherited engine pages remain primarily Chinese. Draft preparation assembles an evidence packet without model calls; the separate magazine worker provides model-assisted prose generation.

The dynamic application and workbench remain internal; the separate [ai-editorial-pages](https://github.com/runchengxie/ai-editorial-pages) repository owns the public reader. The inherited anonymous site, RSS, API and MCP endpoints still exist, so protect the entire service with loopback binding or an authenticated perimeter. Membership, payments, gated subscriptions, live model-provider configuration and public deployment of the dynamic application are not included. Final branding and public legal text remain pending.

## Attribution

AIHOT provides the collection, analysis, event grouping, administration and publication engine. Retain [LICENSE](LICENSE) and [NOTICE](NOTICE). This fork is not the AIHOT production service and does not include its private source list or operating data. Source content remains attributable to its publishers.
