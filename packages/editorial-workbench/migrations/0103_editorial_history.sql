CREATE TABLE IF NOT EXISTS editorial_history (
 id uuid PRIMARY KEY,
 topic_id uuid NOT NULL REFERENCES editorial_topics(id),
 actor text NOT NULL,
 action text NOT NULL,
 snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
