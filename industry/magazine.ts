// Site editorial policy: broad technology feeds need an AI/data-workflow signal.
export const TOPIC_FILTERED_SOURCES=new Set(['rss-ithome','rss-ifanr','rss-geekpark','rss-r-bloggers','rss-cloudflare','rss-vercel','rss-databricks','rss-factset']);
export const MAGAZINE_TOPICS=/\b(ai|llms?|agentic|agents?|rag|mcp|codex|claude|chatgpt|gemini|copilot|deepseek|qwen|embedding|inference|fine.tuning|python|sql|duckdb|polars|parquet|pandas|ocr)\b|artificial intelligence|machine learning|人工智能|大模型|智能体|机器学习|生成式|文档解析|财报分析/i;
export const FINANCIAL_RELEASE_SOURCES=new Set(['json-openbb-releases','json-finrobot-releases','json-fingpt-releases']);
