# 免费与低成本信源目录

[English](editorial-sources.md)

当前配置共 **45 个信源：30 个默认启用、15 个备选暂停**。保留原有 18 个信源的 ID 和地址，新增 27 个经过验证的来源。运行配置以 `industry/sources.json` 为准。验证日期为 2026-11-16，地址可用性与内容会随时间变化。

新增的 12 个默认启用来源覆盖官方 AI 公告、Agent 工程、编程工具、电子表格、分析数据与 AI 实践。15 个备选包含 13 个 GitHub 版本接口和两份技术刊物。新增地址均可在不订购付费采集服务的情况下提供公开资料，但公开可读不代表可以全文转载。

## 新增默认启用来源

| 信源 | 类型 | 基础间隔 | 已验证有日期条目 | 用途 |
|---|---|---:|---:|---|
| [Anthropic News](https://www.anthropic.com/news) | `web_list` | 6 h | 20 | Claude、模型与产品的官方公告 |
| [Anthropic Engineering](https://www.anthropic.com/engineering) | `web_list` | 12 h | 24 | Agent 工程、上下文设计和评估 |
| [DuckDB Blog](https://duckdb.org/feed.xml) | `rss` | 12 h | 10 | 本地分析与数据处理流程 |
| [Microsoft Excel Blog](https://techcommunity.microsoft.com/t5/s/gxcuf89792/rss/board?board.id=ExcelBlog) | `rss` | 12 h | 20 | Excel 数据分析与 Copilot 工作流 |
| [Microsoft Python Blog](https://devblogs.microsoft.com/python/feed/) | `rss` | 12 h | 10 | Python 工具与开发实践 |
| [Cursor Changelog](https://cursor.com/changelog/rss.xml) | `rss` | 4 h | 50 | AI 编程工具更新 |
| [Model Context Protocol Blog](https://blog.modelcontextprotocol.io/index.xml) | `rss` | 12 h | 29 | MCP 协议与生态更新 |
| [One Useful Thing](https://www.oneusefulthing.org/feed) | `rss` | 12 h | 20 | 知识工作的 AI 实践；作者的说法仍需核实 |
| [Eugene Yan](https://eugeneyan.com/rss/) | `rss` | 12 h | 214 | 应用型 ML/LLM 工程与评估 |
| [Chip Huyen](https://huyenchip.com/feed.xml) | `rss` | 12 h | 10 | AI 工程与部署实践 |
| [Hamel Husain](https://hamel.dev/index.xml) | `rss` | 12 h | 20 | LLM 应用与评估实践 |
| [量子位](https://www.qbitai.com/feed) | `rss` | 6 h | 10 | 中文 AI 报道；关键结论应回到一手来源核对 |

## 暂停的备选来源

| 信源 | 类型 | 基础间隔 | 已验证有日期条目 | 用途 |
|---|---|---:|---:|---|
| [Lilian Weng](https://lilianweng.github.io/index.xml) | `rss` | 24 h | 52 | 技术研究长文；过滤 FAQ 等非文章页面 |
| [Ahead of AI](https://magazine.sebastianraschka.com/feed) | `rss` | 24 h | 20 | 模型研究；公开订阅可能包含付费文章的预告 |
| [Claude Code releases](https://api.github.com/repos/anthropics/claude-code/releases?per_page=20) | `json_list` | 12 h | 20 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [OpenAI Codex releases](https://api.github.com/repos/openai/codex/releases?per_page=20) | `json_list` | 12 h | 4 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [Pydantic AI releases](https://api.github.com/repos/pydantic/pydantic-ai/releases?per_page=20) | `json_list` | 12 h | 19 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [LangGraph releases](https://api.github.com/repos/langchain-ai/langgraph/releases?per_page=20) | `json_list` | 12 h | 20 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [LiteLLM releases](https://api.github.com/repos/BerriAI/litellm/releases?per_page=20) | `json_list` | 12 h | 12 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [pandas releases](https://api.github.com/repos/pandas-dev/pandas/releases?per_page=20) | `json_list` | 12 h | 16 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [Docling releases](https://api.github.com/repos/docling-project/docling/releases?per_page=20) | `json_list` | 12 h | 20 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [Microsoft MarkItDown releases](https://api.github.com/repos/microsoft/markitdown/releases?per_page=20) | `json_list` | 12 h | 12 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [Unstructured releases](https://api.github.com/repos/Unstructured-IO/unstructured/releases?per_page=20) | `json_list` | 12 h | 20 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [MCP Python SDK releases](https://api.github.com/repos/modelcontextprotocol/python-sdk/releases?per_page=20) | `json_list` | 12 h | 14 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [LlamaIndex releases](https://api.github.com/repos/run-llama/llama_index/releases?per_page=20) | `json_list` | 12 h | 20 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [Streamlit releases](https://api.github.com/repos/streamlit/streamlit/releases?per_page=20) | `json_list` | 12 h | 20 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |
| [Visual Studio Code releases](https://api.github.com/repos/microsoft/vscode/releases?per_page=20) | `json_list` | 12 h | 20 | 稳定版本更新；启用前需要可用的 GitHub 公共接口额度或可选的只读认证 |

原有 18 个 RSS 默认继续启用：OpenAI News、Google DeepMind、Google Research、Hugging Face、Microsoft Research、NVIDIA、AWS ML、GitHub AI & ML、Mistral、Berkeley AI Research、The Verge AI、TechCrunch AI、Ars Technica AI、MIT Technology Review AI、The Decoder、Simon Willison、Import AI、Latent Space。

## 成本和访问控制

- 新安装时，每个启用信源首次最多导入两条资料，原示范配置的上限为八条。按当前默认配置，首次最多接纳 60 条。这只是首次导入限制，不是每天的上限，也不是模型费用上限；后续仍可能发现更多新资料。
- 原信源的基础间隔至少四小时，新来源为四至 24 小时。引擎会根据产出调整调度，因此不能把基础间隔当成固定请求次数。本次没有修改评分门槛或模型预算。
- 没有新增付费 X/公众号服务、Jina 地址、登录 Cookie 或接口密钥。site_fulltext 和 syndicate_fulltext 保持 false，默认只展示摘要与链接。
- 采集免费不代表后续模型分析、服务器、存储和带宽免费。明确配置模型和预算前，保持 MODEL_CALLS_ENABLED=false。本次没有发生真实模型调用。
- GitHub 公共 REST API 当前未登录额度为每个出口 IP 每小时 60 次，共享出口可能提前耗尽。本次未登录验证遇到了限流，因此 **13 个版本接口全部保持暂停**。仅用指定 GitHub CLI 账号核验了解析，没有把开发凭据复制到采集器。启用前应核实部署环境的可用额度，或主动配置合适的只读采集凭据。参见 [GitHub 额度说明](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)。
- 版本源读取 published_at，并过滤 prerelease=false。每次只查看最近 20 个版本，不代表完整版本历史。不把 GitHub Atom 的 updated 时间冒充发布时间。参见 [GitHub 版本接口语义](https://docs.github.com/en/rest/releases/releases#list-releases)。

## 应用与启用

使用私有后端环境文件执行现有迁移和导入命令，例如：

```sh
node --env-file=<private-backend-env-file> scripts/migrate.ts
node --env-file=<private-backend-env-file> scripts/seed.ts
```

导入只新增缺失的 ID，不会覆盖已有的启停状态、间隔和配置；较小的首次导入上限也只作用于新增记录。如果希望已有信源采用新默认值，需要在 `/admin/sources` 明确修改。备选源应先在那里试抓，再启用。信源 enabled 状态不等于启动 worker，也不等于开启全局采集或模型开关。本次不会安装或启动持续采集服务。

部分数据工具来源与 AI 相邻，可能被现有 AI 相关性规则筛掉；编辑仍可在后台搜索原始资料。本次没有悄悄放宽编辑评分。付费文章的公开预告仍然只是预告，不绕过付费墙。

## 验证与排除项

45 个配置源在经过各自过滤后，都解析出了非空标题、HTTP(S) 链接和可用的原始发布时间。原有 18 个信源的地址身份不变。公开响应通过实际的 RSS、网页列表、JSON 列表和入选过滤代码回放，回放时禁止连接外网。原始响应与完整报告保存在 DATA_ROOT/ai-editorial/evaluations/free-sources-20261116，不进入 Git。这项验证检查列表提取，不代表事实准确性、正文提取或持续运行质量。

排除的地址变体包括 LlamaIndex 博客 RSS（404）、本次测试的 LangChain RSS 和 Cursor 博客 RSS（实际返回网页）、Streamlit 博客（403）、Jupyter 旧订阅（404）、本次测试的 Polars 订阅路径（404）、机器之心的测试地址（返回网页），以及两次有限尝试都响应截断的 Google Workspace 订阅。LlamaIndex 和 Streamlit 改为提供已核验的备选版本接口；MCP 和 Hamel 使用可用的 index.xml。Lilian Weng 限定 /posts/，排除没有有效日期的 FAQ。
