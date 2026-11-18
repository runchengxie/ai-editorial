import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { actorOf } from "@aihot/backend/admin/auth";
import { adminHandler } from "../../../apps/api/src/routes/admin-auth.ts";
import {
  createTopic,
  getTopic,
  listTopics,
  updateTopic,
  addEvidence,
  saveDraft,
  verifyTopic,
  createSchema,
  patchSchema,
  evidenceSchema,
  draftSchema,
} from "../backend/topics.ts";
import { prepareDraft, exportDraft } from "../backend/drafts.ts";
import type { TopicFilter } from "../contracts.ts";
const root = "/api/admin/editorial/topics";
const id = (r: FastifyRequest) =>
  z
    .string()
    .uuid()
    .parse((r.params as { id: string }).id);
const version = z.number().int().positive();
export function registerEditorial(app: FastifyInstance) {
  app.addHook("onSend", async (req, reply, payload) => {
    if (req.url.startsWith("/api/admin/editorial/"))
      reply.header("Cache-Control", "private, no-store");
    return payload;
  });
  const guarded = (fn: Parameters<typeof adminHandler>[0]) =>
    adminHandler(async (req, reply, admin) => {
      try {
        return await fn(req, reply, admin);
      } catch (e) {
        if ((e as { code?: string }).code === "not_found")
          return reply.code(404).send({ detail: "Not found" });
        throw e;
      }
    });
  app.get(
    root,
    guarded(async (req) => listTopics(req.query as TopicFilter)),
  );
  app.post(
    root,
    guarded(async (req, _reply, a) =>
      createTopic(createSchema.parse(req.body), actorOf(a)),
    ),
  );
  app.get(
    root + "/:id",
    guarded(async (req, reply) => {
      const t = await getTopic(id(req));
      return t ?? reply.code(404).send({ detail: "Not found" });
    }),
  );
  app.patch(
    root + "/:id",
    guarded(async (req, _reply, a) => {
      const { expectedVersion, ...patch } = z
        .object({ expectedVersion: version })
        .passthrough()
        .parse(req.body);
      return updateTopic(
        id(req),
        expectedVersion,
        patchSchema.parse(patch),
        actorOf(a),
      );
    }),
  );
  app.post(
    root + "/:id/evidence",
    guarded(async (req, _reply, a) => {
      const v = z
        .object({ expectedVersion: version, evidence: evidenceSchema })
        .strict()
        .parse(req.body);
      return addEvidence(id(req), v.expectedVersion, v.evidence, actorOf(a));
    }),
  );
  app.post(
    root + "/:id/draft",
    guarded(async (req, reply, a) => {
      const v = z.object({ expectedVersion: version }).strict().parse(req.body);
      const t = await getTopic(id(req));
      if (!t) return reply.code(404).send({ detail: "Not found" });
      return saveDraft(t.id, v.expectedVersion, prepareDraft(t), actorOf(a));
    }),
  );
  app.patch(
    root + "/:id/draft",
    guarded(async (req, _reply, a) => {
      const v = z
        .object({ expectedVersion: version, draft: draftSchema })
        .strict()
        .parse(req.body);
      return saveDraft(id(req), v.expectedVersion, v.draft, actorOf(a));
    }),
  );
  app.post(
    root + "/:id/verify",
    guarded(async (req, _reply, a) => {
      const v = z.object({ expectedVersion: version }).strict().parse(req.body);
      return verifyTopic(id(req), v.expectedVersion, actorOf(a));
    }),
  );
  app.get(
    root + "/:id/export",
    guarded(async (req, reply) => {
      const t = await getTopic(id(req));
      if (!t) return reply.code(404).send({ detail: "Not found" });
      return reply
        .header("Content-Type", "text/markdown; charset=utf-8")
        .header(
          "Content-Disposition",
          `attachment; filename="topic-${t.id}.md"`,
        )
        .send(exportDraft(t).markdown);
    }),
  );
}
