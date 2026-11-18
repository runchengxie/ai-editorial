# 编辑信源

[English](editorial-sources.md)

当前配置共 **84 个信源，79 个启用、5 个暂停**。杂志任务以 `industry/sources.json` 为准。本轮研究与工程扩充在此前75个、启用70个的基础上补充9个免费来源。配置数量不等于每日出稿数量。验证日期：2026-11-18。

## 覆盖范围与发现目录

| 方向 | 新增或启用的来源 |
| --- | --- |
| AI 产品与研究 | Google AI；通过 Alan Turing Institute 维护的 RSS 桥接获取 Claude News、Anthropic Research、Cohere、Ai2、AISI、Mila；Ahead of AI |
| 金融与数据工作流 | FactSet Insight、OpenBB 版本、Databricks、Polars 版本，以及按主题筛选的 R-bloggers |
| 开发工具 | 原有13个版本接口：Codex、Claude Code、Pydantic AI、LangGraph、LiteLLM、pandas、Docling、MarkItDown、Unstructured、MCP Python、LlamaIndex、Streamlit、VS Code |
| 中文资讯 | IT之家、爱范儿、极客公园；BestBlogs 桥接的机器之心、新智元、晚点AI、硅星人Pro、智谱；已有量子位 |
| 工程与精选 | 按主题筛选的 Cloudflare；Last Week in AI |

发现目录包括 [BestBlogs 文章 OPML](https://github.com/ginobefun/BestBlogs/blob/main/BestBlogs_RSS_Articles.opml)、[公众号 OPML](https://github.com/ginobefun/BestBlogs/blob/main/opml/bestblogs_wechat2rss_opml_all.opml)、[Turing AI RSS](https://github.com/alan-turing-institute/ai-rss-feeds)、[Engineering Blogs](https://github.com/kilimchoi/engineering-blogs)、[AI4Finance 资源](https://github.com/AI4Finance-Foundation/Awesome_AI4Finance)。这些是候选目录，不是整批导入或内容转载授权。优先保留原始发布者与原文链接，不绕过付费墙，site_fulltext 与 syndicate_fulltext 仍关闭。

Mistral 保留原信源 ID，将旧地址替换为 Turing 维护的订阅。综合中文与厂商博客按 `industry/magazine.ts` 的 AI、数据工作流规则筛选；来源与发布者限额、读者方向轮换避免高频内容挤占整期。URL 与较长相同标题可确定性去重，真正的事件合并仍由模型处理。

## 访问与原始日期

杂志任务支持现有受保护采集器的直接 RSS、HTML 和 GET GitHub 版本 JSON。已观察到匿名共享 IP 限流，因此任务从已有指定凭据文件读取 GitHub 凭据到进程环境，用于公开版本接口。现有采集器仅向固定 GitHub API 发送凭据，继续执行同源重定向约束。没有复制凭据或增加付费采集服务，Codex 子进程不接收 GitHub、数据库和 API 凭据。通用持续采集器仍需独立明确配置，本次不为其隐式配置认证。

版本来源使用原始 published_at，并排除预发布；不拿 Atom updated 替代发布时间。Vercel 的 Atom 可解析100条，但实际解析器找不到 published，因此暂停。其余暂停项是 Lilian Weng、arXiv AI、FinGPT 版本、FinRobot 版本。arXiv 单次返回717条，需要另行制定相关性和数量规则；低频金融项目作为候选保留，不计入活跃新闻覆盖。

五个公众号桥接最初抽测返回403，随后在保存响应回放和真实生产采集器复测中均能解析10条带日期的记录，因此据此启用，但稳定性依赖第三方。个别失败会跳过，仍保留50%的信源健康度门槛。本次 The Decoder 返回403，保留原有配置状态，不因一次失败直接停用。

## 验证与限制

真实公开响应在关闭外网连接的条件下经过实际 RSS、HTML、JSON 解析器回放。GitHub 匿名接口限流后，使用已有指定 CLI 账号保存公开版本响应。此前66个启用来源中，除一项临时失败外均产生带日期条目。同一批资料下，原选材选择日报8条、周报16条；新选材选择日报30条、覆盖20源，周报60条、覆盖33源。这是列表层面的测量，不保证正文抓取、事实准确或最终出稿数量。基线排除已失效的旧 Mistral 地址，仅在改进后计入替代源。完整响应、对照与验证记录存于 DATA_ROOT/ai-editorial/evaluations/source-expansion-20261118，不进入 Git。

新来源首次导入上限保持每源2条，通用持续采集器按当前79源默认配置的首次上限为158条；后续运行不受这一每日上限约束。杂志另外限制为日报30、周报60个候选，并按用途限制私有正文长度。每期仍一次 Codex 调用，滚动24小时最多3次；单次材料变长会增加订阅额度消耗。详见[杂志运行说明](magazine.zh-CN.md)。

## 应用方式

定时杂志直接读取正式代码版本里的信源文件；独立的 v1 兼容构建仍只读取 RSS、HTML。通用后台和持续采集流程可用 `scripts/seed.ts` 插入缺少的 ID，但不会覆盖已存在的启用状态、配置或频率，需要明确更新已有后台记录。本次不启动持续采集 worker。私有设置留在 CONFIG_ROOT，生成数据留在 DATA_ROOT。

## 财务工作流试刊

新增 [AlphaSense 原生 RSS](https://www.alpha-sense.com/feed/)、[EdgarTools 版本](https://github.com/dgunning/edgartools/releases)、[Arelle XBRL 版本](https://github.com/Arelle/Arelle/releases)和 [dlt 版本](https://github.com/dlt-hub/dlt/releases)。2026年11月18日真实检查中，四者均返回带日期的公开材料。针对11月9–15日完整周，采集器从 EdgarTools/Arelle 取得4条新增财报证据，与之前保存的47条材料合并后，共51条候选、28个来源。AlphaSense 最新文章为11月6日，dlt 最新稳定版本为10月29日，均未伪装成当周新闻。

两个财报工具即使标题只有版本号，也归入投研；明确的 XBRL、10-K 和财务报表工作流可被发现，指定金融出版方的订阅摘要也可帮助判断。泛金融公司的数据中心和诉讼新闻仍归综合。既有轮换、来源上限、数字与引用校验和模型预算不变。部分猜测的 RSS 地址返回404，Daloopa 路径返回普通 HTML，Bloomberg/Snowflake 返回403，因此未加入。原始响应和带日期的试刊材料留在 Git 之外。参见[单期成稿验收](magazine.zh-CN.md#单期成稿验收)。

## 补充研究与工程素材

本轮新增9个免费来源，目录合计 **84个来源，79个启用、5个暂停**：

| 来源 | 用途与限制 |
| --- | --- |
| [arXiv API](https://info.arxiv.org/help/api/user-manual.html) | 单条定向查询覆盖金融、文档与表格AI研究，只读摘要及初次发布日期，不抓PDF。原有泛AI订阅仍暂停。 |
| [Hacker News / hnrss](https://hnrss.org/) | 使用非官方免费桥接发现至少50分的帖子，每次最多核验8篇原文；转帖时间不作为原文日期。 |
| [Interconnects](https://www.interconnects.ai/feed) | 研究与产业评论，保留作者归属。 |
| [ClickHouse](https://clickhouse.com/rss.xml) | AI与数据工程，每次最多核验4篇原文日期。 |
| [LangChain](https://www.langchain.com/blog/rss.xml) | 智能体工程与评测，每次最多核验8篇原文日期。 |
| [Sebastian Raschka](https://sebastianraschka.com/rss_feed.xml) | 架构分析与技术阅读。 |
| [Netflix TechBlog](https://netflixtechblog.com/feed) | 按AI与数据主题筛选工程实践。 |
| [GitHub工程博客](https://github.blog/engineering/feed/) | 按主题筛选开发工程。 |
| [Google Developers](https://developers.googleblog.com/feeds/posts/default/) | 工程内容；无日期条目须核验原文，每次最多4篇。 |

论文和社区发现各占有界候选通道，日报各最多2条、周报各最多3条，仍受30/60条候选及发布者上限约束。综合信源可通过标题、摘要或所带正文的前2000字符判断相关性。成稿须区分论文、工程实践和产品公告，不能把论文摘要写成已验证的生产能力。有订阅源不代表每天都有合适消息。

针对11月9–15日，把旧51条材料和新增已核验内容合并后，得到64条独立材料，自动选择保留60条。LangChain有4篇文章虽然RSS日期较新，但原文发表于8月或10月，已排除。新增有效材料包括财报电话会前视偏差、交易智能体评测、文档向量研究，以及工程案例。原生采集得到11条可用材料，来自新增9个来源中的5个；首次安全采集检查有6个成功，HN、LangChain和Google有瞬时失败。公开响应回放与真实采集结果分别记录，不能据此声称全部来源持续可用。Netflix原文页返回403，使用公开RSS正文，没有绕过访问限制。

本地验收版从已保存的8篇重点、16条快讯扩充为12篇重点、25条快讯，引用45篇文章、覆盖28个具名来源。这是基于真实材料的编辑扩充，**没有新增Codex生成调用**；新提示词目标仍需未来在预算允许时实测。引用、数字、结构以及双语阅读器和浏览器检查记录保存在 `DATA_ROOT/ai-editorial/evaluations/broader-news-20261118`。稿件未发布，定时生成仍暂停。
