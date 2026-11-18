import {beijingDate,beijingMidnight,addDays,isoWeekLabel,isoWeekRange,isValidDate} from '@aihot/contracts/time';
import {draftSchema,type Draft,type Packet,type Issue,type Block,type Library} from '../contracts.ts';
export function periodFor(kind:Packet['kind'],now:Date){
 const today=beijingDate(now);
 if(kind==='daily')return {start:addDays(today,-1),end:today,coverageStart:new Date(now.getTime()-86400000).toISOString(),coverageEnd:now.toISOString()};
 const range=isoWeekRange(isoWeekLabel(addDays(today,-7)))!;
 return {start:range.start,end:range.end,coverageStart:beijingMidnight(range.start).toISOString(),coverageEnd:beijingMidnight(addDays(range.end,1)).toISOString()};
}
const normalized=(s:string)=>s.replace(/\s+/g,' ').trim();
const numbers=(s:string)=>(s.replace(/(\d+(?:[.,]\d+)*)\s*(?:percent|per cent)\b/gi,'$1%').replace(/(\d+(?:[.,]\d+)*)\s*[–—-]\s*(\d+(?:[.,]\d+)*)([%％])/g,'$1$3 $2$3').match(/\d+(?:[.,]\d+)*(?:\s*(?:(?:thousand|million|billion|trillion)\b|万|亿|千|百))?(?:\s*[%％])?/gi)??[]).map(value=>{
 const version=value.match(/^\d+(?:\.\d+){2,}$/);if(version)return 'version:'+version[0];
 const n=value.replace(/,/g,'').match(/^(\d+(?:\.\d+)?)(.*)$/)!;
 const suffix=n[2].trim().toLowerCase(),scale=/trillion/.test(suffix)?1e12:/billion/.test(suffix)?1e9:/million/.test(suffix)?1e6:/thousand/.test(suffix)?1e3:/亿/.test(suffix)?1e8:/万/.test(suffix)?1e4:/千/.test(suffix)?1e3:/百/.test(suffix)?100:1;
 return String(Number(n[1])*scale)+(/[%％]/.test(suffix)?'%':'');
});
export function projectIssue(input:unknown,packet:Packet):Issue{
 const draft:Draft=draftSchema.parse(input),lookup=new Map(packet.evidence.map(e=>[e.id,e]));
 function block(raw:Draft['title']):Block{
  const quotes=raw.anchors.map(a=>{const e=lookup.get(a.id);if(!e||!normalized(e.text+' '+e.title+' '+e.publishedAt).includes(normalized(a.quote)))throw new Error('Unmatched evidence anchor');return a.quote;});
  const cited=raw.anchors.map(a=>lookup.get(a.id)!);
  const identifiers=(raw.en+' '+raw.zh).match(/[A-Za-z][A-Za-z0-9]*(?:[-.][A-Za-z0-9]+)*/g)?.filter(term=>/\d/.test(term)&&term.length<=100&&cited.some(e=>e.text.includes(term)||e.title.includes(term)))??[];
  const supported=new Set(numbers(quotes.join(' ')+' '+cited.map(e=>e.title).join(' ')+' '+identifiers.join(' ')));
  for(const n of numbers(raw.en+' '+raw.zh))if(!supported.has(n))throw new Error(`Unsupported number ${n} in generated text`);
  if(/sk-[A-Za-z0-9_-]{20,}|AKIA[A-Z0-9]{16}|BEGIN.{0,20}PRIVATE KEY/.test(raw.en+' '+raw.zh))throw new Error('Unsafe credential-like evidence output');
  return {en:raw.en,zh:raw.zh,sourceIds:[...new Set(raw.anchors.map(a=>a.id))]};
 }
 const stories=draft.stories.map((s,i)=>{
  const summary=block(s.summary),source=lookup.get(summary.sourceIds[0])!;
  return {id:`story-${i+1}`,audience:source.audience,headline:block({...s.headline,en:s.headline.en.replace(/^\s*\d{1,2}(?:[.)．]\s+|、\s*)/,''),zh:s.headline.zh.replace(/^\s*\d{1,2}(?:[.)．]\s+|、\s*)/,'')}),summary,paragraphs:s.paragraphs.map(block),related:s.related.map(block),practicalNote:s.practicalNote?block(s.practicalNote):null};
 });
 const order={finance:0,development:1,general:2};stories.sort((a,b)=>order[a.audience]-order[b.audience]);stories.forEach((story,index)=>{story.id=`story-${index+1}`;});
 const outlook=draft.outlook.map(o=>{
  const text=block(o.text);
  if(!isValidDate(o.date)||o.date<=beijingDate(packet.generatedAt)||o.date>addDays(packet.end,365)||!o.text.anchors.some(a=>a.quote.includes(o.date)))throw new Error('Unsupported outlook date');
  return {date:o.date,text};
 });
 const title=block(draft.title),lead=block(draft.lead),briefs=draft.briefs.map(block);const used=new Set([title,lead,...briefs,...outlook.map(o=>o.text),...stories.flatMap(s=>[s.headline,s.summary,...s.paragraphs,...s.related,...(s.practicalNote?[s.practicalNote]:[])])].flatMap(b=>b.sourceIds));
 return {id:`${packet.kind}-${packet.end}`,kind:packet.kind,generatedAt:packet.generatedAt,start:packet.start,end:packet.end,coverageStart:packet.coverageStart,coverageEnd:packet.coverageEnd,
  title,lead,stories,briefs,outlook,
  sources:packet.evidence.filter(e=>used.has(e.id)).map(({text:_,...source})=>source)};
}
export function mergeLibrary(library:Library,issue:Issue):Library{
 const all=[issue,...library.issues.filter(i=>i.id!==issue.id)].sort((a,b)=>b.end.localeCompare(a.end)||a.kind.localeCompare(b.kind));
 return {schemaVersion:2,issues:all.filter((i,index)=>all.slice(0,index+1).filter(j=>j.kind===i.kind).length<=(i.kind==='daily'?30:12))};
}
