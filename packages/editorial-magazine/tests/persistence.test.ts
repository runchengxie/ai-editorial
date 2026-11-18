import '../../../tests/setup.ts';import{test,after}from'node:test';import assert from'node:assert/strict';import{mkdtemp,writeFile,rm}from'node:fs/promises';import{tmpdir}from'node:os';import path from'node:path';
import{sql,closeDb}from'@aihot/backend/db';import{codexJson}from'../backend/codex.ts';import{commitIssueResponse}from'../backend/run.ts';import{sampleDraft,samplePacket}from'./fixtures.ts';after(closeDb);
test('persistence failure preserves a received answer for quota-free recovery',async()=>{
 await sql`INSERT INTO budgets(service,per_minute,per_hour,per_day)VALUES('codex-cli',10,10,10)ON CONFLICT(service)DO NOTHING`;
 let calls=0;const launch=async()=>{calls++;return {data:sampleDraft(),usage:null};};
 const result=await codexJson('persistence-test','same-packet',launch),root=await mkdtemp(path.join(tmpdir(),'magazine-persist-'));
 try{const blocker=path.join(root,'not-a-directory');await writeFile(blocker,'x');
  await assert.rejects(commitIssueResponse(result,samplePacket(),path.join(blocker,'library.json')));
  const [row]=await sql`SELECT status FROM receipts WHERE id=${result.receiptId}`;assert.equal(row.status,'received');
  const reused=await codexJson('persistence-test','same-packet',launch);assert.equal(calls,1);assert.equal(reused.reused,true);
  await commitIssueResponse(reused,samplePacket(),path.join(root,'library.json'));
 }finally{await rm(root,{recursive:true});}
});
