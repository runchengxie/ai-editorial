# Daily brief data contract v1

The producer is [ai-editorial](https://github.com/runchengxie/ai-editorial); the consumer is [ai-editorial-pages](https://github.com/runchengxie/ai-editorial-pages). The public endpoint is `https://runchengxie.github.io/ai-editorial/editions.json`. Its existing wire shape is version 1; incompatible changes require a new endpoint and coordinated consumer changes. No engine checkout or credential is needed to read it.

The [JSON Schema](editions-v1.schema.json) documents field bounds; cross-field and freshness rules below are additionally enforced by the consumer.

The payload is an array of 1–30 editions, sorted newest date first. Every edition has `date` (Shanghai calendar YYYY-MM-DD), `generatedAt` (canonical ISO UTC timestamp), `windowDays: 7`, `sources` (sourceId, sourceName, ok), and `items` (title, HTTP(S) URL without credentials, publishedAt, sourceId, sourceName, audience). Audience is finance, development or general. Only these fields may be exported; unknown downloaded fields are removed by the reader.

Each edition has 1–8 entries, at most two per source, no duplicate URLs, and publication times within its seven-day window and no later than generation. Source IDs are unique; each item refers to an available source with the same name. At least half the configured sources must be available. Keep at most 30 days of history. The consumer rejects latest data older than 48 hours, future timestamps and malformed archive state, preserving the last published site.

The public contract exposes source metadata and links, not original bodies, internal editorial topics, private notes or draft packets. The reader records the source URL, normalized payload SHA-256, source generation time and its own revision in `build.json`. Cross-repository validation records the tested producer and renderer revisions in the owning task's external evaluation record. No runtime API key, database or GitHub PAT crosses this boundary.
