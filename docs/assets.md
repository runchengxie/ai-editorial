# Shared resources

[简体中文](assets.zh-CN.md)

The dynamic service serves shared resources from `assets/`. Retain their adjacent NOTICE and LICENSE files.

`packages/backend/assets/og-fonts/` contains Noto Sans SC 400/700 under SIL OFL 1.1, used for server-generated sharing images. The web frontend uses system fonts rather than requesting these font files. Site-specific icons, logos and report nameplates belong to `configs/site/brand/`; change those when customizing the site.
