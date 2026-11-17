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
 assert.doesNotThrow(()=>projectIssue(draft,packet));draft.stories[0].paragraphs[0].zh='数据集包含2100万条评论。';assert.throws(()=>projectIssue(draft,packet),/number/);
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
