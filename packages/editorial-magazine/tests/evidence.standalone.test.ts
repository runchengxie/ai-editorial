import{test}from'node:test';import assert from'node:assert/strict';import{MockAgent,getGlobalDispatcher,setGlobalDispatcher}from'undici';
import{config}from'@aihot/backend/config';import{collectPacket}from'../backend/evidence.ts';
test('release evidence uses original publication, filters prereleases and needs no page extraction or paid provider',async()=>{
 const previous=getGlobalDispatcher(),privateFetch=config.allowPrivateNetworkFetch;const agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);config.allowPrivateNetworkFetch=true;
 const body='The tool now supports CSV and document parsing for financial data workflows. This is a public release note with enough detail for a short sourced update. Access conditions and limitations remain unchanged.';
 agent.get('https://api.github.com').intercept({path:'/repos/example/tool/releases?per_page=20'}).reply(200,JSON.stringify([{id:1,name:'Financial data tool release',html_url:'https://github.com/example/tool/releases/tag/v1',body,published_at:'2026-11-17T10:00:00Z',updated_at:'2026-11-18T00:00:00Z',prerelease:false},{id:2,name:'Preview release',html_url:'https://github.com/example/tool/releases/tag/v2',body,published_at:'2026-11-17T11:00:00Z',prerelease:true}]),{headers:{'content-type':'application/json'}});
 let report:import('../backend/evidence.ts').CollectionReport|undefined;
 try{const packet=await collectPacket('daily',{sources:[{id:'release',name:'Tool releases',kind:'json_list',tier:'T1',config:{url:'https://api.github.com/repos/example/tool/releases?per_page=20',mode:'json_api',titlePaths:['name'],summaryPaths:['body'],summaryIsBody:true,urlTemplate:'{raw:html_url}',publishedAtPath:'published_at',requireBoolean:{path:'prerelease',equals:false}}}]},new Date('2026-11-18T00:27:00Z'),{onReport:r=>{report=r;}});assert.equal(packet.evidence.length,1);assert.equal(report?.allowedSources,1);assert.equal(report?.sources[0].listed,1);assert.equal(report?.sources[0].admitted,1);assert.equal(report?.stages.found,1);assert.equal(report?.stages.usable,1);assert.equal(report?.stages.bodyReadAttempts,0);assert.equal(report?.selection?.selected,1);assert.equal(packet.evidence[0].publishedAt,'2026-11-17T10:00:00.000Z');assert.equal(packet.evidence[0].level,'article');assert.equal(packet.evidence[0].audience,'development');}
 finally{config.allowPrivateNetworkFetch=privateFetch;setGlobalDispatcher(previous);await agent.close();}
});
test('discovery submissions require the linked original publication date and never date old or undated articles as new',async()=>{
 const previous=getGlobalDispatcher(),privateFetch=config.allowPrivateNetworkFetch;const agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);config.allowPrivateNetworkFetch=true;
 const description='A newly shared AI document-processing workflow with enough text to create a short evidence item. The source provides a concrete change and its constraints for researchers working with reports.';
 const items=['fresh','old','undated','stale-listing','future-listing'].map(id=>`<item><title>AI workflow ${id}</title><link>https://original.example/${id}</link><guid>https://news.ycombinator.com/item?id=${id}</guid><pubDate>${id==='stale-listing'?'Sun, 01 Nov 2026 12:00:00 GMT':id==='future-listing'?'Sun, 22 Nov 2026 12:00:00 GMT':'Sun, 15 Nov 2026 12:00:00 GMT'}</pubDate><description>${description}</description></item>`).join('');
 agent.get('https://hnrss.org').intercept({path:'/newest'}).reply(200,`<rss version="2.0"><channel>${items}</channel></rss>`,{headers:{'content-type':'application/rss+xml'}});
 for(const [id,date]of [['fresh','2026-11-14T10:00:00Z'],['old','2020-01-01T10:00:00Z'],['undated',null],['stale-listing','2026-11-13T10:00:00Z'],['future-listing','2026-11-12T10:00:00Z']]){
  const meta=date?`<meta property="article:published_time" content="${date}">`:'';
  agent.get('https://original.example').intercept({path:'/'+id}).reply(200,`<html><head><title>AI data workflow</title>${meta}</head><body><article><h1>AI data workflow</h1>${Array.from({length:6},()=>'<p>'+description+'</p>').join('')}</article></body></html>`,{headers:{'content-type':'text/html'}});
 }
 const checks:any[]=[];
 try{const packet=await collectPacket('weekly',{sources:[{id:'rss-hackernews-ai',name:'HN original articles',kind:'rss',tier:'T2',config:{feedUrl:'https://hnrss.org/newest',detail:{publishedAtAuthoritative:true,maxFetches:5}}}]},new Date('2026-11-18T00:27:00Z'),{onDiscovery:c=>checks.push(c)});
  assert.equal(packet.evidence.length,3);assert.ok(packet.evidence.some(e=>e.url.endsWith('/stale-listing')));assert.ok(packet.evidence.some(e=>e.url.endsWith('/future-listing')));assert.equal(packet.evidence[0].url,'https://original.example/fresh');assert.equal(packet.evidence[0].publishedAt,'2026-11-14T10:00:00.000Z');assert.equal(checks.length,5);assert.ok(checks.some(c=>c.status==='outside_window'));assert.ok(checks.some(c=>c.status==='unverified'));
 }finally{config.allowPrivateNetworkFetch=privateFetch;setGlobalDispatcher(previous);await agent.close();}
});
test('arXiv keeps original published dates and abstract evidence without reading PDFs or treating revisions as new papers',async()=>{
 const previous=getGlobalDispatcher(),privateFetch=config.allowPrivateNetworkFetch;const agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);config.allowPrivateNetworkFetch=true;let pageReads=0;
 const abstract='The authors study a language model workflow for financial document extraction and compare it with a defined baseline. The abstract describes research results and does not establish independent replication, peer review or production readiness.';
 const entry=(id:string,published:string)=>`<entry><title>Financial document language model ${id}</title><id>https://arxiv.org/abs/${id}</id><link href="https://arxiv.org/abs/${id}"/><published>${published}</published><updated>2026-11-17T10:00:00Z</updated><summary>${abstract}</summary></entry>`;
 agent.get('https://export.arxiv.org').intercept({path:'/api/query'}).reply(200,`<feed xmlns="http://www.w3.org/2005/Atom">${entry('2611.10001','2026-11-12T10:00:00Z')}${entry('1901.10001','2019-01-01T10:00:00Z')}</feed>`,{headers:{'content-type':'application/atom+xml'}});
 agent.get('https://arxiv.org').intercept({path:'/abs/2611.10001'}).reply(()=>{pageReads++;return {statusCode:200,data:'unused'};});
 try{const packet=await collectPacket('weekly',{sources:[{id:'rss-arxiv-targeted',name:'arXiv abstracts',kind:'rss',tier:'T2',config:{feedUrl:'https://export.arxiv.org/api/query',summaryIsBody:true}}]},new Date('2026-11-18T00:27:00Z'));assert.equal(packet.evidence.length,1);assert.equal(packet.evidence[0].publishedAt,'2026-11-12T10:00:00.000Z');assert.equal(packet.evidence[0].level,'feed');assert.equal(pageReads,0);}finally{config.allowPrivateNetworkFetch=privateFetch;setGlobalDispatcher(previous);await agent.close();}
});


test('source-health failure still emits diagnostics without leaking fetch errors',async()=>{
 const previous=getGlobalDispatcher(),agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);
 let report:import('../backend/evidence.ts').CollectionReport|undefined;
 try{
  await assert.rejects(collectPacket('daily',{sources:[{id:'unavailable',name:'Unavailable feed',enabled:true,kind:'rss',tier:'T2',config:{feedUrl:'https://unavailable.example/feed'}}]},new Date('2026-11-18T00:27:00Z'),{onReport:r=>{report=r;}}),/Insufficient source health/);
  assert.equal(report?.sources[0].status,'unavailable');assert.equal(report?.sources[0].listed,0);assert.equal(report?.stages.usable,0);
  assert.ok(!JSON.stringify(report).includes('UND_MOCK'));
 }finally{setGlobalDispatcher(previous);await agent.close();}
});

test('unavailable body extraction is counted while sufficient feed evidence survives',async()=>{
 const previous=getGlobalDispatcher(),privateFetch=config.allowPrivateNetworkFetch,agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);config.allowPrivateNetworkFetch=true;
 const excerpt='AI document analysis now supports an explicit research workflow. The feed provides sufficient source material to retain a short update, although the linked original article is temporarily unavailable.';
 agent.get('https://feed.example').intercept({path:'/rss'}).reply(200,`<rss version="2.0"><channel><item><title>AI document analysis workflow</title><link>https://article.example/unavailable</link><pubDate>Tue, 17 Nov 2026 10:00:00 GMT</pubDate><description>${excerpt}</description></item></channel></rss>`,{headers:{'content-type':'application/rss+xml'}});
 agent.get('https://article.example').intercept({path:'/unavailable'}).reply(404,'Not found',{headers:{'content-type':'text/html'}});
 let report:import('../backend/evidence.ts').CollectionReport|undefined;
 try{
  const packet=await collectPacket('daily',{sources:[{id:'feed-fallback',name:'Feed fallback',kind:'rss',tier:'T2',config:{feedUrl:'https://feed.example/rss'}}]},new Date('2026-11-18T00:27:00Z'),{onReport:r=>{report=r;}});
  assert.equal(packet.evidence.length,1);assert.equal(packet.evidence[0].level,'feed');assert.equal(report?.stages.bodyReadAttempts,1);assert.equal(report?.stages.bodyReadFailures,1);
 }finally{config.allowPrivateNetworkFetch=privateFetch;setGlobalDispatcher(previous);await agent.close();}
});
