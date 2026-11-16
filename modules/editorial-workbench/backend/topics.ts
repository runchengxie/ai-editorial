import { randomUUID } from "node:crypto";
import { z } from "zod";
import { sql, type Db } from "@aihot/backend/db";
import { AUDIENCES, STATUSES, EVIDENCE_KINDS } from "../contracts.ts";
import type {
  CreateTopicInput,
  Topic,
  TopicDetail,
  TopicPatch,
  TopicFilter,
  EvidenceInput,
  DraftPacket,
} from "../contracts.ts";

const audience = z
  .array(z.enum(AUDIENCES))
  .min(1)
  .max(2)
  .transform((v) => [...new Set(v)]);
export const httpUrl = z
  .string()
  .url()
  .max(4000)
  .refine(
    (v) => ["https:", "http:"].includes(new URL(v).protocol),
    "Use an HTTP(S) URL",
  );
export const createSchema = z
  .object({ articleId: z.string().min(1).max(80), audiences: audience })
  .strict();
export const patchSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    audiences: audience.optional(),
    status: z.enum(STATUSES).optional(),
    privateNotes: z.string().max(20000).optional(),
    publicationUrl: httpUrl.nullable().optional(),
  })
  .strict();
export const evidenceSchema = z
  .object({
    articleId: z.string().min(1).max(80),
    claim: z.string().max(10000),
    limitations: z.string().max(10000),
    kind: z.enum(EVIDENCE_KINDS),
    checked: z.boolean(),
  })
  .strict();
export const draftSchema = z
  .object({
    angle: z.string().max(10000),
    factualSummary: z.string().max(30000),
    audienceImpact: z.string().max(10000),
    verificationQuestions: z.array(z.string().trim().min(1).max(2000)).max(100),
    references: z
      .array(
        z.object({
          articleId: z.string().max(80),
          url: httpUrl,
          title: z.string().max(1000),
        }),
      )
      .max(100),
  })
  .strict();
const fail = (message: string, code = "conflict") =>
  Object.assign(new Error(message), { code });
const iso = (v: Date | string) => new Date(v).toISOString();
function topicRow(r: Record<string, any>): TopicDetail {
  return {
    id: r.id,
    title: r.title,
    audiences: r.audiences,
    status: r.status,
    reviewStatus: r.review_status,
    privateNotes: r.private_notes,
    publicationUrl: r.publication_url,
    version: r.version,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
    draft: r.draft,
    evidence: [],
  };
}
export async function getTopic(
  id: string,
  db: Db = sql,
): Promise<TopicDetail | null> {
  const [r] = await db`SELECT * FROM editorial_topics WHERE id=${id}`;
  if (!r) return null;
  const topic = topicRow(r);
  const rows =
    await db`SELECT e.*,a.url,a.title,a.published_at,a.revision AS current_revision,s.name AS source,
  (a.body_status NOT IN ('none','unconfirmed') AND NOT EXISTS(SELECT 1 FROM publications p WHERE p.article_id=a.id AND p.visibility <> 'public')) AS available
  FROM editorial_evidence e JOIN articles a ON a.id=e.article_id JOIN sources s ON s.id=a.source_id WHERE e.topic_id=${id} ORDER BY e.article_id`;
  topic.evidence = rows.map((e) => ({
    articleId: e.article_id,
    url: e.url,
    title: e.title,
    source: e.source,
    publishedAt: e.published_at ? iso(e.published_at) : null,
    claim: e.claim,
    limitations: e.limitations,
    kind: e.kind,
    checked: e.checked && e.revision === e.current_revision,
    available: e.available,
    revision: e.current_revision,
  }));
  if (
    topic.reviewStatus === "verified" &&
    topic.evidence.some((e) => !e.checked || !e.available)
  )
    topic.reviewStatus = "needs_changes";
  return topic;
}
async function history(db: Db, id: string, actor: string, action: string) {
  const t = await getTopic(id, db);
  await db`INSERT INTO editorial_history(id,topic_id,actor,action,snapshot) VALUES(${randomUUID()},${id},${actor},${action},${db.json(t as any)})`;
  return t!;
}
export async function createTopic(
  input: CreateTopicInput,
  actor: string,
): Promise<TopicDetail> {
  const v = createSchema.parse(input);
  return (await sql.begin(async (db) => {
    const [a] =
      await db`SELECT id,title,revision FROM articles WHERE id=${v.articleId}`;
    if (!a) throw fail("Article not found", "not_found");
    const id = randomUUID();
    const rows =
      await db`INSERT INTO editorial_topics(id,primary_article_id,title,audiences) VALUES(${id},${a.id},${a.title.slice(0, 300)},${v.audiences}) ON CONFLICT(primary_article_id) DO NOTHING RETURNING id`;
    if (!rows.length) {
      const [existing] =
        await db`SELECT id FROM editorial_topics WHERE primary_article_id=${a.id}`;
      return (await getTopic(existing.id, db))!;
    }
    await db`INSERT INTO editorial_evidence(topic_id,article_id,revision) VALUES(${id},${a.id},${a.revision})`;
    return history(db, id, actor, "created");
  })) as TopicDetail;
}
export async function listTopics(
  filter: TopicFilter,
): Promise<{ rows: Topic[]; nextCursor: string | null }> {
  const f = z
    .object({
      status: z.enum(STATUSES).optional(),
      audience: z.enum(AUDIENCES).optional(),
      q: z.string().max(300).optional(),
      cursor: z.string().uuid().optional(),
    })
    .parse(filter);
  const rows = await sql`SELECT * FROM editorial_topics WHERE
  (${f.status ?? null}::text IS NULL OR status=${f.status ?? null}) AND
  (${f.audience ?? null}::text IS NULL OR ${f.audience ?? null}=ANY(audiences)) AND
  (${f.q ?? ""}='' OR strpos(lower(title),lower(${f.q ?? ""}))>0) AND
  (${f.cursor ?? null}::uuid IS NULL OR id<${f.cursor ?? null}::uuid)
  ORDER BY id DESC LIMIT 51`;
  return {
    rows: rows.slice(0, 50).map(topicRow),
    nextCursor: rows.length > 50 ? rows[49].id : null,
  };
}
async function edit(
  id: string,
  version: number,
  actor: string,
  action: string,
  fn: (db: Db, t: TopicDetail) => Promise<void>,
) {
  return (await sql.begin(async (db) => {
    const [r] =
      await db`SELECT id FROM editorial_topics WHERE id=${id} FOR UPDATE`;
    if (!r) throw fail("Topic not found", "not_found");
    const t = (await getTopic(id, db))!;
    if (t.version !== version)
      throw fail("Topic changed. Reload before saving.");
    await fn(db, t);
    await db`UPDATE editorial_topics SET version=version+1,updated_at=now() WHERE id=${id}`;
    return history(db, id, actor, action);
  })) as TopicDetail;
}
export async function updateTopic(
  id: string,
  version: number,
  patch: TopicPatch,
  actor: string,
) {
  const p = patchSchema.parse(patch);
  return edit(id, version, actor, "updated", async (db, t) => {
    const next = { ...t, ...p };
    if (
      p.status === "published" &&
      t.status !== "published" &&
      (t.reviewStatus !== "verified" || !next.publicationUrl)
    )
      throw fail("Verified review and publication URL are required.");
    const changesEvidence =
      (p.title !== undefined && p.title !== t.title) ||
      (p.audiences !== undefined &&
        [...p.audiences].sort().join(",") !==
          [...t.audiences].sort().join(","));
    const review =
      changesEvidence && t.reviewStatus !== "unreviewed"
        ? "needs_changes"
        : t.reviewStatus;
    if (p.status === "published" && t.status !== "published" && changesEvidence)
      throw fail("Review content changes before publication.");
    await db`UPDATE editorial_topics SET title=${next.title},audiences=${next.audiences},status=${next.status},private_notes=${next.privateNotes},publication_url=${next.publicationUrl},review_status=${review} WHERE id=${id}`;
  });
}
export async function addEvidence(
  id: string,
  version: number,
  input: EvidenceInput,
  actor: string,
) {
  const e = evidenceSchema.parse(input);
  return edit(id, version, actor, "evidence", async (db, t) => {
    const [a] = await db`SELECT revision FROM articles WHERE id=${e.articleId}`;
    if (!a) throw fail("Article not found", "not_found");
    await db`INSERT INTO editorial_evidence(topic_id,article_id,claim,limitations,kind,checked,revision) VALUES(${id},${e.articleId},${e.claim},${e.limitations},${e.kind},${e.checked},${a.revision}) ON CONFLICT(topic_id,article_id) DO UPDATE SET claim=excluded.claim,limitations=excluded.limitations,kind=excluded.kind,checked=excluded.checked,revision=excluded.revision`;
    await db`UPDATE editorial_topics SET review_status=${t.reviewStatus === "unreviewed" ? "unreviewed" : "needs_changes"} WHERE id=${id}`;
  });
}
export async function saveDraft(
  id: string,
  version: number,
  input: DraftPacket,
  actor: string,
) {
  const packet = draftSchema.parse(input);
  return edit(id, version, actor, "draft", async (db, t) => {
    const references = t.evidence.map((e) => ({
      articleId: e.articleId,
      url: e.url,
      title: e.title,
    }));
    await db`UPDATE editorial_topics SET draft=${db.json({ ...packet, references })},review_status=${t.reviewStatus === "unreviewed" ? "unreviewed" : "needs_changes"} WHERE id=${id}`;
  });
}
export async function verifyTopic(id: string, version: number, actor: string) {
  return edit(id, version, actor, "verified", async (db, t) => {
    if (
      !t.evidence.length ||
      t.evidence.some((e) => !e.checked || !e.available || !e.claim.trim())
    )
      throw fail("Check every evidence source and claim before review.");
    if (
      !t.draft ||
      ![t.draft.angle, t.draft.factualSummary, t.draft.audienceImpact].every(
        (s) => s.trim(),
      )
    )
      throw fail("Complete the draft before review.");
    if (t.draft.verificationQuestions.length)
      throw fail("Resolve verification questions before review.");
    await db`UPDATE editorial_topics SET review_status='verified' WHERE id=${id}`;
  });
}
