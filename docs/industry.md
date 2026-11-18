# Industry configuration

[简体中文](industry.zh-CN.md)

`configs/industry/` is the typed `@aihot/industry` npm workspace. It owns taxonomy, topic definitions, sources, editorial prompts and thresholds. The package identity is unchanged by its physical move under `configs/`. Site identity and branding belong to the neighboring `configs/site/` workspace. See [customization](customize.md).

| File | Purpose |
| --- | --- |
| `taxonomy.ts` | Categories, tags, entities, vocabulary and release subjects |
| `topics.json` | Topic catalog read at startup |
| `sources.json` | Source catalog used directly by magazine collection and for initial generic seeding |
| `magazine.ts` | Magazine topic/audience policy and bounded research/community lanes |
| `prompts/` | Runtime screening, scoring, writing, grouping, translation and report templates |
| `selection.ts` | Selection thresholds; calibrate using labeled material |
| `*.example.jsonl` | Selection, relation and digest-evaluation format examples |

Prompt Markdown is application input, not explanatory documentation, so it stays with this workspace. Private machine/provider configuration belongs under `CONFIG_ROOT`, not here. Changing a path requires updating workspace links, runtime readers, Docker and tests together. Existing installed immutable worker releases retain their own source layout until deliberately replaced.
