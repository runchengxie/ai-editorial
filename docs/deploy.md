# Deployment and runtime operations

[简体中文](deploy.zh-CN.md)

The supported publication path is a local Node.js magazine worker plus GitHub Pages for the static reader and MkDocs manual. No container or always-on web server is needed for these public sites. Dockerfile, Compose, container proxy templates and their CI job are retired. The inherited dynamic application remains available for internal use through [local setup](editorial-setup.md).

## Static websites

The independent reader publishes daily/weekly articles, archive, RSS and HTML exports. This repository's Pages publishes the manual while preserving the reader's v1 JSON dependency. Use the coordinated manual-only [website workflow](manual-site.md); documentation-only publication does not recollect or rewrite news. Do not create a second Pages publisher or upload fixture data.

## Local magazine worker

Use Node.js 24.22.2 or later and an explicitly provisioned PostgreSQL runtime. Store source releases and runtime data under DATA_ROOT and private settings under CONFIG_ROOT. Follow [magazine operations](magazine.md) and the [runtime upgrade guide](runtime-upgrade.md). Reader requests never invoke this worker. Installation does not enable its timer, and generation/publication remain separate explicit commands.

## Updates and migration safety

Install only a clean checked main release. Back up the dedicated database and verify a full restore before a destructive migration. Migration0169 deletes an unused ledger column and index, so old code cannot be restored alone after applying it. Its operator approval, rehearsal, backup and rollback requirements are documented in [upstream migration notes](upstream-five-upgrade.md). Never edit a released migration or discard receipts to retry uncertain calls.

## Custom domains and HTTPS

GitHub Pages provides HTTPS for the static sites and supports custom domains through its settings. A publicly reachable dynamic application needs a separately configured authenticated perimeter and reverse proxy. This fork no longer ships a container Caddy template. Preserve cache headers if using your own proxy; do not expose internal admin/provider endpoints merely because the static sites are public.

## Historical release notes

[Archived upstream deployment and release notes](history/upstream-deployment.zh-CN.md) retain previous engine changes, not supported container instructions. Current setup, CI and operator commands are owned by this fork. The repository is no longer marked as a GitHub template; it retains upstream commit history for selective synchronization.
