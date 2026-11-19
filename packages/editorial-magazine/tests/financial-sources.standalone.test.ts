import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sourceAudience,sourceRelevant,type ListingCandidate} from '../backend/selection.ts';

function row(id:string,title:string,excerpt=''):ListingCandidate{
 return {source:{id,name:id,tier:'T1',kind:'rss',config:{}},c:{title,excerpt,url:'https://example.org/article',publishedAt:new Date('2026-11-18T11:55:40Z')}};
}
test('structured disclosure and earnings-call workflows enter finance coverage',()=>{
 for(const title of ['Staff Guidance on Inline XBRL Viewer Rendering Issues','EDGAR document processing with Python','LLM analysis of earnings-call transcripts','FASB proposes GAAP taxonomy changes']){
  assert.equal(sourceAudience(row('rss-sec-structured-disclosure',title)),'finance',title);
 }
});
test('XBRL news requires a workflow signal and retains the corporate-disclosure evidence',()=>{
 assert.equal(sourceRelevant(row('rss-xbrl-international','Ninth Circuit splits California climate disclosure laws')),false);
 const material=row('rss-xbrl-international','SEC asks how machines read the market','What do machines need from XBRL filing and structured financial disclosure?');
 assert.equal(sourceRelevant(material),true);
 assert.equal(sourceAudience(material),'finance');
 assert.equal(sourceAudience(row('rss-xbrl-international','A financial data center lawsuit')),'general');
});
