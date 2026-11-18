import {createHash} from 'node:crypto';
import {fetchRss} from '@aihot/backend/sources/rss';
import {fetchJsonList} from '@aihot/backend/sources/json-list';
import {fetchWebList} from '@aihot/backend/sources/web-list';
import {admitListing} from '@aihot/backend/sources/filters';
import {extractFromUrl} from '@aihot/backend/content/extract';
import {publicUrl} from '@aihot/backend/publication/daily';
import type {SourceRow,Candidate} from '@aihot/backend/sources/types';
import {periodFor} from './compose.ts';
import {sourceAllowed,sourceRelevant,selectCandidates,sourceAudience,evidenceTextLimit,type ListingCandidate} from './selection.ts';
import type {Evidence,Packet} from '../contracts.ts';
import {RESEARCH_SOURCES} from '@aihot/industry/magazine';
export interface DiscoveryCheck{sourceId:string;url:string;listedAt:string|null;originalPublishedAt:string|null;status:'verified'|'outside_window'|'unverified';}
export async function collectPacket(kind:Packet['kind'],pack:{sources:any[]},now=new Date(),opts:{onDiscovery?:(check:DiscoveryCheck)=>void}={}):Promise<Packet>{
 const period=periodFor(kind,now),rows=pack.sources.filter(sourceAllowed);
 const earliest=kind==='daily'?now.getTime()-72*3600000:Date.parse(period.coverageStart),latest=Date.parse(period.coverageEnd);
 const found:ListingCandidate[]=[];let good=0;
 for(let start=0;start<rows.length;start+=4)await Promise.all(rows.slice(start,start+4).map(async(source:any)=>{
  try{const row:SourceRow={...source,uses:[],enabled:true,cursor:null,fail_count:0};
   const candidates=admitListing(source.kind==='rss'?(await fetchRss(row)).candidates:source.kind==='json_list'?await fetchJsonList(row):await fetchWebList(row),row);
   if(candidates.length)good++;
   if(source.config.detail?.publishedAtAuthoritative===true){
    const maximum=Math.min(8,Math.max(1,Math.trunc(Number(source.config.detail.maxFetches)||8)));
    const links=candidates.filter(c=>publicUrl(c.url)&&sourceRelevant({source,c})&&(!c.publishedAt||(c.publishedAt.getTime()>=earliest&&c.publishedAt.getTime()<latest))).slice(0,maximum);
    for(let i=0;i<links.length;i+=3){const verified=await Promise.all(links.slice(i,i+3).map(async(c):Promise<Candidate|null>=>{
     if(c.listingDatesOriginal)return c;
     let body;try{body=await extractFromUrl(c.url,`magazine-discovery:${source.id}`,{}, {paidFallback:false});}catch{}
     const original=body?.publishedAt??null,status=!original||!body?.text?'unverified':original.getTime()<earliest||original.getTime()>=latest?'outside_window':'verified';
     opts.onDiscovery?.({sourceId:source.id,url:c.url,listedAt:c.publishedAt?.toISOString()??null,originalPublishedAt:original?.toISOString()??null,status});
     return status==='verified'?{...c,publishedAt:original,publicationTime:body!.publicationTime??original!.toISOString(),bodyText:body!.text,bodyStatus:'ok'}:null;
    }));for(const c of verified)if(c)found.push({source,c});}
   }else for(const c of candidates)found.push({source,c});
  }catch{console.warn(`magazine listing unavailable: ${source.id}`);}
 }));
 if(!rows.length||good/rows.length<.5)throw new Error('Insufficient source health for magazine generation');
 const startTime=Date.parse(period.coverageStart),endTime=Date.parse(period.coverageEnd);
 let candidates=found.filter(({c})=>c.publishedAt&&c.publishedAt.getTime()>=startTime&&c.publishedAt.getTime()<endTime&&publicUrl(c.url));
 if(kind==='daily'&&candidates.length<3){period.coverageStart=new Date(now.getTime()-72*3600000).toISOString();period.start=periodFor('daily',new Date(now.getTime()-48*3600000)).start;candidates=found.filter(({c})=>c.publishedAt&&c.publishedAt.getTime()>=Date.parse(period.coverageStart)&&c.publishedAt.getTime()<endTime&&publicUrl(c.url));}

 const selected=selectCandidates(candidates,kind);
 const evidence:Evidence[]=[];
 for(let start=0;start<selected.length;start+=3)await Promise.all(selected.slice(start,start+3).map(async({source,c})=>{
  const research=RESEARCH_SOURCES.has(source.id);
  let text=(research?c.excerpt||c.bodyText:c.bodyText||c.excerpt)||'',level:Evidence['level']=!research&&c.bodyText?'article':'feed';const index=selected.findIndex(r=>r.c.url===c.url),limit=evidenceTextLimit(kind,index);
  if(limit>1400&&!c.bodyText&&!RESEARCH_SOURCES.has(source.id))try{const body=await extractFromUrl(c.url,`magazine:${source.id}`,{}, {paidFallback:false});if(body?.text&&body.text.length>text.length){text=body.text;level='article';}}catch{}
  text=text.replace(/\s+/g,' ').trim().slice(0,limit);if(text.length<160)return;
  const url=publicUrl(c.url)!;evidence.push({id:'ev-'+createHash('sha256').update(url).digest('hex').slice(0,16),url,title:c.title,source:source.name,publishedAt:c.publishedAt!.toISOString(),text,level,audience:sourceAudience({source,c})});
 }));
 evidence.sort((a,b)=>selected.findIndex(r=>publicUrl(r.c.url)===a.url)-selected.findIndex(r=>publicUrl(r.c.url)===b.url));
 if(!evidence.length)throw new Error('No sufficient source evidence; keeping previously published magazine');
 return {kind,generatedAt:now.toISOString(),...period,evidence};
}
