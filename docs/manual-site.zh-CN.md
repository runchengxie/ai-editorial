# 手册网站操作

[English](manual-site.md)

固定使用 MkDocs 1.6.1 和 [Material for MkDocs 9.8.1](https://pypi.org/project/mkdocs-material/9.8.1/)，版本记录见[官方发布说明](https://www.mkdocs.org/about/release-notes/#version-161-2024-08-30)，构建配置依据[官方配置参考](https://www.mkdocs.org/user-guide/configuration/)。

[引擎手册](https://runchengxie.github.io/ai-editorial/)采用 Material for MkDocs 主题，与 Finance Video Studio 保持相同的侧边导航、返回顶部按钮和系统字体设置。页眉的主题按钮依次切换跟随系统、浅色和深色模式，并保存选择。[新闻读者网站](https://runchengxie.github.io/ai-editorial-pages/)仍是独立应用。手册默认显示英文，可通过导航和页面顶部链接切换到中文。

## 本地构建

使用 Python 3.11 或更新版本，在检出目录之外创建 Python 虚拟环境，安装 `configs/requirements-docs.txt`，然后运行。

```sh
python -B scripts/docs/build.py --state /path/to/successful-public-state --out /tmp/editorial-manual-site
```

`--state` 必须包含成功发布保存的非空 `editions.json`。当前完整归档还包含 `latest.json`、按日期命名的跳转页面、`zh-CN.html` 和 `feed.xml`。输出目录必须是新建目录或空目录，输出和临时 Markdown 文件都保存在仓库之外。不使用数据库，不采集新闻，不调用模型。

仅发布 `configs/mkdocs.yml` 指定的页面和 `docs/manual/` 首页。其他仓库文档与源码链接转向 GitHub。内部智能体指令和历史设计记录不会复制到手册。修改现行说明时同步更新两种语言。MkDocs 使用严格模式，检查本地链接与锚点。两种语言都使用支持 Unicode 的标题锚点。

## 手动发布

main 当前提交的检查通过后，手动运行 Daily Data，选择默认的 docs 模式。它恢复最近一次成功的 `daily-public-state` 归档，只构建手册，不采集来源。明确选择 refresh 才会先采集免费列表，再构建相同的组合网站。两个模式都不启用定时任务，也不调用模型。

Pages 由同一个工作流和并发组发布。不要运行 `mkdocs gh-deploy`、增加另一个 Pages 发布者或上传纯文档构建，否则会覆盖公开数据。组合产物保留 JSON 原始字节、历史日期跳转和 RSS 迁移提示。根首页改为手册。`zh-CN.html` 继续跳转到新闻网站。

旧归档只有 `editions.json`。构建程序原样保留它，以首期数据重建 `latest.json`，并生成确定的跳转页与 RSS 迁移提示。新归档保存全部兼容文件。已发布归档丢失或过期时停止部署。恢复已知成功的归档后再重试，不以空历史替代。

归档保留 90 天。长期暂停前应将成功的公开状态归档保存在项目外部数据目录。更新手册不会改变原有新闻的日期或新鲜度。
