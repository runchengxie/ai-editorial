CREATE TABLE IF NOT EXISTS editorial_topics (
 id uuid PRIMARY KEY,
 primary_article_id text NOT NULL UNIQUE REFERENCES articles(id),
 title text NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
 audiences text[] NOT NULL CHECK (cardinality(audiences)>0 AND audiences <@ ARRAY['finance-research','development']::text[]),
 status text NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox','candidate','in_progress','published','discarded')),
 review_status text NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed','verified','needs_changes')),
 private_notes text NOT NULL DEFAULT '',
 publication_url text,
 draft jsonb,
 version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
