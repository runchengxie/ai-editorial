import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
test('producer publishes the existing JSON contract and redirects without reader assets',async()=>{
 const out=await mkdtemp(path.join(tmpdir(),'daily-data-output-'));
 try {
  execFileSync(process.execPath,['scripts/daily-brief/build.ts','--fixture','--out',out]);
  const editions=JSON.parse(await readFile(path.join(out,'editions.json'),'utf8'));
  assert.equal(editions.length,1);assert.equal(editions[0].items.length,1);
  const index=await readFile(path.join(out,'index.html'),'utf8');
  assert.match(index,/https:\/\/runchengxie.github.io\/ai-editorial-pages\//);
  assert.match(index,/http-equiv="refresh"/);
  assert.ok(!(await readdir(out)).some(name=>/\.css$|\.js$/.test(name)));
  execFileSync(process.execPath,['scripts/daily-brief/build.ts','--fixture','--out',out,'--state',path.join(out,'editions.json')]);
  assert.equal(JSON.parse(await readFile(path.join(out,'editions.json'),'utf8')).length,1);
 }finally{await rm(out,{recursive:true});}
});
