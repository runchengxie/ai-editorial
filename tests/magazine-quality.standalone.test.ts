import {test} from 'node:test';import assert from 'node:assert/strict';
import {assessIssue} from '../scripts/magazine/quality.ts';
import {samplePacket,sampleDraft} from '../packages/editorial-magazine/tests/fixtures.ts';
import {projectIssue} from '../packages/editorial-magazine/backend/compose.ts';
test('quality counts references and utility without equating schema checks with editorial review',()=>{
 const packet=samplePacket(),issue=projectIssue(sampleDraft(),packet),report=assessIssue(packet,issue);
 assert.equal(report.features,1);assert.equal(report.sourceArticles,1);assert.equal(report.articleSupportedFeatures,1);assert.equal(report.practicalNotes,0);assert.equal(report.targets.featureTargetMet,false);assert.equal(report.reviewFlags.semanticFactReview,'required');assert.equal(report.published,false);
 issue.briefs.push(issue.stories[0].summary);assert.equal(assessIssue(packet,issue).reviewFlags.sharedLeadEvidence[0].entries,2);
});
test('quality rejects mismatched issues, unknown evidence and changed public source facts',()=>{
 const packet=samplePacket(),issue=projectIssue(sampleDraft(),packet);
 assert.throws(()=>assessIssue({...packet,end:'2026-11-18'},issue),/match/);
 issue.sources[0].title='Changed source title';assert.throws(()=>assessIssue(packet,issue),/differs/);
 issue.sources[0].title=packet.evidence[0].title;issue.title.sourceIds=['missing'];assert.throws(()=>assessIssue(packet,issue),/Unknown/);
});

test('quality rejects changed period, kind and generation lineage even with the same issue ID',()=>{
 const packet=samplePacket(),issue=projectIssue(sampleDraft(),packet);
 for(const field of ['kind','start','end','coverageStart','coverageEnd','generatedAt'] as const){
  const changed={...issue,[field]:field==='kind'?'weekly':field.includes('At')||field.startsWith('coverage')?'2026-11-18T00:27:00.000Z':'2026-11-18'};
  assert.throws(()=>assessIssue(packet,changed),/match/,field);
 }
});
