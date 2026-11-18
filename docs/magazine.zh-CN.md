# 文章式日报与周报

[English](magazine.md)

引擎生成内容，[ai-editorial-pages](https://github.com/runchengxie/ai-editorial-pages)负责展示。原 v1 标题链接接口保持不变，独立的 v2 刊物数据包含中英文标题与导语、编号正文、相关更新、快讯、前瞻日期和来源引用。

## 材料与生成

日报收录过去24小时，消息较少时明确扩展到72小时；周报覆盖北京时间上一完整周一到周日。通过既有安全采集器读取启用的免费 RSS/HTML 和 GitHub 版本 JSON 信源，直接读取原文时使用 `paidFallback: false`，不启用 Jina 或付费社交采集。材料不足时缩短，不把原文正文直接发布出去。

Codex 使用本机现有 ChatGPT 登录，以非交互、只读模式运行，隔离用户配置并关闭命令行、浏览器、应用、插件、钩子和图片生成工具，使用结构化输出及十分钟超时。只通过 stdin 传入有上限的公开证据。子进程环境采用白名单，不传入 GitHub、数据库或 API 凭据变量，也不把登录资料放到 GitHub。这个方式消耗 Codex 订阅额度，不等同于无限或免费的 API；本机登录和模型访问须保持有效。

调用沿用 PostgreSQL 回执和 `codex-cli` 预算。初始限制为每分钟2次、每小时3次、滚动24小时3次，保留操作者已有预算设置。持久化材料相同则复用已收到的答案。结果不确定时阻止同一期再次调用，即使输入发生改变也需先由操作者检查，不立即重试。引用片段必须匹配来源；数字必须得到片段、来源标题或来源中精确产品标识的支持，允许数值不变的 million/billion 与万/亿转换。这是来源对应与合理性检查，不代表语义已全面验证或经过人工审核。不符合规则的内容不会发布。

实现位于 `modules/editorial-magazine`。原始资料、私有引用片段和诊断信息留在 DATA_ROOT/ai-editorial/magazine 与数据库；公开数据只包含整理后的文章和来源信息。不复用参考文章的截图或图片。前瞻日期必须有明确原文依据，保留“计划”等限定，最远不超过本期结束后365天。

## 本机定时任务

稳定代码版本位于 DATA_ROOT/ai-editorial/releases/<已通过检查的 main 提交>/。权威配置放在 CONFIG_ROOT/projects/ai-editorial/magazine.env，权限0600，只引用已有 GitHub 凭据文件和 Codex home，不复制凭据。数据库使用独立目录和仅所有者可用的 Unix socket，以系统用户身份认证，不复用评测数据库。

在准确 main 提交的 CI 通过后，从干净的引擎主检出执行 `scripts/magazine/install-local.ts`，显式提供 CODE_ROOT、DATA_ROOT、CONFIG_ROOT、MAGAZINE_PG_BIN 和 MAGAZINE_PG_LIB（稳定 PostgreSQL18路径）。安装器核对检查结果，归档固定代码版本、安装依赖、迁移独立数据库、初始化额度预算，仅创建本项目的 `ai-editorial-postgres.service`、`ai-editorial-magazine.service`、`ai-editorial-magazine.timer`。不会替换非本项目管理的同名服务，也不会初始化已有不明内容的数据库目录。

先运行一次服务并确认发布，再启用定时器。计划每天北京时间08:27执行，用户服务管理器可用时会补跑错过的任务；生成日报，并在需要时生成最近一个完整周的周报。电脑需开机、数据盘已挂载且 Codex 登录有效。电脑离线时网站仍托管在 GitHub Pages，页面显示实际生成时间，错误或过期输入不覆盖旧站。

```sh
systemctl --user start ai-editorial-magazine.service
systemctl --user status ai-editorial-magazine.service
journalctl --user -u ai-editorial-magazine.service -n80
systemctl --user enable --now ai-editorial-magazine.timer
```

不要自动释放未知回执并重发。先检查私有结果及回执，再按项目既有恢复约定处理。可停用定时器，或在权威配置中设 MODEL_CALLS_ENABLED=false 来停止生成。生产任务不能使用临时 worktree 或 /tmp 数据库二进制。替换数据库运行时前备份专用数据库和数据目录；丢失回执后不能盲目重复提交可能已消耗额度的调用。

## 发布与阅读

固定 GitHub release `magazine-current` 存放不可变的 `magazine-<sha256>.json`。release 的 JSON 描述是原子更新的清单指针，包含 schemaVersion2、asset、sha256、producerRevision、generatedAt。确认上传后才切换指针，旧文件保留，避免读者同时读取时出现断档。随后触发网页工作流。远程写入失败或结果不确定时，先查询实际状态；同一次运行不立即重复触发网页任务。

网页独立校验清单、哈希、引用、日期与新鲜度，生成日报、周报、刊物 RSS 和带内联样式的发布用 HTML。当前数据保留最多30期日报和12期周报，不导出原始资料、私有引用片段、模型凭据或内部备注。release tag 只是固定数据容器，不表示每份数据都使用 tag 最初指向的代码；producerRevision 记录实际已检查的源代码版本。

## 验证

执行根目录类型检查、原动态应用构建及网页/后端检查、新模块测试和网页仓库的校验/浏览器测试。模型单测只连本地假服务；实际 CLI 评测使用独立目录、数据库和明确启用的调用预算。把两仓库版本、语料、回执、公私字段投影和桌面/手机截图记录在仓库外的评测目录。公开发布前必须同时有可用的日报与周报。

## 更丰富的日报与周报

候选上限为日报30条、周报60条，按投研、开发和综合动态轮换，限制单一来源及发布者，并对综合信源筛选 AI 和数据工作流主题。前12/20个候选最多保留6000字符，其余最多1400字符，私有正文总量上限分别为97200/176000字符；短讯不必额外抓取全文。正文足够的版本说明直接作为原始材料使用。

日报目标5–7篇重点、10–15条短讯；周报目标8–12篇重点、15–25条短讯。材料不足时少发，不为凑数量补写。公开 v2 格式保持不变，上限扩大为12篇重点、25条短讯、60个引用来源。扩容阅读器必须先部署，生产端再发布超过旧限制的数据；保留旧刊物。数字校验支持 percent/per cent 与%等值，三段版本号必须完整一致。这些检查不代替语义核验。
