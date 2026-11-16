import "../../../tests/setup.ts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import {
  createTopic,
  updateTopic,
  addEvidence,
  getTopic,
  listTopics,
  verifyTopic,
  saveDraft,
} from "../backend/topics.ts";
import { prepareDraft, exportDraft } from "../backend/drafts.ts";

after(closeDb);
await sql`INSERT INTO sources (id, name, kind, tier) VALUES ('editorial-source', 'Official example', 'rss', 'T1')`;
async function article() {
  return (
    await upsertMaterial({
      sourceId: "editorial-source",
      url: `https://example.com/${crypto.randomUUID()}`,
      title: "New table extraction tool",
      bodyText: "An announced tool, not independently tested.",
      bodyStatus: "ok",
      via: "fetch",
      publishedAt: new Date(),
    })
  ).articleId;
}

test("topics persist, import is idempotent, filters are bounded and edits detect stale versions", async () => {
  const articleId = await article();
  const first = await createTopic(
    { articleId, audiences: ["finance-research"] },
    "editor",
  );
  const again = await createTopic(
    { articleId, audiences: ["development"] },
    "editor",
  );
  assert.equal(first.id, again.id);
  const concurrent = await Promise.all([
    createTopic({ articleId, audiences: ["development"] }, "editor"),
    createTopic({ articleId, audiences: ["development"] }, "editor"),
  ]);
  assert.equal(concurrent[0].id, concurrent[1].id);
  assert.equal(first.status, "inbox");
  assert.equal(first.reviewStatus, "unreviewed");
  const changed = await updateTopic(
    first.id,
    first.version,
    {
      privateNotes: "PRIVATE NOTE",
      audiences: ["finance-research", "development"],
      status: "candidate",
    },
    "editor",
  );
  assert.equal((await getTopic(first.id))?.privateNotes, "PRIVATE NOTE");
  assert.equal(changed.version, first.version + 1);
  await assert.rejects(
    updateTopic(first.id, first.version, { title: "stale" }, "editor"),
    /changed/i,
  );
  assert.equal(
    (
      await listTopics({ status: "candidate", audience: "development" })
    ).rows.some((t) => t.id === first.id),
    true,
  );
  assert.ok(
    (await sql`SELECT 1 FROM editorial_history WHERE topic_id=${first.id}`)
      .length >= 2,
  );
  await assert.rejects(
    createTopic({ articleId: "missing", audiences: ["development"] }, "editor"),
    /not found/i,
  );
});

test("review needs checked evidence and a completed draft; evidence edits revoke review and preserve history", async () => {
  let topic = await createTopic(
    { articleId: await article(), audiences: ["development"] },
    "editor",
  );
  await assert.rejects(
    verifyTopic(topic.id, topic.version, "editor"),
    /evidence|draft/i,
  );
  topic = await addEvidence(
    topic.id,
    topic.version,
    {
      articleId: topic.evidence[0].articleId,
      claim: "Processes financial tables",
      limitations: "Only a vendor announcement",
      kind: "official_claim",
      checked: true,
    },
    "editor",
  );
  let packet = prepareDraft(topic);
  assert.ok(packet.references.length);
  assert.equal(
    packet.factualSummary.includes("Processes financial tables"),
    true,
  );
  packet = {
    ...packet,
    angle: "Test the tool",
    audienceImpact: "May reduce manual table entry",
    verificationQuestions: ["Does it preserve footnotes?"],
  };
  topic = await saveDraft(topic.id, topic.version, packet, "editor");
  await assert.rejects(
    verifyTopic(topic.id, topic.version, "editor"),
    /questions/i,
  );
  topic = await saveDraft(
    topic.id,
    topic.version,
    { ...packet, verificationQuestions: [] },
    "editor",
  );
  topic = await verifyTopic(topic.id, topic.version, "editor");
  assert.equal(topic.reviewStatus, "verified");
  await assert.rejects(
    updateTopic(topic.id, topic.version, { status: "published" }, "editor"),
    /publication/i,
  );
  topic = await updateTopic(
    topic.id,
    topic.version,
    {
      title: topic.title,
      audiences: topic.audiences,
      status: "published",
      publicationUrl: "https://example.com/published",
    },
    "editor",
  );
  topic = await addEvidence(
    topic.id,
    topic.version,
    {
      articleId: topic.evidence[0].articleId,
      claim: "Corrected result",
      limitations: "Only tested on one file",
      kind: "independent_test",
      checked: true,
    },
    "editor",
  );
  assert.equal(topic.reviewStatus, "needs_changes");
  assert.equal(topic.status, "published");
  topic = await updateTopic(
    topic.id,
    topic.version,
    { status: "published", privateNotes: "Correction in progress" },
    "editor",
  );
  assert.equal(topic.reviewStatus, "needs_changes");
  assert.ok(
    (await sql`SELECT 1 FROM editorial_history WHERE topic_id=${topic.id}`)
      .length >= 6,
  );
});

test("exports exclude notes, render unknown dates, escape HTML and warn when evidence is stale or unavailable", async () => {
  let topic = await createTopic(
    { articleId: await article(), audiences: ["finance-research"] },
    "editor",
  );
  topic = await updateTopic(
    topic.id,
    topic.version,
    { privateNotes: "SECRET_EDITOR_NOTE" },
    "editor",
  );
  const unknown = {
    ...topic,
    evidence: topic.evidence.map((e) => ({
      ...e,
      publishedAt: null,
      available: false,
      claim: "<script>alert(1)</script>",
    })),
  };
  const exported = exportDraft({ ...unknown, draft: prepareDraft(unknown) });
  assert.equal(exported.markdown.includes("SECRET_EDITOR_NOTE"), false);
  assert.equal(exported.markdown.includes("<script>"), false);
  assert.match(exported.markdown, /Unknown date/);
  assert.ok(exported.warnings.some((w) => /unavailable/i.test(w)));
  assert.ok(exported.warnings.some((w) => /review/i.test(w)));
  assert.match(exported.markdown, /https:\/\/example.com/);
});

test("source changes and withdrawals invalidate human review without exposing notes", async () => {
  let topic = await createTopic(
    { articleId: await article(), audiences: ["development"] },
    "editor",
  );
  const articleId = topic.evidence[0].articleId;
  topic = await addEvidence(
    topic.id,
    topic.version,
    {
      articleId,
      claim: "Test result",
      limitations: "One sample",
      kind: "independent_test",
      checked: true,
    },
    "editor",
  );
  topic = await saveDraft(
    topic.id,
    topic.version,
    {
      ...prepareDraft(topic),
      audienceImpact: "Useful in research",
      verificationQuestions: [],
    },
    "editor",
  );
  topic = await verifyTopic(topic.id, topic.version, "editor");
  topic = await updateTopic(
    topic.id,
    topic.version,
    { privateNotes: "SECRET_SOURCE_CHANGE" },
    "editor",
  );
  assert.equal(topic.reviewStatus, "verified");
  await sql`UPDATE articles SET revision=revision+1 WHERE id=${articleId}`;
  topic = (await getTopic(topic.id))!;
  assert.equal(topic.reviewStatus, "needs_changes");
  assert.equal(topic.evidence[0].checked, false);
  await assert.rejects(
    updateTopic(
      topic.id,
      topic.version,
      { status: "published", publicationUrl: "https://example.com/post" },
      "editor",
    ),
    /review/i,
  );
  await sql`UPDATE articles SET body_status='none' WHERE id=${articleId}`;
  topic = (await getTopic(topic.id))!;
  assert.ok(exportDraft(topic).warnings.some((w) => /unavailable/.test(w)));
  assert.equal(
    exportDraft(topic).markdown.includes("SECRET_SOURCE_CHANGE"),
    false,
  );
});
