# 每日数据发布

[English](daily-pages.md)

阅读网站和 RSS 已独立到 [ai-editorial-pages](https://github.com/runchengxie/ai-editorial-pages)，访问[新网站](https://runchengxie.github.io/ai-editorial-pages/)。本仓库负责免费信源采集、筛选、内部采编后台和[公开 v1 数据格式](daily-brief-v1.md)。原有动态应用不作为这个公开静态网站。

同一工作流现在默认仅更新手册；明确选择 **refresh** 才会采集来源。部署始终包含手册和保留的 v1 状态，详见[手册网站操作](manual-site.zh-CN.md)。

## 引擎运行

`Daily Data`（`.github/workflows/daily-pages.yml`）只在 main 手动运行并明确选择 **refresh** 时采集启用的免费 RSS/HTML 信源。定时采集暂停，工作流不含 cron 触发。每次都要求对应 main 提交的 push 检查成功。保留现有工作流文件名、并发组和 `daily-public-state` 产物名，以继续读取真实发布历史。源码检查成功不再自动发布数据，便于先合并引擎、再迁移网站，不提前切换旧入口。

`node scripts/daily-brief/build.ts --out <仓库外目录>` 输出 `editions.json`、`latest.json`，以及旧首页、语言页、历史地址的最小跳转页和指向新 RSS 的迁移通知。不包含阅读模板、CSS 或界面语言目录；网页和 RSS 的功能开发只在新仓库进行。不要发布 `--fixture` 样例输出。

最近一次成功数据任务的产物用于恢复历史，最多保留 30 个日期版本且不超过 30 天，产物保存 90 天。可用信源少于一半，或没有日期有效的链接时，在部署前失败；已发布历史产物丢失也会明确报错。每期从七天内资讯选最多八条，每个信源最多两条，按主题关键词、信源等级和时间排序，不宣称模型摘要或人工事实核验。

生产状态保存在 GitHub Actions 产物中，JSON 发布在引擎的 Pages 数据入口。本地保留的评测放在 DATA_ROOT/ai-editorial/evaluations/<任务编号>/，不提交 Git。任务不读取内部采编记录，也不需要长期 GitHub 令牌或模型密钥。

## 迁移与验证

先合并引擎 PR，保持已有部署。新网页使用已经上线的 v1 接口完成部署；确认新网站可用后，再手动运行 Daily Data 发布数据和旧地址跳转，随后运行网页发布验证完整链路。生产网页不能依赖尚未合并的引擎分支。

执行根目录类型检查、引擎与网页原有检查，以及 `node scripts/daily-brief/daily.test.ts`、`node scripts/daily-brief/output.test.ts`。使用新网页的独立校验器验证引擎输出，记录两边测试的提交版本。

探索阶段保持手动。参见[手动探索与以后恢复](magazine.zh-CN.md#手动探索自动化暂停)。源码检查不会触发此工作流。
