# AI Editorial

[English](README.md)

一个供编辑自用的 AI 资讯采编工作台，服务于用 AI 做投研、财报分析、数据处理和开发的人。基于 [AIHOT](https://github.com/KKKKhazix/AIHOT) Fork，采编功能放在独立模块中。

可以搜索原始资料、导入选题、记录关键说法与限制、整理可编辑的草稿资料包、人工审核，并导出 Markdown 后手动发布。内部备注不会进入导出内容，证据变化后需要重新审核。

## 从这里开始

- [本地运行](docs/editorial-setup.zh-CN.md)：Node.js、PostgreSQL、关闭外部操作及本地验证。
- [数据和配置约定](docs/editorial-data-contract.md)：源码、私有配置、运行数据和评测输出的位置。
- [试用流程](docs/editorial-pilot.zh-CN.md)：编辑验收和信源、质量评估。
- [设计](docs/superpowers/specs/2026-11-16-editorial-workbench-design.md)及[开发计划](docs/superpowers/plans/2026-11-16-editorial-workbench.md)。
- [上游引擎英文指南](README.en.md)及[架构说明](docs/architecture.md)。

完成本地配置后访问 `/admin/editorial`。新增采编界面支持中英切换，上游引擎页面仍以中文为主。草稿功能目前整理证据资料包，不调用模型，尚未实现 AI 成稿写作。

第一版仅供内部使用。上游的匿名网页、RSS、API、MCP 入口仍然存在，需要将整个服务绑定回环地址，或放在统一身份验证后。会员、支付、受限订阅、真实接口配置和公开部署均不包含在此版本中。正式品牌与对外法律文本尚待确认。

## 来源说明

采集、分析、事件聚合、后台和公开内容引擎来自 AIHOT，保留 [LICENSE](LICENSE) 和 [NOTICE](NOTICE)。本项目不是 AIHOT 官方服务，也不包含其私有信源名单和运营数据。原始内容仍归属各发布者。
