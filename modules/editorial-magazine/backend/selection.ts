import{publicUrl,audience}from'@aihot/backend/publication/daily';
import{TOPIC_FILTERED_SOURCES,MAGAZINE_TOPICS,FINANCIAL_RELEASE_SOURCES,FINANCIAL_EDITORIAL_SOURCES,FINANCIAL_WORKFLOW_TOPICS,RESEARCH_SOURCES,COMMUNITY_SOURCES}from'@aihot/industry/magazine';
import type{Candidate}from'@aihot/backend/sources/types';import type{Packet,Evidence}from'../contracts.ts';
export interface ListingCandidate{source:{id:string;name:string;tier:string;kind:string;config:Record<string,any>;owner_entity_id?:string|null};c:Candidate;}
export function sourceAllowed(source:any):boolean{
 if(source.enabled===false)return false;const c=source.config??{};let u:URL;try{u=new URL(source.kind==='rss'?c.feedUrl:c.url);}catch{return false;}
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.hostname==='r.jina.ai')return false;
 if(source.kind==='rss')return true;
 if(source.kind==='web_list')return c.fetchVia!=='jina'&&(c.parseMode===undefined||c.parseMode==='html')&&c.adapter===undefined;
 return source.kind==='json_list'&&c.mode==='json_api'&&(!c.method||c.method==='GET')&&u.origin==='https://api.github.com'&&/^\/repos\/[^/]+\/[^/]+\/releases$/.test(u.pathname);
}
export function sourceAudience(row:ListingCandidate):Evidence['audience']{
 if(FINANCIAL_RELEASE_SOURCES.has(row.source.id))return 'finance';
 if(row.source.kind==='json_list')return 'development';
 const title=row.c.title;
 if(!/data cent(?:er|re)|nuclear|electricity|\bsues\b|lawsuit|antitrust|数据中心|起诉/i.test(title)&&
  (FINANCIAL_WORKFLOW_TOPICS.test(title)||(FINANCIAL_EDITORIAL_SOURCES.has(row.source.id)&&FINANCIAL_WORKFLOW_TOPICS.test(title+' '+(row.c.excerpt??'')))))return 'finance';
 return audience(title);
}
export function evidenceTextLimit(kind:Packet['kind'],index:number):number{return index<(kind==='daily'?12:20)?6000:1400;}
export function sourceRelevant(r:ListingCandidate):boolean{const text=r.c.title+' '+(r.c.excerpt??'')+' '+(r.c.bodyText??'').slice(0,2000);return !TOPIC_FILTERED_SOURCES.has(r.source.id)||MAGAZINE_TOPICS.test(text)||(FINANCIAL_EDITORIAL_SOURCES.has(r.source.id)&&FINANCIAL_WORKFLOW_TOPICS.test(text));}
export function selectCandidates(rows:ListingCandidate[],kind:Packet['kind']):ListingCandidate[]{
 const sorted=rows.filter(r=>publicUrl(r.c.url)&&sourceRelevant(r))
  .sort((a,b)=>(b.source.tier==='T1'?1:0)-(a.source.tier==='T1'?1:0)||(b.c.publishedAt?.getTime()??0)-(a.c.publishedAt?.getTime()??0)||a.c.url.localeCompare(b.c.url)||a.source.id.localeCompare(b.source.id));
 const groups={finance:[]as ListingCandidate[],development:[]as ListingCandidate[],general:[]as ListingCandidate[],research:[]as ListingCandidate[],community:[]as ListingCandidate[]};
 for(const row of sorted)groups[RESEARCH_SOURCES.has(row.source.id)?'research':COMMUNITY_SOURCES.has(row.source.id)?'community':sourceAudience(row)].push(row);
 const selected:ListingCandidate[]=[],urls=new Set<string>(),events=new Set<string>(),counts=new Map<string,number>(),publishers=new Map<string,number>();
 const cycle=['finance','development','development','general','research','community']as const,limit=kind==='daily'?30:60,laneCounts={research:0,community:0};
 while(selected.length<limit&&Object.values(groups).some(g=>g.length))for(const group of cycle){
  if((group==='research'||group==='community')&&laneCounts[group]>=(kind==='daily'?2:3)){groups[group].length=0;continue;}
  const queue=groups[group];while(queue.length&&selected.length<limit){
   const row=queue.shift()!,url=publicUrl(row.c.url)!;const title=row.c.title.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');const event=title.length>=36?title:url;
   const location=new URL(url);const publisher=row.source.owner_entity_id||(location.hostname==='github.com'?'github:'+location.pathname.split('/')[1].toLowerCase():location.hostname.replace(/^www\./,''));
   if(urls.has(url)||events.has(event)||(counts.get(row.source.id)??0)>=(kind==='daily'?2:3)||(publishers.get(publisher)??0)>=(kind==='daily'?4:6))continue;
   selected.push(row);if(group==='research'||group==='community')laneCounts[group]++;urls.add(url);events.add(event);counts.set(row.source.id,(counts.get(row.source.id)??0)+1);publishers.set(publisher,(publishers.get(publisher)??0)+1);break;
  }
 }
 return selected;
}
