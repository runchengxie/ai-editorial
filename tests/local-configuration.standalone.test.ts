import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseEnv } from 'node:util';

test('local configuration starts with external actions disabled and refuses to overwrite secrets', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'ai-editorial-config-'));
  const script = path.resolve(import.meta.dirname, '../scripts/init-env.ts');
  try {
    execFileSync(process.execPath, [script], { cwd: directory, stdio: 'pipe' });
    const file = path.join(directory, '.env');
    const original = readFileSync(file, 'utf8');
    const values = parseEnv(original);
    assert.equal(values.COLLECT_ENABLED, 'false');
    assert.equal(values.MODEL_CALLS_ENABLED, 'false');
    assert.ok(!('POSTGRES_PASSWORD' in values));
    assert.ok((values.ADMIN_PASSWORD?.length ?? 0) >= 12);
    assert.ok((values.SESSION_SECRET?.length ?? 0) >= 32);
    assert.ok((values.IMG_PROXY_SIGN_SECRET?.length ?? 0) >= 32);
    if (process.platform !== 'win32') assert.equal(statSync(file).mode & 0o777, 0o600);
    assert.throws(() => execFileSync(process.execPath, [script], { cwd: directory, stdio: 'pipe' }));
    assert.equal(readFileSync(file, 'utf8'), original);
  } finally {
    rmSync(directory, { recursive: true });
  }
});
