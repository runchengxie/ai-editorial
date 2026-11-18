# 部署与运行

[English](deploy.md)

当前发布路线是本机Node.js刊物任务，加上GitHub Pages托管资讯阅读站与MkDocs说明书。这些公开静态站不需要容器或常驻网页服务器。Dockerfile、Compose、容器代理模板及对应CI任务已退役。继承的动态应用仍可按[本地部署](editorial-setup.zh-CN.md)供内部使用。

## 静态网站

独立阅读站发布日报、周报、历史归档、RSS和HTML导出。本仓库Pages发布说明书，同时保留阅读站依赖的v1 JSON。使用统一、只允许手动触发的[网站工作流](manual-site.zh-CN.md)。只发布文档时不重新采集或改写新闻，不另建第二个Pages发布方，也不上传fixture数据。

## 本机刊物任务

使用Node.js 24.22.2或更新版本，以及明确配置的PostgreSQL运行环境。源码版本和运行数据放DATA_ROOT，私密设置放CONFIG_ROOT。按[刊物运维](magazine.zh-CN.md)和[升级说明](runtime-upgrade.zh-CN.md)操作。用户浏览网页不会调用本机任务；安装不启用定时器，生成和发布仍是分开的明确操作。

## 升级与迁移安全

只安装干净且检查通过的main版本。破坏性迁移前备份专用数据库并验证完整恢复。0169删除不再使用的账本列和索引，执行后不能只切回旧代码。审批、演练、备份和回滚要求见[上游迁移说明](upstream-five-upgrade.zh-CN.md)。不改写已发布迁移，不删除回执来重试结果不明的调用。

## 域名与HTTPS

GitHub Pages为静态站提供HTTPS，也可通过设置配置自定义域名。若单独公开动态应用，需自行配置鉴权边界和反向代理。本分支不再提供容器Caddy模板。自建代理应保留缓存头，不因静态站公开就暴露内部管理或模型接口。

## 历史升级记录

[上游部署与升级历史](history/upstream-deployment.zh-CN.md)保留旧引擎改动，不是当前支持的容器操作步骤。安装、CI和运维命令以本分支当前文档为准。仓库已关闭GitHub模板标记，仍保留上游历史以便选择性同步。
