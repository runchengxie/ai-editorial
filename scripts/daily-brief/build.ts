import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { selectEdition, restoreEditions, type DailySource } from '../../packages/backend/src/publication/daily.ts';
import { freeWebListing } from './sources.ts';
import type { SourceRow } from '../../packages/backend/src/sources/types.ts';
const args=process.argv.slice(2);
function option(name:string):string|undefined {const i=args.indexOf(name);return i<0?undefined:args[i+1];}
const out=option('--out');if(!out)throw new Error('--out must identify an external generated-output directory');
const target=path.resolve(out),repo=path.resolve(import.meta.dirname,'../..');
if(target===repo||target.startsWith(repo+path.sep))throw new Error('Generated outputs must be outside the repository');
let rows:DailySource[];
if(args.includes('--fixture')) {
 rows=[{sourceId:'fixture',sourceName:'Preview source',tier:'T1',ok:true,candidates:[{url:'https://example.org/research',title:'Preview: Python tools for financial data',publishedAt:new Date(Date.now()-3600000)}]}];
} else {
 const [{fetchRss},{fetchWebList},{admitListing}]=await Promise.all([
  import('../../packages/backend/src/sources/rss.ts'),import('../../packages/backend/src/sources/web-list.ts'),import('../../packages/backend/src/sources/filters.ts')]);
 const pack=JSON.parse(await readFile(new URL('../../industry/sources.json',import.meta.url),'utf8'));
 const sources=pack.sources.filter((s:any)=>s.enabled!==false&&['rss','web_list'].includes(s.kind));
 rows=[];
 // Bounded parallel reads; each guarded collector has its own timeout and response-size limit.
 for(let start=0;start<sources.length;start+=4){
  const batch=await Promise.all(sources.slice(start,start+4).map(async(s:any):Promise<DailySource>=>{
   const row:SourceRow={...s,enabled:true,uses:[],cursor:null,fail_count:0};
   if(s.kind==='web_list'&&!freeWebListing(s.config))throw new Error('Daily Pages allows only free HTML web listings');
   try {
    const found=s.kind==='rss'?(await fetchRss(row)).candidates:await fetchWebList(row);
    const candidates=admitListing(found,row);
    console.log(`${s.id}: ${candidates.length} listing entries`);
    return {sourceId:s.id,sourceName:s.name,tier:s.tier,ok:candidates.length>0,candidates};
   }catch(error){
    console.warn(`${s.id}: collection failed (${error instanceof Error?error.name:'error'})`);
    return {sourceId:s.id,sourceName:s.name,tier:s.tier,ok:false,candidates:[]};
   }
  }));rows.push(...batch);
 }
}
const now=new Date(),edition=selectEdition(rows,now);
const state=option('--state');let prior:unknown=[];
if(state){try{prior=JSON.parse(await readFile(state,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}
const editions=[edition,...restoreEditions(prior,now).filter(e=>e.date!==edition.date)].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30);
await mkdir(target,{recursive:true});
// JSON stays on the producer's existing Pages endpoint; old reader paths become redirects.
const reader='https://runchengxie.github.io/ai-editorial-pages/';
const redirect=(url:string)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${url}"><link rel="canonical" href="${url}"><title>AI Editorial</title></head><body><a href="${url}">${url}</a></body></html>`;
for(const e of editions)for(const locale of ['en','zh-CN'])await writeFile(path.join(target,`${e.date}.${locale}.html`),redirect(`${reader}${e.date}.${locale}.html`));
await writeFile(path.join(target,'index.html'),redirect(reader));
await writeFile(path.join(target,'zh-CN.html'),redirect(reader+'zh-CN.html'));
await writeFile(path.join(target,'latest.json'),JSON.stringify(edition,null,2)+'\n');
await writeFile(path.join(target,'editions.json'),JSON.stringify(editions)+'\n');
await writeFile(path.join(target,'feed.xml'),`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>AI Editorial</title><link>${reader}</link><description>${reader}feed.xml</description><item><title>AI Editorial RSS</title><link>${reader}feed.xml</link><guid>ai-editorial-pages-rss-migration</guid><description>${reader}feed.xml</description></item></channel></rss>`);
await writeFile(path.join(target,'.nojekyll'),'');
console.log(`Published v1 data: ${edition.items.length} links; ${edition.sources.filter(s=>s.ok).length}/${edition.sources.length} sources available; ${editions.length} editions`);
