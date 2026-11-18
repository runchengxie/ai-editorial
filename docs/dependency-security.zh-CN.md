# 依赖安全状态

[English](dependency-security.md)

截至2026年11月19日，完整开发依赖审计和仅生产依赖审计均为零告警。[picomatch官方公告GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)已于2026年11月18日撤回，此前Vite依赖链中的5个高风险节点不再出现在npm审计结果中。这是公告状态变化，不是依赖补丁修复。

npm注册表显示picomatch最新版仍为4.0.7，公告未列出修复版。已安装的依赖链仍为Vite 8.3.3、tinyglobby 0.2.17、fdir 6.5.0和picomatch 4.0.7。此次没有降级、添加依赖覆盖或屏蔽审计告警。[维护者讨论](https://github.com/micromatch/picomatch/pull/235)对漏洞定性提出异议，并提醒不要接受不可信来源的正则表达式模式。公告撤回并不代表所有glob模式都安全。

2026年11月19日使用Node.js 24.22.2，对源码修订`64c3e75f1541c361e79fc92aaabff7545cdc015b`的锁文件进行了以下核验：

- `npm view picomatch version dist-tags --json`：最新版为4.0.7。
- `npm ls picomatch vite tinyglobby fdir --all`：确认上述依赖版本。
- `npm audit --json`：退出码为0，所有严重程度均为零告警。
- `npm audit --omit=dev --json`：退出码为0，所有严重程度均为零告警。

本机刊物安装器不安装开发依赖。此前的独立归档安装已证明，没有Vite和picomatch时，任务生成模块仍可导入；CI也会重复执行仅生产依赖审计。检查依赖安全时应继续运行两种范围的审计：安装成功不能代替安全核验，零告警只反映检查时的公告数据库状态。独立静态阅读站在前次审计中也没有告警，本次引擎仓库跟进未重新审计该站。
