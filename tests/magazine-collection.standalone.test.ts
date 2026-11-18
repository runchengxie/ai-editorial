import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readdir,readFile,rm} from 'node:fs/promises';import path from 'node:path';import {tmpdir} from 'node:os';
import {MockAgent,getGlobalDispatcher,setGlobalDispatcher} from 'undici';
import {generateIssue} from '../packages/editorial-magazine/backend/run.ts';

test('generation retains failed source-health diagnostics before any model or library write',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'magazine-collection-')),previous=getGlobalDispatcher(),agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);
 try{
  const source=path.join(directory,'sources.json');await writeFile(source,JSON.stringify({sources:[{id:'unavailable',name:'Unavailable',kind:'rss',tier:'T2',config:{feedUrl:'https://unavailable.example/feed'}}]}));
  await assert.rejects(generateIssue('daily',directory,source),/Insufficient source health/);
  const reports=await readdir(path.join(directory,'collection-reports'));assert.equal(reports.length,1);
  const saved=JSON.parse(await readFile(path.join(directory,'collection-reports',reports[0]),'utf8'));assert.equal(saved.report.sources[0].status,'unavailable');assert.ok(saved.recordedAt);
  await assert.rejects(readFile(path.join(directory,'library.json')),/ENOENT/);
 }finally{setGlobalDispatcher(previous);await agent.close();await rm(directory,{recursive:true,force:true});}
});
