// Site editorial policy: broad technology feeds need an AI/data-workflow signal.
export const TOPIC_FILTERED_SOURCES=new Set(['rss-ithome','rss-ifanr','rss-geekpark','rss-r-bloggers','rss-cloudflare','rss-vercel','rss-databricks','rss-factset','rss-alphasense','rss-hackernews-ai','rss-arxiv-targeted','rss-clickhouse-blog','rss-langchain-blog','rss-netflix-tech','rss-github-engineering','rss-google-developers','rss-sebastian-technical','rss-xbrl-international']);
export const MAGAZINE_TOPICS=/\b(ai|llms?|agentic|agents?|rag|mcp|codex|claude|chatgpt|gemini|copilot|deepseek|qwen|embeddings?|inference|fine.tuning|python|sql|duckdb|polars|parquet|pandas|ocr|analytics)\b|artificial intelligence|machine learning|language models?|fact.checking|factuality|vector search|data processing|lakehouse|人工智能|大模型|智能体|机器学习|生成式|文档解析|财报分析/i;
export const FINANCIAL_RELEASE_SOURCES=new Set(['json-openbb-releases','json-finrobot-releases','json-fingpt-releases','json-edgartools-releases','json-arelle-releases']);
export const FINANCIAL_EDITORIAL_SOURCES=new Set(['rss-factset','rss-alphasense','rss-sec-structured-disclosure','rss-xbrl-international']);
export const FINANCIAL_WORKFLOW_TOPICS=/\b(?:i?xbrl|edgar)\b|\b10-[kq]\b|SEC filings?|financial statements?|(?:financial reporting|GAAP|IFRS) taxonom(?:y|ies)|earnings.calls?|structured financial|investment research|equity research|财报解析|财务报表|投研工作流/i;
export const RESEARCH_SOURCES=new Set(['rss-arxiv-targeted']);
export const COMMUNITY_SOURCES=new Set(['rss-hackernews-ai']);
