import{test}from'node:test';import assert from'node:assert/strict';
import{selectCandidates,sourceAllowed,evidenceTextLimit,sourceAudience}from'../backend/selection.ts';
import type{ListingCandidate}from'../backend/selection.ts';
const entry=(i:number,group='development'):ListingCandidate=>({source:{id:`s-${Math.floor(i/2)}`,name:group==='finance'?'Financial tools':'Developer tools',tier:'T1',kind:'rss',config:{}},c:{title:`${group==='finance'?'Financial':group==='general'?'Model news':'Python API'} product announcement ${i}`,url:`https://source${Math.floor(i/2)}.example/item/${i}`,publishedAt:new Date('2026-11-17T10:00:00Z')}});
test('fills larger windows with source diversity and retains general/model coverage',()=>{
 const rows=Array.from({length:120},(_,i)=>entry(i,i<12?'finance':i<100?'development':'general'));
 const daily=selectCandidates(rows,'daily'),weekly=selectCandidates(rows,'weekly');assert.equal(daily.length,30);assert.equal(weekly.length,60);
 assert.ok(daily.some(x=>x.c.title.startsWith('Model news')));assert.ok(daily.some(x=>x.c.title.startsWith('Financial')));
 for(const row of daily)assert.ok(daily.filter(x=>x.source.id===row.source.id).length<=2);
 assert.deepEqual(daily,selectCandidates(rows,'daily'));assert.ok(evidenceTextLimit('weekly',0)>evidenceTextLimit('weekly',40));
});
test('deduplicates canonical URLs and repeated event titles without merging unrelated version-only releases',()=>{
 const a=entry(0),b=entry(2);b.c.title=a.c.title='A substantial shared announcement about a new AI model';b.c.url=a.c.url+'?utm_source=test';
 const c=entry(4),d=entry(6);c.c.title=d.c.title='v1.2.3';
 assert.equal(selectCandidates([a,b,c,d],'daily').length,3);
});
test('free listing admission allows only direct RSS/HTML/GET JSON and broad feeds require AI/data relevance',()=>{
 assert.equal(sourceAllowed({kind:'json_list',enabled:true,config:{url:'https://api.github.com/repos/a/b/releases',mode:'json_api'}}),true);
 for(const source of [{kind:'json_list',config:{url:'https://r.jina.ai/https://example.org',mode:'json_api'}},{kind:'web_list',config:{url:'https://example.org',fetchVia:'jina'}},{kind:'json_list',config:{url:'https://example.org',mode:'html_json_key'}},{kind:'rss',enabled:false,config:{feedUrl:'https://example.org/rss'}}])assert.equal(sourceAllowed(source),false);
 const row=entry(0);row.source.id='rss-ithome';row.c.title='A new phone has a brighter display';assert.equal(selectCandidates([row],'daily').length,0);row.c.title='DeepSeek releases an AI model';assert.equal(selectCandidates([row],'daily').length,1);
});
test('independent GitHub organizations remain separate publishers while a shared organization is capped',()=>{
 const rows=Array.from({length:16},(_,i)=>{const r=entry(i);r.source.kind='json_list';r.c.title='v1.2.3';r.c.url=`https://github.com/org${Math.floor(i/2)}/tool/releases/tag/v${i}`;return r;});
 assert.equal(selectCandidates(rows,'daily').length,16);
 const shared=rows.map(r=>({...r,c:{...r.c,url:r.c.url.replace(/\/org\d+\//,'/one/')}}));assert.equal(selectCandidates(shared,'daily').length,4);assert.equal(selectCandidates(shared,'weekly').length,6);
});

test('financial filing tools and explicit research workflows remain discoverable without classifying generic infrastructure as finance',()=>{
 const tool=entry(0);tool.source.id='json-edgartools-releases';tool.source.kind='json_list';tool.c.title='v6.2.0';assert.equal(sourceAudience(tool),'finance');
 const filing=entry(1);filing.c.title='New XBRL workflow for extracting 10-K statements';assert.equal(sourceAudience(filing),'finance');
 const analysis=entry(2);analysis.c.title='AI investment research with source-linked financial tables';assert.equal(sourceAudience(analysis),'finance');
 const generic=entry(3);generic.c.title='Financial companies build a new data center';assert.equal(sourceAudience(generic),'general');
 const factset=entry(4);factset.source.id='rss-factset';factset.c.title='Mercury adds structured data to Generative Search';factset.c.excerpt='Analysts can query financial statements and earnings transcripts with citations.';assert.equal(sourceAudience(factset),'finance');assert.equal(selectCandidates([factset],'daily').length,1);
});
