import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium, expect, type Browser } from "@playwright/test";
import {
  fakeApi,
  startWebServer,
  visit,
  type WebServer,
} from "./web-server.ts";
let web: WebServer;
let browser: Browser;
let signedIn = true;
let stale = false;
let delaySave = false;
let releaseSave: () => void = () => {};
const id = "e2a6e43b-71c2-4b19-8112-70f06cb049ec";
let topic: any = {
  id,
  title: "Financial table extraction",
  audiences: ["finance-research"],
  status: "inbox",
  reviewStatus: "unreviewed",
  privateNotes: "",
  publicationUrl: null,
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  draft: null,
  evidence: [
    {
      articleId: "article-one",
      title: "Financial table extraction",
      url: "https://example.com/tool",
      source: "Official blog",
      publishedAt: null,
      claim: "",
      limitations: "",
      kind: "official_claim",
      checked: false,
      available: true,
      revision: 1,
    },
  ],
};
const api = fakeApi(async (url, res, req) => {
  if (
    url.pathname === "/api/admin/page-access" ||
    url.pathname === "/api/admin/me"
  ) {
    if (!signedIn) {
      res.statusCode = 401;
      return {};
    }
    return { name: "Editor", csrf: "fixture-csrf", dev: false };
  }
  if (url.pathname === "/api/admin/content")
    return {
      rows: [
        { id: "article-one", title: topic.title, source: "Official blog" },
      ],
    };
  if (!url.pathname.startsWith("/api/admin/editorial/")) return;
  if (!signedIn) {
    res.statusCode = 401;
    return {};
  }
  if (req.method === "GET") {
    if (url.pathname.endsWith("/export")) {
      res.setHeader("Content-Type", "text/markdown");
      res.end("# Safe draft");
      return;
    }
    if (url.pathname.endsWith("/topics"))
      return { rows: [topic], nextCursor: null };
    return topic;
  }
  assert.equal(req.headers["x-csrf-token"], "fixture-csrf");
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c);
  if (delaySave) {
    delaySave = false;
    await new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
  }
  const body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
  if (req.method === "POST" && url.pathname.endsWith("/topics")) return topic;
  if (stale) {
    res.statusCode = 409;
    return { detail: "Topic changed. Reload before saving." };
  }
  if (url.pathname.endsWith("/evidence"))
    topic.evidence = [{ ...topic.evidence[0], ...body.evidence }];
  else if (url.pathname.endsWith("/verify")) {
    if (!topic.draft || topic.draft.verificationQuestions.length) {
      res.statusCode = 409;
      return { detail: "Resolve verification questions before review." };
    }
    topic.reviewStatus = "verified";
  } else if (url.pathname.endsWith("/draft"))
    topic.draft = body.draft ?? {
      angle: topic.title,
      factualSummary: topic.evidence[0].claim,
      audienceImpact: "",
      verificationQuestions: ["Check accuracy"],
      references: [],
    };
  else {
    const { expectedVersion, ...patch } = body;
    Object.assign(topic, patch);
  }
  topic = { ...topic, version: topic.version + 1 };
  return topic;
});
before(async () => {
  web = await startWebServer(api);
  browser = await chromium.launch({ headless: true });
});
after(async () => {
  await browser?.close();
  await web?.stop();
});
test("editor imports, edits evidence and draft, handles conflict, reviews and exports", async () => {
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();
  try {
    await visit(page, web.origin + "/admin/editorial");
    await expect(
      page.getByRole("heading", { name: "Editorial workbench" }),
    ).toBeVisible();
    await page.getByLabel("Search source material").fill("table");
    await page
      .getByRole("button", { name: "Search", exact: true })
      .first()
      .click();
    await page.getByRole("button", { name: "Import topic" }).click();
    await expect(page.getByLabel("Private notes")).toBeVisible();
    await page.getByLabel("Private notes").fill("PRIVATE_TEST_NOTE");
    delaySave = true;
    await page.getByRole("button", { name: "Save topic", exact: true }).click();
    await expect(page.getByLabel("Private notes")).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Verify review" }),
    ).toBeDisabled();
    releaseSave();
    await expect(page.getByRole("status")).toHaveText("Saved");
    await page.getByLabel("Claim").fill("Extracts tables");
    await page.getByLabel("Limitations").fill("Vendor claim");
    await page.getByLabel("Source checked").check();
    await page.getByRole("button", { name: "Save evidence" }).click();
    await page.getByRole("button", { name: "Prepare draft" }).click();
    await expect(page.getByLabel("Factual summary")).toHaveValue(
      "Extracts tables",
    );
    await page.getByLabel("Audience impact").fill("Less manual entry");
    await page.getByRole("button", { name: "Save draft" }).click();
    await page.getByRole("button", { name: "Verify review" }).click();
    await expect(page.getByRole("alert")).toContainText("questions");
    await page.getByLabel("Verification questions").fill("");
    await page.getByRole("button", { name: "Save draft" }).click();
    await page.getByRole("button", { name: "Verify review" }).click();
    await expect(page.getByTestId("review-status")).toHaveText("Verified");
    stale = true;
    await page.getByLabel("Private notes").fill("KEEP UNSAVED");
    await page.getByRole("button", { name: "Save topic", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("changed");
    await expect(page.getByLabel("Private notes")).toHaveValue("KEEP UNSAVED");
    stale = false;
    await page.getByLabel("Language").selectOption("zh-CN");
    await expect(page.getByRole("heading", { name: "选题详情" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "选题详情" })).toBeVisible();
    await page.getByLabel("语言").selectOption("en");
    const download = page.waitForEvent("download");
    await page.getByRole("link", { name: "Export Markdown" }).click();
    await download;
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
    );
  } finally {
    stale = false;
    await context.close();
  }
});
test("anonymous editor pages do not reveal records", async () => {
  signedIn = false;
  try {
    const response = await fetch(web.origin + "/admin/editorial");
    assert.equal(response.status, 404);
    assert.equal((await response.text()).includes("PRIVATE_TEST_NOTE"), false);
  } finally {
    signedIn = true;
  }
});
