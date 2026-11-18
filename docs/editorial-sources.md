# Editorial sources

[简体中文](editorial-sources.zh-CN.md)

The source pack now configures **84 sources:79 enabled and5 paused**. `configs/industry/sources.json` is authoritative for the magazine worker. The broader research/engineering expansion adds nine free feeds to the prior75/70 pack. Counts describe configured defaults, not guaranteed daily output. Verification:2026-11-18.

## Coverage and discovery

| Coverage | Sources added or activated |
| --- | --- |
| AI products and research | Google AI; Claude News, Anthropic Research, Cohere, Ai2, AISI and Mila through the Alan Turing Institute's maintained RSS bridge; Ahead of AI |
| Financial/data workflows | FactSet Insight, OpenBB releases, Databricks, Polars releases and topic-filtered R-bloggers |
| Developer tools | Existing13 release APIs for Codex, Claude Code, Pydantic AI, LangGraph, LiteLLM, pandas, Docling, MarkItDown, Unstructured, MCP Python, LlamaIndex, Streamlit and VS Code |
| Chinese coverage | IT之家, 爱范儿, 极客公园; BestBlogs bridges for机器之心、新智元、晚点AI、硅星人Pro、智谱; existing量子位 |
| Engineering and curation | Topic-filtered Cloudflare; Last Week in AI |

Discovery directories are [BestBlogs article OPML](https://github.com/ginobefun/BestBlogs/blob/main/BestBlogs_RSS_Articles.opml), [BestBlogs WeChat OPML](https://github.com/ginobefun/BestBlogs/blob/main/opml/bestblogs_wechat2rss_opml_all.opml), [Turing AI RSS](https://github.com/alan-turing-institute/ai-rss-feeds), [Engineering Blogs](https://github.com/kilimchoi/engineering-blogs) and [AI4Finance resources](https://github.com/AI4Finance-Foundation/Awesome_AI4Finance). They are candidate catalogs, not blanket imports or content-use permission. Prefer original publishers and retain source links. No paywall is bypassed; site_fulltext and syndicate_fulltext remain false.

Mistral's old endpoint was replaced by the maintained Turing feed while preserving its source ID. Native Chinese feeds and broad vendors are filtered by the site's AI/data-workflow policy in `configs/industry/magazine.ts`. Source/publisher caps and weighted audience rotation prevent high-volume publishers or general hardware coverage from taking the whole edition. Final event merging still depends on the model; deterministic URL/exact-long-title deduplication is not semantic deduplication.

## Access and original dates

The magazine supports guarded direct RSS, HTML and GET GitHub release JSON. Its existing designated GitHub credential file is read once into the worker environment for authenticated public release reads, resolving the observed anonymous shared-IP rate limit. The existing collector sends it only to GitHub's fixed API; same-origin redirect rules remain. No credential copy or paid collection provider is introduced, and the Codex child environment excludes GitHub/database/API credentials. Generic continuous collectors require their own explicit configuration; this does not silently provision one.

Release feeds use original published_at and exclude prereleases. Atom updated is never substituted for publication. Vercel's Atom returned100 entries but no published dates in the actual parser, so it stays paused. Other paused entries are Lilian Weng, arXiv AI, FinGPT releases and FinRobot releases. arXiv returned717 entries and needs a separate relevance/volume policy; low-frequency financial projects remain useful candidates without being counted as active news coverage.

The five Chinese bridges initially returned403 in discovery probes, but later passed captured-response replay and a second read through the real production collector, each with10 dated entries. They are enabled on that evidence, with availability dependent on a third-party service. Individual failures are skipped; the existing50% listing-health guard still prevents publication on broad collection failure. The Decoder returned403 in this capture; its existing configured status is preserved rather than changed after one transient failure.

## Verification and limits

Captured public responses were replayed with external network disabled through the real RSS/HTML/JSON parsers. GitHub release captures used the existing designated CLI account after anonymous requests were rate-limited. All66 enabled sources except one transient failure produced dated entries. On the same captured corpus, the old magazine selection chose8 daily/16 weekly candidates; expanded selection chose30 daily from20 sources and60 weekly from33 sources. These are listing-level measurements, not guarantees of article-body extraction, factual accuracy or final prose counts. The obsolete Mistral URL is excluded from baseline selection and counted only after replacement. Full captures, comparisons and validation records live under DATA_ROOT/ai-editorial/evaluations/source-expansion-20261118, outside Git.

New source first-import limits remain2/source. The configured79-source default therefore has a158-entry initial ceiling for the generic continuous collector; later runs have no such daily cap. The magazine instead selects at most30/60 candidates and bounds private text per item. It uses one Codex call per generated issue and preserves the existing3-call rolling24h budget; longer packets consume more subscription quota per call. See [magazine operations](magazine.md).

## Apply

The scheduled magazine reads the checked release's source file directly. The separate v1 compatibility builder still reads only RSS/HTML. The generic admin/continuous pipeline can import missing source IDs with `scripts/seed.ts`; seeding never overwrites existing enabled/config/interval choices, so existing admin records need deliberate updates. No continuous collection worker is started by this source change. Keep private settings under CONFIG_ROOT and generated data under DATA_ROOT.

## Financial-workflow pilot

Added native [AlphaSense RSS](https://www.alpha-sense.com/feed/), [EdgarTools releases](https://github.com/dgunning/edgartools/releases), [Arelle XBRL releases](https://github.com/Arelle/Arelle/releases), and [dlt releases](https://github.com/dlt-hub/dlt/releases). All four returned dated public material in the real2026-11-18 check. For the complete9–15November window, the collector yielded four new finance evidence items from EdgarTools/Arelle; the previous saved47-item packet plus these items produced51 candidates from28sources. AlphaSense's newest item was6November and dlt's newest stable release29October, so neither was passed off as this week's news.

Version-only titles from the two financial filing tools are classified as finance. Explicit XBRL/10-K/financial-statement workflows are discoverable; selected financial publishers may use the feed excerpt to identify the workflow. Generic financial-company data-center/lawsuit stories remain general. The existing rotation, source/publisher caps, numeric/quote checks and model budgets are unchanged. Several guessed RSS paths returned404, a Daloopa path returned HTML rather than RSS, and Bloomberg/Snowflake feeds returned403; these were not added. Raw captures and the dated pilot packet stay outside Git. See [single-edition acceptance](magazine.md#single-edition-pilot).

## Broader research and engineering coverage

The next source expansion adds nine free feeds, bringing the pack to **84 configured sources,79 enabled and5 paused**:

| Source | Role and limits |
| --- | --- |
| [arXiv API](https://info.arxiv.org/help/api/user-manual.html) | One targeted query for financial/document/tabular AI research; abstracts only, original publication dates, no PDFs. The broad arXiv AI feed remains paused. |
| [Hacker News via hnrss](https://hnrss.org/) | Unofficial discovery bridge, minimum50 points; verify linked original publication rather than submission time. At most8 original checks per collection. |
| [Interconnects](https://www.interconnects.ai/feed) | Research and industry interpretation, attributed as commentary. |
| [ClickHouse](https://clickhouse.com/rss.xml) | AI/data engineering; up to4 original-date checks. |
| [LangChain](https://www.langchain.com/blog/rss.xml) | Agent engineering and evaluations; up to8 original-date checks. |
| [Sebastian Raschka](https://sebastianraschka.com/rss_feed.xml) | Technical reading and architecture analysis. |
| [Netflix TechBlog](https://netflixtechblog.com/feed) | Topic-filtered ML and engineering practice. |
| [GitHub engineering](https://github.blog/engineering/feed/) | Topic-filtered developer engineering. |
| [Google Developers](https://developers.googleblog.com/feeds/posts/default/) | Topic-filtered engineering; undated feed entries require original dates, at most4 checks. |

Research/community lanes are capped at2 each daily and3 each weekly, within existing30/60 candidate and publisher limits. Broad feeds can establish relevance through the first2000 characters of supplied body text as well as titles/excerpts. Publication prose must distinguish research, engineering accounts and product announcements. A feed's presence does not guarantee an item every day.

The 9–15November replay combined a prior51-item packet with new verified materials into64 unique evidence items; the selector retained60. Four LangChain items were excluded because their original dates were in August/October despite fresh RSS dates. A new NoLBERT earnings-call paper, a trading-agent benchmark, document-embedding research and engineering case studies added useful depth. Native collection yielded11 usable items from five of the nine new feeds; the initial guarded listing check succeeded for six, with transient HN/LangChain/Google failures. Captured public responses and native results are separate evidence, not a claim that all feeds are continuously healthy. Netflix's article page returned403; its public RSS body was used without bypassing that response.

The local acceptance edition expands the saved8-feature/16-brief draft to12 features/25 briefs, citing45 articles from28 named feeds. This was an editorial expansion of saved evidence, **not a new Codex generation**; new prompt targets remain to be tested on a future budget-authorized run. Evidence/number/schema and bilingual reader/browser checks are recorded under `DATA_ROOT/ai-editorial/evaluations/broader-news-20261118`. It was manually published on18November; scheduled generation stays disabled. See [project status](project-status.md) for artifact and deployment evidence.
