import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectEdition, restoreEditions } from '../../packages/backend/src/publication/daily.ts';
const now = new Date('2026-11-17T00:17:00Z');
const entry = (url='https://example.org/a', title='Python financial data tools', date='2026-11-16T10:00:00Z') => ({url,title,publishedAt:new Date(date), privateNotes:'NEVER EXPORT',excerpt:'COPYRIGHT BODY'});
const result = (id='one', entries=[entry()]) => ({sourceId:id,sourceName:id,tier:'T1',ok:true,candidates:entries});
test('exports only public title/link metadata; excludes invalid dates, dangerous URLs and duplicates', () => {
 const edition=selectEdition([result('one',[entry(),entry('https://example.org/a?utm_source=x'),entry('javascript:alert(1)'),entry('https://example.org/old','old','2025-01-01'),entry('https://example.org/future','future','2027-01-01')])],now);
 assert.equal(edition.items.length,1);assert.equal(edition.items[0].audience,'finance');
 assert.doesNotMatch(JSON.stringify(edition),/NEVER EXPORT|COPYRIGHT BODY|privateNotes|excerpt/);
});
test('health and empty content failures stop publication',()=>{
 assert.throws(()=>selectEdition([result(),{...result('two'),ok:false},{...result('three'),ok:false}],now),/health/);
 assert.throws(()=>selectEdition([result('one',[])],now),/eligible/);
});
test('source diversity, maximum eight and stable output',()=>{
 const rows=Array.from({length:6},(_,i)=>result(String(i),Array.from({length:5},(_,j)=>entry(`https://example.org/${i}/${j}`))));
 const a=selectEdition(rows,now);assert.equal(a.items.length,8);
 for(const row of rows)assert.ok(a.items.filter(i=>i.sourceId===row.sourceId).length<=2);
 assert.deepEqual(a,selectEdition(rows,now));
});
test('archive restore strips fields and refuses corrupt/unsafe state',()=>{
 const e=selectEdition([result()],now);
 const restored=restoreEditions([{...e,privateNotes:'secret',items:e.items.map(i=>({...i,privateNotes:'secret'}))}],now);
 assert.equal(restored.length,1);assert.ok(!JSON.stringify(restored).includes('secret'));
 assert.throws(()=>restoreEditions([{...e,items:[{...e.items[0],url:'javascript:alert(1)'}]}],now),/archive/);
 assert.throws(()=>restoreEditions([{...e,date:'../../evil'}],now),/archive/);
 assert.deepEqual(restoreEditions([{...e,date:'2026-01-01',generatedAt:'2026-01-01T00:00:00Z'}],now),[]);
});
test('free listing mode accepts default HTML and rejects paid reader paths',async()=>{
 const {freeWebListing}=await import('./sources.ts');
 assert.equal(freeWebListing({url:'https://www.anthropic.com/news'}),true);
 assert.equal(freeWebListing({url:'https://example.org',fetchVia:'jina'}),false);
});
test('data-center energy and legal stories are not labeled development tools',()=>{
 for(const title of ['US data centers burn electricity','California AG sues OpenAI over rogue agent incidents','AI Day brings together developer communities']){
  const e=selectEdition([result('one',[entry('https://example.org/a',title)])],now);assert.equal(e.items[0].audience,'general');
 }
 assert.equal(selectEdition([result('one',[entry('https://example.org/a','Python data analysis with DuckDB')])],now).items[0].audience,'development');
});
test('restored publication dates cannot inject HTML attributes',()=>{
 const e=selectEdition([result()],now);
 assert.throws(()=>restoreEditions([{...e,items:[{...e.items[0],publishedAt:'2026-11-16("><svg/onload=1>)'}]}],now),/archive/);
});
