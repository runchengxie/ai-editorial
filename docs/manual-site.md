# Manual website operations

[简体中文](manual-site.zh-CN.md)

The pinned MkDocs version is **1.6.1**, listed in the [official release notes](https://www.mkdocs.org/about/release-notes/#version-161-2024-08-30). Build settings follow the [official configuration reference](https://www.mkdocs.org/user-guide/configuration/).

The [engine manual](https://runchengxie.github.io/ai-editorial/) uses MkDocs' standard theme. The [news reader](https://runchengxie.github.io/ai-editorial-pages/) remains an independent application. English is the manual's default; Chinese pages are available from navigation and reciprocal links.

## Build locally

Use a Python virtual environment outside the checkout and install `configs/requirements-docs.txt`. Run:

```sh
python -B scripts/docs/build.py --state /path/to/successful-public-state --out /tmp/editorial-manual-site
```

`--state` must contain a nonempty `editions.json` from a successful publication. A complete current artifact also contains `latest.json`, dated redirects, `zh-CN.html` and `feed.xml`. The output directory must be new or empty. Outputs and the temporary curated Markdown staging directory stay outside the repository. No database, collection job or model is used.

Only the pages named in `configs/mkdocs.yml` and `docs/manual/` are included. Links to other repository documentation or source files open GitHub. Internal instruction files and historical design records are not copied into the manual. Update both languages when changing current instructions. MkDocs runs in strict mode, including local link and anchor checks. Unicode heading anchors work in both languages.

## Publish manually

After successful checks on the exact main revision, manually dispatch **Daily Data** with mode **docs** (the default). It restores the most recent successful `daily-public-state` artifact and builds the manual around that data without collecting sources. Mode **refresh** explicitly collects free listings first, then builds the same combined site. Neither option enables a schedule or calls a model.

One workflow and concurrency group own Pages. Do not use `mkdocs gh-deploy`, add another Pages publisher, or upload a plain documentation build: that would remove public data. The combined artifact preserves existing JSON bytes, dated reader redirects and the RSS migration notice. The root index becomes this manual; `zh-CN.html` remains a compatibility redirect to the reader.

Older artifacts contain only `editions.json`; the builder retains those bytes and reconstructs `latest.json` from its first edition, plus deterministic redirects and the migration notice. New artifacts retain all compatibility files. Missing or expired previously published state stops deployment; recover a known successful archive before retrying. No empty archive is substituted.

Artifacts expire after 90 days. Before a long hiatus, retain a successful public-state artifact under the project's external data directory. A docs update does not extend the source edition's date or freshness.
