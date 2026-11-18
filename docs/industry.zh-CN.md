# 行业配置

[English](industry.md)

这个行业的知识都在这里：分类、主题、信源、精选标准和门槛。换一个行业，主要就是改这个文件夹和 [`configs/site/`](../configs/site)（站名、文案、品牌和页面），步骤见 [把它改成你的行业](customize.md)。

| 文件 | 内容 |
|---|---|
| `taxonomy.ts` | 分类、标签、公司与机构、防止模型写错公司的词表，这个行业最受关注的那类发布（`RELEASE`） |
| `topics.json` | 主题目录（`/topics`），站点启动时读取 |
| `sources.json` | 首次启动时导入的示范信源 |
| `prompts/` | 每一步的提示词：预筛、评分、写作、结构化、归组、事件综述、周报月报、翻译 |
| `selection.ts` | 入选门槛 |
| `gold.example.jsonl` | 精选评测样本的格式示例 |
| `relation-gold.example.jsonl` | 事件关系评测样本的格式示例 |
| `story-digest-eval.example.jsonl` | 事件综述评测案例的格式示例 |

提示词Markdown属于运行时输入，留在配置包中；机器私密配置保存在CONFIG_ROOT。路径迁移后包名仍是 `@aihot/industry`，应同步工作区链接、运行入口、Docker与测试。已安装的不可变任务版本在明确升级前仍保留原来的目录布局。
