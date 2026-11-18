# Internal workbench setup

[简体中文](editorial-setup.zh-CN.md)

Use Node.js 24.22.2 or later and PostgreSQL 17 or later. This fork starts as an internal tool: bind the API, web server and database to loopback, or protect every endpoint with an authenticated perimeter. The upstream anonymous website/RSS/API/MCP remain present; administrator authentication alone does not make the whole service private.

## Storage and configuration

Resolve CODE_ROOT, DATA_ROOT and CONFIG_ROOT from your machine settings. Follow [the data contract](editorial-data-contract.md). Create a dedicated PostgreSQL cluster/database; never use a shared authoritative database for tests. Keep authoritative secret files under CONFIG_ROOT/projects/ai-editorial with owner-only permissions. The application does not automatically read workspace root settings.

Inject DATABASE_URL, AIHOT_DATA_DIR, SITE_URL, API_PORT, API_BASE_URL and WEB_PORT explicitly. Set AIHOT_CREDENTIALS_DIR to the project's configuration directory if using grouped secret files. Keep COLLECT_ENABLED, MODEL_CALLS_ENABLED, FEISHU_CONTENT_PUSH_ENABLED, FEISHU_INTERNAL_ENABLED, DINGTALK_CONTENT_PUSH_ENABLED, INDEXNOW_SUBMIT_ENABLED and BAIDU_PUSH_ENABLED false. The optional init-env.ts helper creates random local secrets and leaves collection/model calls disabled.

## Local verification

```sh
npm ci --no-audit --no-fund
npm run typecheck
npm run build -w @aihot/web
# DATABASE_URL must name a disposable *_test or *_ci database.
npm test
npx playwright install chromium webkit
npm run test:web
```

Use PostgreSQL backup clients matching the server major version and include them in PATH for backup tests. Run the API using `node apps/api/src/main.ts`; run the built web app using `node server.ts` inside apps/web. Set API_HOST and WEB_HOST to 127.0.0.1 and choose available task-specific ports. Then run `node scripts/smoke.ts --base <local-web-url>`.

For UI-only development, DEV_AUTH_ROLE=admin supplies a local administrator; never use it on a reachable service. Prefer a configured administrator password for ordinary use. No model key is needed for deterministic draft packets.

A temporary extracted PostgreSQL runtime is an alternative to installing a system service. Its binaries may be disposable; its retained database and results still belong under DATA_ROOT. Provisioning system services, enabling live providers and public deployment are separate operations.

The optional internal dynamic-app example is `configs/dynamic.env.example`; it contains placeholders, not live credentials. The local magazine installer manages its separate private configuration under CONFIG_ROOT.
