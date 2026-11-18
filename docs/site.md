# Site configuration

[简体中文](site.zh-CN.md)

`configs/site/` is the typed `@aihot/site` workspace. It owns site identity, branding, dynamic application copy/policies and enabled module composition. See [customization](customize.md) and [repository layout](repository-layout.md).

| Path | Purpose |
| --- | --- |
| `site.ts` | Identity, interface copy, inherited dynamic-report timing and public category mappings |
| `models.ts` | Named models and default choices for engine steps |
| `brand/` | Site icons, logos, optional wordmarks/contact images and report nameplates |
| `pages/` | Runtime policy Markdown templates requiring operator review before public use |
| `public/` | Fixed dynamic-site files with configured placeholders |
| `changelog.json` | Dynamic-site changelog |
| `modules/` | Module manifests and server/web composition; this fork installs the editorial workbench |

Dynamic engine timing/model defaults do not activate the separate magazine scheduler or cloud publication. Current magazine operations are manual. Private model credentials and production settings remain outside Git under `CONFIG_ROOT`. Moving this workspace does not change its npm identity or install it into an existing immutable worker release.
