import {test} from 'node:test';import assert from 'node:assert/strict';
import {MockAgent,getGlobalDispatcher,setGlobalDispatcher} from 'undici';
import {extractFromUrl} from '@aihot/backend/content/extract';import {config} from '@aihot/backend/config';import {closeDb} from '@aihot/backend/db';

test('text-only extraction skips cover network and database dependencies',async()=>{
 const old=getGlobalDispatcher(),privateFetch=config.allowPrivateNetworkFetch,agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);config.allowPrivateNetworkFetch=true;
 const text='The financial document processing release describes a concrete workflow for parsing tables and validating reported values. Researchers can retain source references and check missing fields before using an extracted result. ';
 agent.get('https://source.example').intercept({path:'/guidance'}).reply(200,`<html><head><title>Financial document workflow</title><meta property="og:image" content="https://source.example/unique-cover.png"></head><body><article><h1>Financial document workflow</h1>${Array.from({length:6},()=>'<p>'+text+'</p>').join('')}</article></body></html>`,{headers:{'content-type':'text/html'}});
 try{
  const body=await extractFromUrl('https://source.example/guidance','text-only',{}, {paidFallback:false,includeCover:false});
  assert.ok(body);assert.ok(body.text.includes('financial document'));assert.equal(body.cover,null);assert.deepEqual(agent.pendingInterceptors(),[]);
 }finally{config.allowPrivateNetworkFetch=privateFetch;setGlobalDispatcher(old);await agent.close();await closeDb();}
});
