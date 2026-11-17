# 每日自动公开简报

[English](daily-pages.md)

访问[每日网页](https://runchengxie.github.io/ai-editorial/)，或订阅 [RSS](https://runchengxie.github.io/ai-editorial/feed.xml)。默认英文，可切换中文并记住明确选择；文章标题保留原文。

## 当前能力

首版从过去七天的资讯中自动选取最多八条链接，每个信源最多两条。排序参考投研与财务工作流、开发与数据关键词，以及信源等级和发布时间。标签来自规则，不是模型判断。每条保留原始发布时间、信源和链接；不导出正文、内部笔记或采编草稿。本版没有模型调用、自动撰写的解读、事实核验或产品实测，网页会明确说明。

只采集 `industry/sources.json` 中启用的 RSS 和免费 HTML 列表；暂停的可选源保持暂停。此独立定时任务读取仓库默认配置，不读取后台数据库里的管理员覆盖设置；调整公开信源需要修改并评审仓库配置。任务不依赖或暴露内部 API 和 PostgreSQL，内部采编后台继续独立使用。

## 发布机制

`.github/workflows/daily-pages.yml` 计划每天 UTC 00:17，即北京时间 08:17 执行，GitHub 排期可能延迟。main 的 `Check` 成功后也会触发，可在 main 手动运行。每种入口都会核对当前 main 提交的 push 检查已经成功。无需人工内容审核。

GitHub Pages 使用 Actions 发布源，通过 `github-pages` 环境和 GitHub 临时令牌部署。构建产物只有公开字段和静态资源；工作流不需要 PAT 或模型密钥。

若返回列表的信源少于启用信源的一半，或没有日期有效、安全的候选资讯，则在部署前失败，保留已有网站。页面显示信源状态和实际生成时间。采集成功不等于事实已核验。七天窗口不会把旧文章写成今日发布；晚于生成时间的条目不会入选。

每次只从最近一次成功 Daily Pages 运行的 `daily-public-state` 产物恢复历史，保留最多 30 个日期版本，且不保留超过 30 天的期数。产物保存 90 天。若已发布历史产物丢失或到期，恢复会明确失败，避免无提示丢失历史；需通过经过评审的维护变更，用已验证的公开 `editions.json` 恢复。首次发布不需要历史。生成文件保存在 runner 临时目录，不提交 Git；本地需要留存的评测记录放在 DATA_ROOT/ai-editorial/evaluations/<任务编号>/。

## 本地检查

```sh
npm ci --no-audit --no-fund
node scripts/daily-pages/daily.test.ts
node scripts/daily-pages/browser.test.ts
node scripts/daily-pages/build.ts --fixture --out /tmp/ai-editorial-preview
# 实际读取免费列表，不调用付费服务或模型：
node scripts/daily-pages/build.ts --out /tmp/ai-editorial-live
```

`--state <外部文件>` 恢复经过验证的公开历史，移除未知字段。输出目录必须在仓库之外。不要发布样例构建。同步上游时仍需执行原有引擎和模块检查。
