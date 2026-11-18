import{test}from'node:test';import assert from'node:assert/strict';import{MockAgent,getGlobalDispatcher,setGlobalDispatcher}from'undici';
import{config}from'@aihot/backend/config';import{collectPacket}from'../backend/evidence.ts';
test('release evidence uses original publication, filters prereleases and needs no page extraction or paid provider',async()=>{
 const previous=getGlobalDispatcher(),privateFetch=config.allowPrivateNetworkFetch;const agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);config.allowPrivateNetworkFetch=true;
 const body='The tool now supports CSV and document parsing for financial data workflows. This is a public release note with enough detail for a short sourced update. Access conditions and limitations remain unchanged.';
 agent.get('https://api.github.com').intercept({path:'/repos/example/tool/releases?per_page=20'}).reply(200,JSON.stringify([{id:1,name:'Financial data tool release',html_url:'https://github.com/example/tool/releases/tag/v1',body,published_at:'2026-11-17T10:00:00Z',updated_at:'2026-11-18T00:00:00Z',prerelease:false},{id:2,name:'Preview release',html_url:'https://github.com/example/tool/releases/tag/v2',body,published_at:'2026-11-17T11:00:00Z',prerelease:true}]),{headers:{'content-type':'application/json'}});
 try{const packet=await collectPacket('daily',{sources:[{id:'release',name:'Tool releases',kind:'json_list',tier:'T1',config:{url:'https://api.github.com/repos/example/tool/releases?per_page=20',mode:'json_api',titlePaths:['name'],summaryPaths:['body'],summaryIsBody:true,urlTemplate:'{raw:html_url}',publishedAtPath:'published_at',requireBoolean:{path:'prerelease',equals:false}}}]},new Date('2026-11-18T00:27:00Z'));assert.equal(packet.evidence.length,1);assert.equal(packet.evidence[0].publishedAt,'2026-11-17T10:00:00.000Z');assert.equal(packet.evidence[0].level,'article');assert.equal(packet.evidence[0].audience,'development');}
 finally{config.allowPrivateNetworkFetch=privateFetch;setGlobalDispatcher(previous);await agent.close();}
});
test('discovery submissions require the linked original publication date and never date old or undated articles as new',async()=>{
 const previous=getGlobalDispatcher(),privateFetch=config.allowPrivateNetworkFetch;const agent=new MockAgent();agent.disableNetConnect();setGlobalDispatcher(agent);config.allowPrivateNetworkFetch=true;
 const description='A newly shared AI document-processing workflow with enough text to create a short evidence item. The source provides a concrete change and its constraints for researchers working with reports.';
 const items=['fresh','old','undated'].map(id=>`<item><title>AI workflow ${id}</title><link>https://original.example/${id}</link><guid>https://news.ycombinator.com/item?id=${id}</guid><pubDate>Sun, 15 Nov 2026 12:00:00 GMT</pubDate><description>${description}</description></item>`).join('');
 agent.get('https://hnrss.org').intercept({path:'/newest'}).reply(200,`<rss version="2.0"><channel>${items}</channel></rss>`,{headers:{'content-type':'application/rss+xml'}});
 for(const [id,date]of [['fresh','2026-11-14T10:00:00Z'],['old','2020-01-01T10:00:00Z'],['undated',null]]){
  const meta=date?`<meta property="article:published_time" content="${date}">`:'';
  agent.get('https://original.example').intercept({path:'/'+id}).reply(200,`<html><head><title>AI data workflow</title>${meta}</head><body><article><h1>AI data workflow</h1>${Array.from({length:6},()=>'<p>'+description+'</p>').join('')}</article></body></html>`,{headers:{'content-type':'text/html'}});
 }
 const checks:any[]=[];
 try{const packet=await collectPacket('weekly',{sources:[{id:'rss-hackernews-ai',name:'HN original articles',kind:'rss',tier:'T2',config:{feedUrl:'https://hnrss.org/newest',detail:{publishedAtAuthoritative:true,maxFetches:3}}}]},new Date('2026-11-18T00:27:00Z'),{onDiscovery:c=>checks.push(c)});
  assert.equal(packet.evidence.length,1);assert.equal(packet.evidence[0].url,'https://original.example/fresh');assert.equal(packet.evidence[0].publishedAt,'2026-11-14T10:00:00.000Z');assert.equal(checks.length,3);assert.ok(checks.some(c=>c.status==='outside_window'));assert.ok(checks.some(c=>c.status==='unverified'));
 }finally{config.allowPrivateNetworkFetch=privateFetch;setGlobalDispatcher(previous);await agent.close();}
});
