# 内部采编工作台：本地运行

[English](editorial-setup.md)

需要 Node.js 24.22.2 或更新版本，以及 PostgreSQL 17 或更新版本。第一版仅供内部使用：API、网页和数据库都绑定本机回环地址，或对所有入口设置统一身份验证。上游的匿名网页、RSS、API、MCP 仍然存在，仅有后台登录不代表整个站点已私有化。

## 数据和配置

从本机配置解析 CODE_ROOT、DATA_ROOT、CONFIG_ROOT，遵守[数据约定](editorial-data-contract.md)。测试使用独立数据库，不能连接共享业务数据库。密钥的权威副本放在 CONFIG_ROOT/projects/ai-editorial，限制为本人可读。应用不会自动读取工作区根配置。

显式传入 DATABASE_URL、AIHOT_DATA_DIR、SITE_URL、API_PORT、API_BASE_URL、WEB_PORT。分组密钥文件可通过 AIHOT_CREDENTIALS_DIR 指向项目配置目录。保持 COLLECT_ENABLED、MODEL_CALLS_ENABLED、FEISHU_CONTENT_PUSH_ENABLED、FEISHU_INTERNAL_ENABLED、DINGTALK_CONTENT_PUSH_ENABLED、INDEXNOW_SUBMIT_ENABLED、BAIDU_PUSH_ENABLED 为 false。不要直接运行未经调整的 init-env.ts，它会开启真实采集和模型调用。

## 本地验证

```sh
npm ci --no-audit --no-fund
npm run typecheck
npm run build -w @aihot/web
# DATABASE_URL 必须指向可丢弃的 *_test 或 *_ci 数据库。
npm test
npx playwright install chromium webkit
npm run test:web
```

备份测试需要与服务端主版本匹配的 PostgreSQL 客户端，并将其加入 PATH。API 使用 `node apps/api/src/main.ts` 启动；网页在 apps/web 内运行 `node server.ts`。API_HOST、WEB_HOST 设为 127.0.0.1，并选择未占用的任务专用端口。随后执行 `node scripts/smoke.ts --base <本地网页地址>`。

仅调试界面时可设置 DEV_AUTH_ROLE=admin，不能将它用于外部可访问的服务。日常使用优先配置管理员密码。确定性的草稿资料包不需要模型密钥。

也可以临时解包 PostgreSQL 运行时，不安装系统服务。可丢弃的是运行程序，保留的数据库和验证结果仍应放在 DATA_ROOT。安装系统服务、启用真实接口和公开部署需要分别处理。
