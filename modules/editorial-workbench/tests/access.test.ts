import "../../../tests/setup.ts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import Fastify from "fastify";
import { config } from "@aihot/backend/config";
import { closeDb, sql } from "@aihot/backend/db";
import {
  passwordLogin,
  SESSION_COOKIE,
  sessionPrincipal,
} from "@aihot/backend/admin/auth";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { registerEditorial } from "../api/routes.ts";

config.adminPassword = "editorial-test-password-012345";
config.devAdmin = null;
const app = Fastify();
registerEditorial(app);
after(async () => {
  await app.close();
  await closeDb();
});
const { token } = await passwordLogin(
  config.adminPassword,
  "/admin",
  "editorial-test",
);
const cookie = `${SESSION_COOKIE}=${token}`;
const admin = await sessionPrincipal(cookie);
const headers = { cookie, "x-csrf-token": admin!.csrf };
const base = "/api/admin/editorial/topics";

test("anonymous and forged writes are denied; all editorial responses are private", async () => {
  for (const method of ["GET", "POST"] as const) {
    const r = await app.inject({
      method,
      url: base,
      ...(method === "POST" ? { payload: {} } : {}),
    });
    assert.equal(r.statusCode, 401);
    assert.match(String(r.headers["cache-control"]), /private.*no-store/);
  }
  const r = await app.inject({
    method: "POST",
    url: base,
    headers: { cookie },
    payload: {},
  });
  assert.equal(r.statusCode, 403);
  assert.equal(
    (await app.inject({ method: "GET", url: base, headers })).statusCode,
    200,
  );
});

test("inputs are validated and module never exposes a public endpoint", async () => {
  for (const payload of [
    { articleId: "anything", audiences: ["invalid"] },
    { articleId: "anything", audiences: [] },
  ]) {
    assert.equal(
      (await app.inject({ method: "POST", url: base, headers, payload }))
        .statusCode,
      400,
    );
  }
  assert.equal(
    (
      await app.inject({
        method: "GET",
        url: "/api/v1/editorial/topics",
        headers,
      })
    ).statusCode,
    404,
  );
  assert.equal(
    (await app.inject({ method: "GET", url: base + "/bad-id", headers }))
      .statusCode,
    400,
  );
  await sql`INSERT INTO sources (id,name,kind) VALUES ('api-editorial','Source','rss')`;
  const articleId = (
    await upsertMaterial({
      sourceId: "api-editorial",
      url: "https://example.com/api-news",
      title: "API news",
      bodyText: "Test",
      bodyStatus: "ok",
      via: "fetch",
      publishedAt: new Date(),
    })
  ).articleId;
  const created = await app.inject({
    method: "POST",
    url: base,
    headers,
    payload: { articleId, audiences: ["development"] },
  });
  assert.equal(created.statusCode, 200);
  const topic = created.json();
  for (const patch of [
    { status: "nonsense" },
    { audiences: [] },
    { publicationUrl: "javascript:alert(1)" },
    { title: "x".repeat(301) },
  ]) {
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: base + "/" + topic.id,
          headers,
          payload: { expectedVersion: topic.version, ...patch },
        })
      ).statusCode,
      400,
    );
  }
  const saved = await app.inject({
    method: "PATCH",
    url: base + "/" + topic.id,
    headers,
    payload: {
      expectedVersion: topic.version,
      privateNotes: "PRIVATE_NEVER_EXPORT",
    },
  });
  assert.equal(saved.statusCode, 200);
  assert.equal(
    (
      await app.inject({
        method: "PATCH",
        url: base + "/" + topic.id,
        headers,
        payload: { expectedVersion: topic.version, title: "stale" },
      })
    ).statusCode,
    409,
  );
  const out = await app.inject({
    method: "GET",
    url: base + "/" + topic.id + "/export",
    headers,
  });
  assert.equal(out.statusCode, 200);
  assert.equal(out.body.includes("PRIVATE_NEVER_EXPORT"), false);
});
