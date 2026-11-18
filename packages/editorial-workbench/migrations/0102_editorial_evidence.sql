CREATE TABLE IF NOT EXISTS editorial_evidence (
 topic_id uuid NOT NULL REFERENCES editorial_topics(id),
 article_id text NOT NULL REFERENCES articles(id),
 claim text NOT NULL DEFAULT '',
 limitations text NOT NULL DEFAULT '',
 kind text NOT NULL DEFAULT 'official_claim' CHECK (kind IN ('official_claim','independent_test','community_report')),
 checked boolean NOT NULL DEFAULT false,
 revision integer NOT NULL,
 PRIMARY KEY (topic_id,article_id)
);
