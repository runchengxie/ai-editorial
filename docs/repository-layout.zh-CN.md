# 仓库目录职责

[English](repository-layout.md)

引擎采用monorepo结构，可执行应用与共享包分开管理，不统一塞进根目录 `src/`。

| 目录 | 职责 |
| --- | --- |
| `apps/` | API、后台任务与内部动态网页 |
| `packages/` | 共享契约及后台实现 |
| `modules/` | 本分支功能，包括编辑工作台和刊物 |
| `configs/` | 共享TypeScript选项及 `site/`、`industry/` 配置工作区 |
| `scripts/` | 开发、采集、评测和运维命令 |
| `tests/` | 跨模块、契约和集成检查，模块内测试仍与模块放在一起 |
| `docs/` | 说明、安装、操作及有效设计记录 |
| `database/` | 已发布迁移及后续模式变更 |
| `assets/` | 授权共享资源 |

保留根目录约定入口，包括README、AGENTS、CONTRIBUTING、SECURITY、LICENSE/NOTICE、npm清单和锁文件、`.gitignore`。运行时提示词和条款Markdown由应用读取，留在配置包中。凭据保存在Git之外的CONFIG_ROOT，生成文件和运行数据放在DATA_ROOT。

阅读站是较小的独立应用，保留 `src/`、`tests/`、`docs/`、`configs/`，根目录 `tsconfig.json` 作为薄入口供工具发现。不为视觉统一移动约定清单或工作流文件，也不创建没有实际职责的空目录。

## 配置路径迁移

`industry/`、`site/` 分别移到 `configs/industry/`、`configs/site/`，包名仍是 `@aihot/industry`、`@aihot/site`。共享选项移到 `configs/tsconfig.base.json`，各项目的TypeScript入口仍与项目放在一起。更新源码后运行 `npm ci` 刷新工作区链接。自行编写的脚本若直接读取旧路径，需要更新，不保留兼容符号链接。内置读取方已同步。以后合并涉及这些路径的上游更新时，可能需要显式解决冲突。

本轮不移动生产数据，不配置或安装不可变任务版本，也不执行迁移。升级已安装任务应走检查通过的版本安装流程，并单独评估0169迁移及其回滚限制。

## 网页说明书

引擎自己的 GitHub Pages 承载 MkDocs 手册，同时保留 `editions.json`、`latest.json` v1 端点、日期跳转和 RSS 迁移提示。单个手动工作流发布组合产物，详见[手册网站操作](manual-site.zh-CN.md)。新闻网站仍由 `ai-editorial-pages` 维护。
