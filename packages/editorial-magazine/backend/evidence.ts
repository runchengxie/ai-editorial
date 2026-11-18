import {createHash} from 'node:crypto';
import {fetchRss} from '@aihot/backend/sources/rss';
import {fetchJsonList} from '@aihot/backend/sources/json-list';
import {fetchWebList} from '@aihot/backend/sources/web-list';
import {admitListing} from '@aihot/backend/sources/filters';
import {extractFromUrl} from '@aihot/backend/content/extract';
import {publicUrl} from '@aihot/backend/publication/daily';
import type {SourceRow,Candidate} from '@aihot/backend/sources/types';
import {periodFor} from './compose.ts';
import {sourceAllowed,sourceRelevant,selectCandidates,sourceAudience,evidenceTextLimit,planBodyReads,type ListingCandidate,type SelectionStats} from './selection.ts';
import type {Evidence,Packet} from '../contracts.ts';
import {RESEARCH_SOURCES} from '@aihot/industry/magazine';
export interface DiscoveryCheck{sourceId:string;url:string;listedAt:string|null;originalPublishedAt:string|null;status:'verified'|'outside_window'|'unverified';}
export interface CollectionReport{
 kind:Packet['kind'];configuredSources:number;enabledSources:number;allowedSources:number;
 sources:{id:string;status:'available'|'empty'|'unavailable';listed:number;admitted:number;elapsedMs:number}[];
 stages:{found:number;undated:number;outsideWindow:number;invalidUrl:number;inWindow:number;selected:number;insufficientText:number;usable:number;bodyReadAttempts:number;bodyReadFailures:number};
 selection:SelectionStats|null;discoveries:{verified:number;outside_window:number;unverified:number};
}
export async function collectPacket(kind:Packet['kind'],pack:{sources:any[]},now=new Date(),opts:{onDiscovery?:(check:DiscoveryCheck)=>void;onReport?:(report:CollectionReport)=>void}={}):Promise<Packet>{
 const period=periodFor(kind,now),rows=pack.sources.filter(sourceAllowed);
 const earliest=kind==='daily'?now.getTime()-72*3600000:Date.parse(period.coverageStart),latest=Date.parse(period.coverageEnd);
 const report:CollectionReport={kind,configuredSources:pack.sources.length,enabledSources:pack.sources.filter(s=>s.enabled!==false).length,allowedSources:rows.length,sources:[],stages:{found:0,undated:0,outsideWindow:0,invalidUrl:0,inWindow:0,selected:0,insufficientText:0,usable:0,bodyReadAttempts:0,bodyReadFailures:0},selection:null,discoveries:{verified:0,outside_window:0,unverified:0}};
 const emitReport=()=>{report.sources.sort((a,b)=>a.id.localeCompare(b.id));opts.onReport?.(report);};
 const found:ListingCandidate[]=[];let good=0;
 for(let start=0;start<rows.length;start+=4)await Promise.all(rows.slice(start,start+4).map(async(source:any)=>{
  const started=Date.now();const sourceReport:CollectionReport['sources'][number]={id:source.id,status:'unavailable',listed:0,admitted:0,elapsedMs:0};report.sources.push(sourceReport);
  try{const row:SourceRow={...source,uses:[],enabled:true,cursor:null,fail_count:0};
   const listing=source.kind==='rss'?(await fetchRss(row)).candidates:source.kind==='json_list'?await fetchJsonList(row):await fetchWebList(row);
   const candidates=admitListing(listing,row);sourceReport.listed=listing.length;sourceReport.admitted=candidates.length;sourceReport.status=candidates.length?'available':'empty';
   if(candidates.length)good++;
   if(source.config.detail?.publishedAtAuthoritative===true){
    const maximum=Math.min(8,Math.max(1,Math.trunc(Number(source.config.detail.maxFetches)||8)));
    const links=candidates.filter(c=>publicUrl(c.url)&&sourceRelevant({source,c})).slice(0,maximum);
    for(let i=0;i<links.length;i+=3){const verified=await Promise.all(links.slice(i,i+3).map(async(c):Promise<Candidate|null>=>{
     if(c.listingDatesOriginal)return c;
     let body;try{body=await extractFromUrl(c.url,`magazine-discovery:${source.id}`,{}, {paidFallback:false});}catch{}
     const original=body?.publishedAt??null,status=!original||!body?.text?'unverified':original.getTime()<earliest||original.getTime()>=latest?'outside_window':'verified';
     report.discoveries[status]++;opts.onDiscovery?.({sourceId:source.id,url:c.url,listedAt:c.publishedAt?.toISOString()??null,originalPublishedAt:original?.toISOString()??null,status});
     return status==='verified'?{...c,publishedAt:original,publicationTime:body!.publicationTime??original!.toISOString(),bodyText:body!.text,bodyStatus:'ok'}:null;
    }));for(const c of verified)if(c)found.push({source,c});}
   }else for(const c of candidates)found.push({source,c});
  }catch{sourceReport.status='unavailable';console.warn(`magazine listing unavailable: ${source.id}`);}finally{sourceReport.elapsedMs=Date.now()-started;}
 }));
 report.stages.found=found.length;
 if(!rows.length||good/rows.length<.5){emitReport();throw new Error('Insufficient source health for magazine generation');}
 const startTime=Date.parse(period.coverageStart),endTime=Date.parse(period.coverageEnd);
 let candidates=found.filter(({c})=>c.publishedAt&&c.publishedAt.getTime()>=startTime&&c.publishedAt.getTime()<endTime&&publicUrl(c.url));
 if(kind==='daily'&&candidates.length<3){period.coverageStart=new Date(now.getTime()-72*3600000).toISOString();period.start=periodFor('daily',new Date(now.getTime()-48*3600000)).start;candidates=found.filter(({c})=>c.publishedAt&&c.publishedAt.getTime()>=Date.parse(period.coverageStart)&&c.publishedAt.getTime()<endTime&&publicUrl(c.url));}

 for(const {c}of found){if(!c.publishedAt)report.stages.undated++;else if(c.publishedAt.getTime()<Date.parse(period.coverageStart)||c.publishedAt.getTime()>=endTime)report.stages.outsideWindow++;else if(!publicUrl(c.url))report.stages.invalidUrl++;else report.stages.inWindow++;}
 const selected=selectCandidates(candidates,kind,stats=>{report.selection=stats;});report.stages.selected=selected.length;
 const pageReads=planBodyReads(selected,kind);
 const evidence:Evidence[]=[];
 for(let start=0;start<selected.length;start+=3)await Promise.all(selected.slice(start,start+3).map(async({source,c})=>{
  const research=RESEARCH_SOURCES.has(source.id);
  let text=(research?c.excerpt||c.bodyText:c.bodyText||c.excerpt)||'',level:Evidence['level']=!research&&c.bodyText?'article':'feed';const index=selected.findIndex(r=>r.c.url===c.url),limit=evidenceTextLimit(kind,index);
  if(pageReads.has(c.url))try{report.stages.bodyReadAttempts++;const body=await extractFromUrl(c.url,`magazine:${source.id}`,{}, {paidFallback:false});if(!body?.text)report.stages.bodyReadFailures++;if(body?.text&&body.text.length>text.length){text=body.text;level='article';}}catch{report.stages.bodyReadFailures++;}
  text=text.replace(/\s+/g,' ').trim().slice(0,limit);if(text.length<160){report.stages.insufficientText++;return;}
  const url=publicUrl(c.url)!;evidence.push({id:'ev-'+createHash('sha256').update(url).digest('hex').slice(0,16),url,title:c.title,source:source.name,publishedAt:c.publishedAt!.toISOString(),text,level,audience:sourceAudience({source,c})});
 }));
 evidence.sort((a,b)=>selected.findIndex(r=>publicUrl(r.c.url)===a.url)-selected.findIndex(r=>publicUrl(r.c.url)===b.url));
 report.stages.usable=evidence.length;emitReport();
 if(!evidence.length)throw new Error('No sufficient source evidence; keeping previously published magazine');
 return {kind,generatedAt:now.toISOString(),...period,evidence};
}
