import {beijingDate,beijingMidnight,addDays,isoWeekLabel,isoWeekRange,isValidDate} from '@aihot/contracts/time';
import {draftSchema,type Draft,type Packet,type Issue,type Block,type Library} from '../contracts.ts';
export function periodFor(kind:Packet['kind'],now:Date){
 const today=beijingDate(now);
 if(kind==='daily')return {start:addDays(today,-1),end:today,coverageStart:new Date(now.getTime()-86400000).toISOString(),coverageEnd:now.toISOString()};
 const range=isoWeekRange(isoWeekLabel(addDays(today,-7)))!;
 return {start:range.start,end:range.end,coverageStart:beijingMidnight(range.start).toISOString(),coverageEnd:beijingMidnight(addDays(range.end,1)).toISOString()};
}
const normalized=(s:string)=>s.replace(/\s+/g,' ').trim();
const scalarNumbers=(s:string)=>(s.replace(/(\d+(?:[.,]\d+)*)\s*(?:percent|per cent)\b/gi,'$1%').replace(/(\d+(?:[.,]\d+)*)\s*[–—-]\s*(\d+(?:[.,]\d+)*)([%％])/g,'$1$3 $2$3').match(/\d+(?:[.,]\d+)*(?:\s*(?:(?:thousand|million|billion|trillion)\b|万|亿|千|百))?(?:\s*[%％])?/gi)??[]).map(value=>{
 const version=value.match(/^\d+(?:\.\d+){2,}$/);if(version)return 'version:'+version[0];
 const n=value.replace(/,/g,'').match(/^(\d+(?:\.\d+)?)(.*)$/)!;
 const suffix=n[2].trim().toLowerCase(),scale=/trillion/.test(suffix)?1e12:/billion/.test(suffix)?1e9:/million/.test(suffix)?1e6:/thousand/.test(suffix)?1e3:/亿/.test(suffix)?1e8:/万/.test(suffix)?1e4:/千/.test(suffix)?1e3:/百/.test(suffix)?100:1;
 return String(Number(n[1])*scale)+(/[%％]/.test(suffix)?'%':'');
});
// Keep translated calendar and token quantities typed: a month is not a generic metric.
const months='January February March April May June July August September October November December'.split(' ');
function numbers(text:string):string[]{
 const typed:string[]=[];
 const take=(key:string)=>{typed.push(key);return ' ';};
 const date=(y:string,m:string,d:string)=>`date:${y}-${String(Number(m)).padStart(2,'0')}-${String(Number(d)).padStart(2,'0')}`;
 let rest=text.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g,(_,y,m,d)=>take(date(y,m,d)))
  .replace(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/g,(_,y,m,d)=>take(date(y,m,d)));
 // Bare names need calendar context; modal 'may' (including sentence-start 'May') is not a date.
 const englishMonths=months.join('|');
 rest=rest.replace(new RegExp(`\\b(${englishMonths})\\s+(\\d{4})\\b`,'gi'),(_,m,y)=>take(`month-year:${y}-${months.findIndex(month=>month.toLowerCase()===m.toLowerCase())+1}`))
  .replace(/(\d{4})\s*年\s*(\d{1,2})\s*月(?!\s*\d)/g,(_,y,m)=>take(`month-year:${y}-${Number(m)}`));
 rest=rest.replace(new RegExp(`\\b(${englishMonths})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`,'gi'),(_,m,d,y)=>take(y?date(y,String(months.findIndex(month=>month.toLowerCase()===m.toLowerCase())+1),d):`month-day:${months.findIndex(month=>month.toLowerCase()===m.toLowerCase())+1}-${Number(d)}`))
  .replace(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/g,(_,m,d)=>take(`month-day:${Number(m)}-${Number(d)}`))
  .replace(new RegExp(`\\b(${englishMonths})\\b`,'g'),(m,_,offset,input)=>/\b(?:in|from|through|during|until|by|since|before|after|of)\s+$/i.test(input.slice(0,offset))?take(`month:${months.indexOf(m)+1}`):m)
  .replace(/(\d{1,2})\s*月/g,(_,m)=>take(`month:${Number(m)}`));
 rest=rest.replace(/(\d+(?:[.,]\d+)*)\s*(K|thousand|million|billion|万|亿|千)?\s*(?:tokens?\b|词元|令牌)/gi,(_,n,unit)=>take(`tokens:${scalarNumbers(n+' '+(unit?.toLowerCase()==='k'?'thousand':unit??''))[0]}`));
 const currency=(unit:string)=>({USD:'USD',dollars:'USD',dollar:'USD','美元':'USD','$':'USD',EUR:'EUR',euros:'EUR',euro:'EUR','欧元':'EUR','€':'EUR',GBP:'GBP','英镑':'GBP','£':'GBP',CNY:'CNY',RMB:'CNY','人民币':'CNY','元':'CNY','¥':'¥'}[unit.toUpperCase()]??({dollars:'USD',dollar:'USD',euros:'EUR',euro:'EUR'}[unit.toLowerCase()])??unit);
 const amount='\\d+(?:[.,]\\d+)*(?:\\s*(?:(?:thousand|million|billion|trillion)\\b|万|亿|千|百))?';
 rest=rest.replace(new RegExp(`(USD|EUR|GBP|CNY|RMB|[$€£¥])\\s*(${amount})`,'gi'),(_,unit,n)=>take(`currency:${currency(unit)}:${scalarNumbers(n)[0]}`))
  .replace(new RegExp(`(${amount})\\s*(USD\\b|EUR\\b|GBP\\b|CNY\\b|RMB\\b|dollars?\\b|euros?\\b|美元|欧元|英镑|人民币|元)`,'gi'),(_,n,unit)=>take(`currency:${currency(unit)}:${scalarNumbers(n)[0]}`));
 return [...typed,...scalarNumbers(rest)];
}
export function projectIssue(input:unknown,packet:Packet):Issue{
 const draft:Draft=draftSchema.parse(input),lookup=new Map(packet.evidence.map(e=>[e.id,e]));
 function block(raw:Draft['title']):Block{
  const quotes=raw.anchors.map(a=>{const e=lookup.get(a.id);if(!e||!normalized(e.text+' '+e.title+' '+e.publishedAt).includes(normalized(a.quote)))throw new Error('Unmatched evidence anchor');return a.quote;});
  const cited=raw.anchors.map(a=>lookup.get(a.id)!);
  // Body-only identifier support applies to that exact name, never to its component numbers.
  const identifier=/[A-Za-z][A-Za-z0-9]*(?:[-.][A-Za-z0-9]+)*/g;
  const currencyQuantity=(term:string)=>/^(?:USD|EUR|GBP|CNY|RMB)\d+(?:[.,]\d+)*(?:thousand|million|billion|trillion)?$/i.test(term);
  const sourceIdentifiers=new Set(cited.flatMap(e=>(e.text+' '+e.title).match(identifier)??[]));
  const prose=(raw.en+' '+raw.zh).replace(identifier,(term,offset,input)=>{
   if(!/\d/.test(term)||currencyQuantity(term))return term;
   if(sourceIdentifiers.has(term))return ' ';
   if(!/^\s*[%％]/.test(input.slice(offset+term.length)))throw new Error(`Unsupported number in identifier ${term}`);
   return term;
  });
  const supportText=(quotes.join(' ')+' '+cited.map(e=>e.title).join(' ')).replace(identifier,(term,offset,input)=>/\d/.test(term)&&!currencyQuantity(term)&&!/^\s*[%％]/.test(input.slice(offset+term.length))?' ':term);
  const supported=new Set(numbers(supportText));
  for(const n of numbers(prose))if(!supported.has(n))throw new Error(`Unsupported number ${n} in generated text`);
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
