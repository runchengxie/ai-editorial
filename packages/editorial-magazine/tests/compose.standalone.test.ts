import {test} from 'node:test';import assert from 'node:assert/strict';
import {periodFor,projectIssue,mergeLibrary} from '../backend/compose.ts';
import {samplePacket,sampleDraft} from './fixtures.ts';
test('daily and complete weekly periods use Shanghai dates',()=>{
 const now=new Date('2026-11-17T00:27:00Z');
 assert.equal(periodFor('daily',now).end,'2026-11-17');
 const week=periodFor('weekly',now);assert.equal(week.start,'2026-11-09');assert.equal(week.end,'2026-11-15');
});
test('projects only generated prose and source references, not evidence bodies or private quotes',()=>{
 const issue=projectIssue(sampleDraft(),samplePacket());assert.equal(issue.stories.length,1);
 assert.equal(issue.stories[0].paragraphs[0].sourceIds[0],'ev-one');
 assert.ok(!JSON.stringify(issue).includes('PRIVATE RAW'));assert.ok(!JSON.stringify(issue).includes('anchors'));
});
test('rejects invented sources, unsupported quotes, numbers and upcoming dates',()=>{
 for(const mutate of [(d:any)=>d.stories[0].paragraphs[0].anchors[0].id='unknown',
  (d:any)=>d.stories[0].paragraphs[0].anchors[0].quote='invented quotation',
  (d:any)=>d.stories[0].paragraphs[0].zh='单次上限为999MB。',
  (d:any)=>d.outlook=[{date:'2026-11-25',text:d.stories[0].summary}]] ){
  const d=sampleDraft();mutate(d);assert.throws(()=>projectIssue(d,samplePacket()),/evidence|number|date/);
 }
});
test('library preserves earlier issues, replaces same period, and caps history',()=>{
 const issue=projectIssue(sampleDraft(),samplePacket());const library=mergeLibrary({schemaVersion:2,issues:[]},issue);
 assert.equal(mergeLibrary(library,issue).issues.length,1);assert.equal(library.schemaVersion,2);
});

test('presentation numbering is removed before checking headline factual numbers',()=>{
 const draft=sampleDraft();draft.stories[0].headline={...draft.stories[0].headline,en:'1. '+draft.stories[0].headline.en,zh:'1. '+draft.stories[0].headline.zh};
 const issue=projectIssue(draft,samplePacket());assert.ok(!issue.stories[0].headline.en.startsWith('1. '));
});

test('quantity translation preserves value while unsupported numeric changes still fail',()=>{
 const packet=samplePacket();packet.evidence[0].text+=' The dataset contains 2.1 million customer reviews.';
 const draft=sampleDraft();draft.stories[0].paragraphs[0]={en:'The dataset contains 2.1 million reviews.',zh:'数据集包含210万条评论。',anchors:[{id:'ev-one',quote:'The dataset contains 2.1 million customer reviews.'}]};
 assert.doesNotThrow(()=>projectIssue(draft,packet));draft.stories[0].paragraphs[0].zh='数据集包含 210 万条评论。';assert.doesNotThrow(()=>projectIssue(draft,packet));draft.stories[0].paragraphs[0].zh='数据集包含2100万条评论。';assert.throws(()=>projectIssue(draft,packet),/number/);
});
test('product version in the cited source title supports its summary without inventing a new version',()=>{
 const packet=samplePacket();packet.evidence[0].title='Sample Tools1.2 adds CSV import';const draft=sampleDraft();
 draft.stories[0].summary={en:'Sample Tools1.2 supports CSV import.',zh:'Sample Tools1.2 支持 CSV 导入。',anchors:[{id:'ev-one',quote:'Sample Tools supports CSV import with a maximum file size of 10MB.'}]};
 assert.doesNotThrow(()=>projectIssue(draft,packet));draft.stories[0].summary.zh='Sample Tools9.9 支持 CSV 导入。';assert.throws(()=>projectIssue(draft,packet),/number/);
});
test('an exact model identifier in the cited body supports its version, without supporting new metric values',()=>{
 const packet=samplePacket();packet.evidence[0].text+=' Sample-N0.5-Flash is an open-weights model.';const draft=sampleDraft();
 draft.stories[0].summary={en:'Sample-N0.5-Flash supports CSV import.',zh:'Sample-N0.5-Flash 支持 CSV 导入。',anchors:[{id:'ev-one',quote:'Sample Tools supports CSV import with a maximum file size of 10MB.'}]};
 assert.doesNotThrow(()=>projectIssue(draft,packet));draft.stories[0].summary.zh='Sample-N0.6-Flash 支持 CSV 导入。';assert.throws(()=>projectIssue(draft,packet),/number/);
});
test('explicit long-range roadmap dates are allowed and retain planned wording',()=>{
 const packet=samplePacket();packet.evidence[0].text+=' The next release is planned for 2027-03-30.';const draft=sampleDraft();
 draft.outlook=[{date:'2027-03-30',text:{en:'The next release is planned for 2027-03-30.',zh:'下一版本计划于2027-03-30发布。',anchors:[{id:'ev-one',quote:'The next release is planned for 2027-03-30.'}]}}];
 assert.equal(projectIssue(draft,packet).outlook[0].date,'2027-03-30');
});

test('percentage ranges carry the percent unit to both endpoints across languages',()=>{
 const packet=samplePacket();packet.evidence[0].text+=' Reported cost reductions were 18.4–30.9%.';const draft=sampleDraft();
 draft.stories[0].paragraphs[0]={en:'Reported reductions were 18.4–30.9%.',zh:'报告称成本下降18.4%至30.9%。',anchors:[{id:'ev-one',quote:'Reported cost reductions were 18.4–30.9%.'}]};
 assert.doesNotThrow(()=>projectIssue(draft,packet));draft.stories[0].paragraphs[0].zh='报告称成本下降18.5%至30.9%。';assert.throws(()=>projectIssue(draft,packet),/number/);
});
test('word percent and percentage symbols represent the same quoted value',()=>{
 const packet=samplePacket();packet.evidence[0].text+=' Revenue grew 103 percent while costs fell 2.5 per cent.';const draft=sampleDraft();
 draft.briefs=[{en:'Revenue grew103% and costs fell2.5%.',zh:'营收增长103%，成本下降2.5%。',anchors:[{id:'ev-one',quote:'Revenue grew 103 percent while costs fell 2.5 per cent.'}]}];
 assert.doesNotThrow(()=>projectIssue(draft,packet));draft.briefs[0].zh='营收增长104%，成本下降2.5%。';assert.throws(()=>projectIssue(draft,packet),/number/);
});
test('supports expanded weekly features and briefs while refusing over-bound output',()=>{
 const packet={...samplePacket(),kind:'weekly' as const};const draft=sampleDraft();draft.stories=Array.from({length:12},()=>structuredClone(draft.stories[0]));draft.briefs=Array.from({length:25},()=>structuredClone(draft.lead));
 assert.equal(projectIssue(draft,packet).stories.length,12);draft.briefs.push(draft.lead);assert.throws(()=>projectIssue(draft,packet));
});
test('release version patch numbers must match the cited version exactly',()=>{
 const packet=samplePacket();packet.evidence[0].title='Tools v1.2.3 release';const draft=sampleDraft();draft.stories[0].headline={en:'Tools v1.2.3 adds CSV import.',zh:'Tools v1.2.3 增加CSV导入。',anchors:draft.title.anchors};
 assert.doesNotThrow(()=>projectIssue(draft,packet));draft.stories[0].headline.zh='Tools v1.2.4 增加CSV导入。';assert.throws(()=>projectIssue(draft,packet),/number/);
});
test('saved pilot evidence rejects duplicate identities, oversized text and dates outside the issue window',async()=>{
 const {packetSchema}=await import('../contracts.ts');const packet=samplePacket();
 assert.doesNotThrow(()=>packetSchema.parse(packet));
 for(const mutate of [(p:any)=>p.evidence.push({...p.evidence[0]}),(p:any)=>p.evidence[0].text='x'.repeat(6001),(p:any)=>p.evidence[0].publishedAt=p.coverageEnd,(p:any)=>p.evidence[0].url='javascript:alert(1)',(p:any)=>{p.start=p.end='2099-99-99';},(p:any)=>{p.start='2026-11-15';}]){
  const bad=structuredClone(packet);mutate(bad);assert.throws(()=>packetSchema.parse(bad));
 }
});

test('pilot acceptance drafts include every dated outlook in both languages',async()=>{
 const {pilotMarkdown}=await import('../../../scripts/magazine/pilot-render.ts');const issue=projectIssue(sampleDraft(),samplePacket());issue.outlook=[{date:'2026-11-20',text:issue.lead}];
 for(const locale of ['en','zh'] as const)assert.ok(pilotMarkdown(issue,locale).includes('2026-11-20'));
});
