# Editor pilot

[简体中文](editorial-pilot.zh-CN.md)

Run internally with external actions disabled until source permissions, credentials and provider budgets are configured. Open `/admin/editorial`, search already collected material by title, URL or ID, choose the audience and import a topic. Use the existing source manager to configure collection; an empty database has no material to search. Importing a source item twice opens the existing topic.

1. Keep useful topics as candidates, mark work in progress and discard noise without deleting sources.
2. Open each original source, record its claim, limitations and evidence type, then explicitly check it. Missing dates and changed/unavailable sources remain visible.
3. Save evidence before preparing the draft. Draft preparation assembles source claims and references; it does not produce independently verified reporting or polished model-written prose.
4. Edit the angle, factual summary and audience impact. Keep one unresolved verification question per line; remove it only after resolving it. Save before human review.
5. Verify review, then record the external publication URL and mark published after manual posting. Drafts can be exported before review, but include warnings. Only saved content is exported; private notes are omitted.
6. Reopen the topic when new evidence arrives. Changes require review again; previous editorial snapshots remain in history. A stale save produces a conflict and preserves form input. Reload explicitly after reconciling your changes.

## Proposed assessment

Label an initial 100 real items across financial-research and development workflows. Keep corpus data and results under DATA_ROOT/ai-editorial/evaluations/<explicit-task-id>/, with the engine/model/prompt revision, source/date and assessor. Track useful missed items, incorrect event merges, unsupported summary claims, time spent, accepted topics and actual paid processing cost. Do not infer quality or costs from synthetic tests.

The pilot corpus and source catalog are not supplied or calibrated yet. Start with the upstream demonstration feeds and review the relevance/permission of each before enabling it. Preserve source attribution and default to summaries with links. Keep numeric admission thresholds until labeled examples justify a change.

Membership access must be designed and tested across all website/feed/API/MCP outputs and caches before any subscription launch. Existing anonymous outputs are not member-ready.
