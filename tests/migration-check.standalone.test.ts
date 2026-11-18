// A pull request cannot change deployed history or hide an unsafe migration by naming it as history.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { checkMigrations } from "../scripts/check-migrations.ts";

const root = mkdtempSync(path.join(tmpdir(), "migration-git-"));
after(() => rmSync(root, { recursive: true, force: true }));
const write = (file: string, text: string) => {
  const target = path.join(root, file);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, text);
};
const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" });
git("init", "-q");
git("config", "user.email", "test@example.invalid");
git("config", "user.name", "Test");
write("packages/backend/migrations/0001_history.sql", "UPDATE old_table SET done = true;");
git("add", ".");
git("commit", "-qm", "history");

test("unchanged history is accepted, but edits and deletions fail", () => {
  assert.deepEqual(checkMigrations(root, "HEAD"), []);
  write("packages/backend/migrations/0001_history.sql", "SELECT 1;");
  assert.match(checkMigrations(root, "HEAD").join("\n"), /immutable/);
  rmSync(path.join(root, "packages/backend/migrations/0001_history.sql"));
  assert.match(checkMigrations(root, "HEAD").join("\n"), /immutable/);
  git("restore", ".");
});

test("new module migrations are checked even when untracked or named below the cutoff", () => {
  const file = "packages/example/migrations/0002_hidden.sql";
  write(file, "CREATE TABLE example (id int);");
  assert.match(checkMigrations(root, "HEAD").join("\n"), /0055/);
  rmSync(path.join(root, file));
  write("packages/example/migrations/0055_unsafe.sql", "UPDATE old_table SET done = false;");
  assert.match(checkMigrations(root, "HEAD").join("\n"), /0055_unsafe/);
  rmSync(path.join(root, "packages/example/migrations/0055_unsafe.sql"));
  write("packages/example/migrations/0055_safe.sql", "CREATE INDEX CONCURRENTLY IF NOT EXISTS example_idx ON example (id);");
  assert.deepEqual(checkMigrations(root, "HEAD"), []);
});


test("layout moves preserve history only at the matching destination with identical SQL", () => {
  const legacy = "database/migrations/0001_history.sql";
  const relocated = "packages/backend/migrations/0001_history.sql";
  // This independent fixture represents a PR whose base still uses the legacy layout.
  const fixture = mkdtempSync(path.join(tmpdir(), "migration-move-"));
  const run = (...args: string[]) => execFileSync("git", args, { cwd: fixture, encoding: "utf8" });
  const put = (file: string, text: string) => {
    mkdirSync(path.dirname(path.join(fixture, file)), { recursive: true });
    writeFileSync(path.join(fixture, file), text);
  };
  try {
    run("init", "-q");
    run("config", "user.email", "test@example.invalid");
    run("config", "user.name", "Test");
    put(legacy, "UPDATE old_table SET done = true;");
    put("modules/example/migrations/0002_module.sql", "UPDATE module_table SET done = true;");
    run("add", "."); run("commit", "-qm", "legacy history");
    rmSync(path.join(fixture, legacy));
    rmSync(path.join(fixture, "modules/example/migrations/0002_module.sql"));
    put(relocated, "UPDATE old_table SET done = true;");
    put("packages/example/migrations/0002_module.sql", "UPDATE module_table SET done = true;");
    assert.deepEqual(checkMigrations(fixture, "HEAD"), []);
    put(relocated, "SELECT 1;");
    assert.match(checkMigrations(fixture, "HEAD").join("\n"), /immutable/);
    rmSync(path.join(fixture, relocated));
    put("packages/other/migrations/0001_history.sql", "UPDATE old_table SET done = true;");
    assert.match(checkMigrations(fixture, "HEAD").join("\n"), /immutable/);
    rmSync(path.join(fixture, "packages/other"), { recursive: true });
    put(relocated, "UPDATE old_table SET done = true;");
    put(legacy, "UPDATE old_table SET done = true;");
    assert.match(checkMigrations(fixture, "HEAD").join("\n"), /two migrations/);
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});


test("new migrations at retired paths are rejected rather than silently omitted", () => {
  for (const file of ["database/migrations/9999_new.sql", "modules/example/migrations/9999_new.sql"]) {
    write(file, "CREATE TABLE example (id int);");
    try { assert.match(checkMigrations(root, "HEAD").join("\n"), /retired migration path/); }
    finally { rmSync(path.join(root, file)); }
  }
});
