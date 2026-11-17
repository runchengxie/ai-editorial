import '../../../tests/setup.ts';import {after,test} from 'node:test';import assert from 'node:assert/strict';
import {sql,closeDb} from '@aihot/backend/db';import {codexJson} from '../backend/codex.ts';
import {sampleDraft} from './fixtures.ts';
after(closeDb);
test('requires explicit quota budget and reuses received output without another CLI call',async()=>{
 await sql`DELETE FROM budgets WHERE service='codex-cli'`;let calls=0;
 const launch=async()=>{calls++;return {data:sampleDraft(),usage:{input_tokens:12}};};
 await assert.rejects(codexJson('budget-test','packet-one',launch),/budget/);assert.equal(calls,0);
 await sql`INSERT INTO budgets(service,per_minute,per_hour,per_day) VALUES('codex-cli',10,10,10)`;
 const a=await codexJson('budget-test','packet-one',launch);const b=await codexJson('budget-test','packet-one',launch);
 assert.equal(a.receiptId,b.receiptId);assert.equal(calls,1);assert.equal(b.reused,true);
});
test('an uncertain outcome is not immediately sent again',async()=>{
 let calls=0;const launch=async()=>{calls++;throw new Error('uncertain command outcome');};
 await assert.rejects(codexJson('unknown-test','packet-two',launch));
 await assert.rejects(codexJson('unknown-test','packet-two',launch),/unknown/i);await assert.rejects(codexJson('unknown-test','changed-packet',launch),/unknown/i);assert.equal(calls,1);
});
test('a pending call from a killed worker blocks changed-input calls for the same issue',async()=>{
 let calls=0;const launch=async()=>{calls++;return {data:sampleDraft(),usage:null};};
 const first=await codexJson('pending-test','old-input',launch);
 await sql`UPDATE receipts SET status='pending',response=NULL WHERE id=${first.receiptId}`;
 await assert.rejects(codexJson('pending-test','new-input',launch),/pending|unknown/i);assert.equal(calls,1);
});
