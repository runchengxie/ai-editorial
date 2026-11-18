// Site editorial policy: broad technology feeds need an AI/data-workflow signal.
export const TOPIC_FILTERED_SOURCES=new Set(['rss-ithome','rss-ifanr','rss-geekpark','rss-r-bloggers','rss-cloudflare','rss-vercel','rss-databricks','rss-factset','rss-alphasense']);
export const MAGAZINE_TOPICS=/\b(ai|llms?|agentic|agents?|rag|mcp|codex|claude|chatgpt|gemini|copilot|deepseek|qwen|embedding|inference|fine.tuning|python|sql|duckdb|polars|parquet|pandas|ocr)\b|artificial intelligence|machine learning|人工智能|大模型|智能体|机器学习|生成式|文档解析|财报分析/i;
export const FINANCIAL_RELEASE_SOURCES=new Set(['json-openbb-releases','json-finrobot-releases','json-fingpt-releases','json-edgartools-releases','json-arelle-releases']);
export const FINANCIAL_EDITORIAL_SOURCES=new Set(['rss-factset','rss-alphasense']);
export const FINANCIAL_WORKFLOW_TOPICS=/\bxbrl\b|\b10-[kq]\b|SEC filings?|financial statements?|structured financial|investment research|equity research|财报解析|财务报表|投研工作流/i;
