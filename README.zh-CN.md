# AI Editorial

[在线手册](https://runchengxie.github.io/ai-editorial/) · [手册发布说明](docs/manual-site.zh-CN.md)

访问[AI 资讯简报](https://runchengxie.github.io/ai-editorial-pages/) · [RSS 订阅](https://runchengxie.github.io/ai-editorial-pages/feed.xml)。参见[自动发布机制与当前能力](docs/daily-pages.zh-CN.md)。

[English](README.md)

一个供编辑自用的 AI 资讯采编工作台，服务于用 AI 做投研、财报分析、数据处理和开发的人。基于 [AIHOT](https://github.com/KKKKhazix/AIHOT) Fork，采编功能放在独立模块中。

可以搜索原始资料、导入选题、记录关键说法与限制、整理可编辑的草稿资料包、人工审核，并导出 Markdown 后手动发布。内部备注不会进入导出内容，证据变化后需要重新审核。

定时生成和发布已暂停，参见[手动采集、生成与发布](docs/magazine.zh-CN.md#手动探索自动化暂停)。既有网站继续在线。


[项目状态与盘点](docs/project-status.zh-CN.md) · [目录职责](docs/repository-layout.zh-CN.md)
## 从这里开始

- [文章式日报与周报](docs/magazine.zh-CN.md)，本机 Codex 生成、证据、额度回执和自动发布。
- [免费信源目录](docs/editorial-sources.zh-CN.md)，86 个来源（81 个启用）、默认与备选清单、成本控制。
- [本地运行](docs/editorial-setup.zh-CN.md)，Node.js、PostgreSQL、关闭外部操作及本地验证。
- [数据和配置约定](docs/editorial-data-contract.md)，源码、私有配置、运行数据和评测输出的位置。
- [验证记录](docs/editorial-release-validation.md)，已测版本、检查结果及限制。
- [试用流程](docs/editorial-pilot.zh-CN.md)，编辑验收和信源、质量评估。
- [设计](docs/superpowers/specs/2026-11-16-editorial-workbench-design.md)及[开发计划](docs/superpowers/plans/2026-11-16-editorial-workbench.md)。
- [上游引擎英文指南](docs/upstream-guide.md)及[架构说明](docs/architecture.md)。

完成本地配置后访问 `/admin/editorial`。新增采编界面支持中英切换，上游引擎页面仍以中文为主。草稿功能目前整理证据资料包，不调用模型，独立刊物任务已支持模型辅助成稿。

动态应用和采编后台仍供内部使用。公开阅读网站由独立的 [ai-editorial-pages](https://github.com/runchengxie/ai-editorial-pages) 仓库维护。上游的匿名网页、RSS、API、MCP 入口仍然存在，需要将整个服务绑定回环地址，或放在统一身份验证后。会员、支付、受限订阅、真实模型接口配置和动态应用的公开部署均不包含在此版本中。正式品牌与对外法律文本尚待确认。

## 来源说明

采集、分析、事件聚合、后台和公开内容引擎来自 AIHOT，保留 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)。AI Editorial 由本仓库独立维护，使用公开信源和自行积累的数据。AIHOT 的私有信源名单及运营数据由原项目保管。原始内容仍归属各发布者。
