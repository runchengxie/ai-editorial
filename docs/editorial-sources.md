# Free and low-cost source catalog

[简体中文](editorial-sources.zh-CN.md)

The pack contains **45 sources: 30 enabled and 15 paused options**. It retains the original 18 source IDs and URLs and adds 27 verified sources. `industry/sources.json` is the authoritative runtime configuration. Verification date: 2026-11-16; availability and feed contents can change.

The 12 enabled additions cover official AI announcements, agent engineering, coding tools, spreadsheets, analytical data and practical AI use. The 15 options are 13 GitHub release APIs and two specialist publications. All added endpoints can provide public data without a paid collection subscription; public access does not grant full-text redistribution rights.

## Enabled additions

| Source | Kind | Base interval | Dated items verified | Purpose |
|---|---|---:|---:|---|
| [Anthropic News](https://www.anthropic.com/news) | `web_list` | 6 h | 20 | Official Claude/model and product announcements |
| [Anthropic Engineering](https://www.anthropic.com/engineering) | `web_list` | 12 h | 24 | Agent engineering, context design and evaluations |
| [DuckDB Blog](https://duckdb.org/feed.xml) | `rss` | 12 h | 10 | Local analytical data workflows |
| [Microsoft Excel Blog](https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=ExcelBlog) | `rss` | 12 h | 20 | Spreadsheet analysis and Copilot workflows |
| [Microsoft Python Blog](https://devblogs.microsoft.com/python/feed/) | `rss` | 12 h | 10 | Python tooling and development workflows |
| [Cursor Changelog](https://cursor.com/changelog/rss.xml) | `rss` | 4 h | 50 | AI coding tool changes |
| [Model Context Protocol Blog](https://blog.modelcontextprotocol.io/index.xml) | `rss` | 12 h | 29 | MCP protocol and ecosystem updates |
| [One Useful Thing](https://www.oneusefulthing.org/feed) | `rss` | 12 h | 20 | Practical knowledge-work experiments; author claims need verification |
| [Eugene Yan](https://eugeneyan.com/rss/) | `rss` | 12 h | 214 | Applied ML/LLM engineering and evaluations |
| [Chip Huyen](https://huyenchip.com/feed.xml) | `rss` | 12 h | 10 | AI engineering and deployment practices |
| [Hamel Husain](https://hamel.dev/index.xml) | `rss` | 12 h | 20 | Practical LLM evaluation and application design |
| [量子位](https://www.qbitai.com/feed) | `rss` | 6 h | 10 | Chinese AI reporting; verify claims against primary sources |

## Paused options

| Source | Kind | Base interval | Dated items verified | Purpose |
|---|---|---:|---:|---|
| [Lilian Weng](https://lilianweng.github.io/index.xml) | `rss` | 24 h | 52 | Specialist technical research and long-form explanations |
| [Ahead of AI](https://magazine.sebastianraschka.com/feed) | `rss` | 24 h | 20 | Specialist model research; public feed may contain paid-content teasers |
| [Claude Code releases](https://api.github.com/repos/anthropics/claude-code/releases?per_page=20) | `json_list` | 12 h | 20 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [OpenAI Codex releases](https://api.github.com/repos/openai/codex/releases?per_page=20) | `json_list` | 12 h | 4 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [Pydantic AI releases](https://api.github.com/repos/pydantic/pydantic-ai/releases?per_page=20) | `json_list` | 12 h | 19 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [LangGraph releases](https://api.github.com/repos/langchain-ai/langgraph/releases?per_page=20) | `json_list` | 12 h | 20 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [LiteLLM releases](https://api.github.com/repos/BerriAI/litellm/releases?per_page=20) | `json_list` | 12 h | 12 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [pandas releases](https://api.github.com/repos/pandas-dev/pandas/releases?per_page=20) | `json_list` | 12 h | 16 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [Docling releases](https://api.github.com/repos/docling-project/docling/releases?per_page=20) | `json_list` | 12 h | 20 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [Microsoft MarkItDown releases](https://api.github.com/repos/microsoft/markitdown/releases?per_page=20) | `json_list` | 12 h | 12 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [Unstructured releases](https://api.github.com/repos/Unstructured-IO/unstructured/releases?per_page=20) | `json_list` | 12 h | 20 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [MCP Python SDK releases](https://api.github.com/repos/modelcontextprotocol/python-sdk/releases?per_page=20) | `json_list` | 12 h | 14 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [LlamaIndex releases](https://api.github.com/repos/run-llama/llama_index/releases?per_page=20) | `json_list` | 12 h | 20 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [Streamlit releases](https://api.github.com/repos/streamlit/streamlit/releases?per_page=20) | `json_list` | 12 h | 20 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |
| [Visual Studio Code releases](https://api.github.com/repos/microsoft/vscode/releases?per_page=20) | `json_list` | 12 h | 20 | Stable release notes; public GitHub API rate headroom or optional read-only authentication required |

The original 18 RSS sources remain enabled by default: OpenAI News, Google DeepMind, Google Research, Hugging Face, Microsoft Research, NVIDIA, AWS ML, GitHub AI & ML, Mistral, Berkeley AI Research, The Verge AI, TechCrunch AI, Ars Technica AI, MIT Technology Review AI, The Decoder, Simon Willison, Import AI and Latent Space.

## Cost and access controls

- Fresh installations import at most two entries per enabled source on first collection, instead of eight for the original demonstration sources. The current default pack therefore has an initial ceiling of 60 admitted entries. This is an initial-import bound, not a daily cap or an API spending limit; later runs may discover more new entries.
- Existing source base intervals are at least four hours; additions use four to 24 hours. The engine adapts scheduling to observed output, so these are base intervals rather than guaranteed request counts. No scoring threshold or model budget has been changed.
- No paid X/WeChat provider, Jina URL, login cookie or API secret is added. Source pages and RSS default to summaries/links, with site_fulltext and syndicate_fulltext false.
- Free collection does not make downstream LLM analysis, hosting, storage or bandwidth free. Keep MODEL_CALLS_ENABLED false until a provider and budget are explicitly configured; no real model calls were made for this expansion.
- GitHub's unauthenticated public REST API currently allows 60 requests/hour per originating IP; shared egress can exhaust that pool. Those requests were rate-limited during verification, so **all 13 release APIs remain paused**. Their parsing was verified using the designated GitHub CLI account only; no development credential was copied into collector configuration. Enable them only after verifying your deployment's rate headroom or deliberately configuring a suitable read-only collector credential. See [GitHub rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
- Release sources read published_at and filter prerelease=false. They examine only the most recent 20 releases and do not claim complete release history. GitHub Atom updated timestamps are deliberately not treated as publication dates. See [GitHub release semantics](https://docs.github.com/en/rest/releases/releases#list-releases).

## Apply and enable

Run migrations and the existing seed command with your private backend environment, for example:

```sh
node --env-file=<private-backend-env-file> scripts/migrate.ts
node --env-file=<private-backend-env-file> scripts/seed.ts
```

Seeding inserts missing IDs only. It does not overwrite an existing editor's enabled state, interval or config; the lower first-import limit applies to newly inserted records. Change an existing source explicitly through `/admin/sources` if you want the new defaults. Inspect and test optional sources there before enabling them. The source enabled flag does not start a worker or enable the global collection/model switches. This change does not install or start a continuous collection service.

Some data-tooling sources are adjacent to AI and may fail the existing AI relevance filter. The editor can still search raw material in the administrator workbench; this change does not silently loosen editorial scoring. Paid-post previews remain previews; no paywall is bypassed.

## Verification and exclusions

All 45 configured sources produced nonempty titled HTTP(S) article lists with usable source publication dates after their configured filters. Existing 18 source URL identities are unchanged. Captured public responses were replayed through the actual RSS, HTML-list, JSON-list and admission code with external connections disabled. Raw responses and full reports are retained under DATA_ROOT/ai-editorial/evaluations/free-sources-20261116, outside Git. An isolated import replay seeded 45 sources, collected 30 and skipped 15, admitted 58 items, and created zero paid receipts; no source exceeded two first-import items. Re-seeding preserved manually edited settings. The low-frequency Chip Huyen feed parsed correctly but admitted no entries within the default initial history window. Required local checks passed: 1173 backend tests, 67 browser tests, type checking, web build, migration safety and smoke. Independent review reported no findings. This checks listing extraction, not factual accuracy, article-body extraction or ongoing service health.

Rejected endpoint variants included LlamaIndex blog RSS (404), LangChain's tested RSS URL and Cursor's blog RSS URL (HTML instead of a feed), Streamlit blog (403), Jupyter's old feed (404), tested Polars feed paths (404), Machine Heart's tested RSS (HTML), and Google Workspace's feed (truncated on both bounded attempts). LlamaIndex and Streamlit have verified optional release APIs instead. MCP and Hamel use their working index.xml endpoints. Lilian Weng is limited to /posts/ to exclude an undated FAQ.
