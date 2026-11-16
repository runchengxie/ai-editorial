import assert from "node:assert/strict";
import { test } from "node:test";
import { message } from "../web/locale.ts";
test("editorial messages default to English and fall back when Chinese omits a key", () => {
  assert.equal(message("en", "boardTitle"), "Editorial workbench");
  assert.equal(message("zh-CN", "boardTitle"), "资讯采编工作台");
  assert.equal(message("zh-CN", "productName"), "AI Editorial");
});
