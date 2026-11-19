// Bounded free RSS diagnostics. No model, database writes, publication or proxy changes.
import {readFile} from 'node:fs/promises';
import {fetchRss} from '@aihot/backend/sources/rss';
import {extractFromUrl} from '@aihot/backend/content/extract';
import type {SourceRow} from '@aihot/backend/sources/types';
import {closeDb} from '@aihot/backend/db';

const defaults=['rss-google-research','rss-hugging-face','rss-microsoft-research','rss-import-ai','rss-google-developers'];
function failure(error:unknown,depth=0):unknown{
 if(depth>=4)return {message:"Nested error truncated"};
 if(!(error instanceof Error))return {message:String(error).slice(0,300)};
 return {name:error.name,message:error.message.slice(0,300),code:(error as NodeJS.ErrnoException).code,
  ...(error.cause?{cause:failure(error.cause,depth+1)}:{}),
  ...(error instanceof AggregateError?{errors:error.errors.slice(0,5).map(e=>failure(e,depth+1))}:{})};
}
const args=process.argv.slice(2);
if(args.includes('--help')){
 console.log('Usage: node scripts/magazine/probe.ts [--sources id,id] [--body-limit 0|1|2]\nProbes at most 10 configured RSS sources, with at most 2 article reads each.\nJSON goes to stdout; save it outside Git. Uses existing EGRESS_* settings without changing them. No paid fallback, model calls or publication.');
}else try{
 const options=new Map<string,string>();
 for(let i=0;i<args.length;i+=2){
  if(!['--sources','--body-limit'].includes(args[i])||!args[i+1]||options.has(args[i]))throw new Error('Invalid probe options; use --help');
  options.set(args[i],args[i+1]);
 }
 const ids=options.has('--sources')?options.get('--sources')!.split(','):defaults;
 const limit=Number(options.get('--body-limit')??'1');
 if(!Number.isInteger(limit)||limit<0||limit>2||!ids.length||ids.length>10||new Set(ids).size!==ids.length)throw new Error('Expected 1–10 unique source IDs and body limit 0–2');
 const pack=JSON.parse(await readFile(new URL('../../configs/industry/sources.json',import.meta.url),'utf8')) as {sources:SourceRow[]};
 const selected=ids.map(id=>{const s=pack.sources.find(s=>s.id===id);if(!s||s.kind!=='rss')throw new Error(`Unknown RSS source ${id}`);return s;});
 const results=[];
 for(const source of selected){
  const started=Date.now();
  try{
   const {candidates}=await fetchRss({...source,cursor:null},{force:true});
   const articles=[];
   for(const c of candidates.slice(0,limit)){
    const bodyStart=Date.now();
    try{
     const body=await extractFromUrl(c.url,`magazine-probe:${source.id}`,{}, {paidFallback:false,includeCover:false});
     articles.push({url:c.url,status:body?.text?'extracted':'no_body',characters:body?.text.length??0,via:body?.via??null,originalPublishedAt:body?.publishedAt?.toISOString()??null,elapsedMs:Date.now()-bodyStart});
    }catch(error){articles.push({url:c.url,status:'failed',error:failure(error),elapsedMs:Date.now()-bodyStart});}
   }
   results.push({id:source.id,status:candidates.length?'available':'empty',listed:candidates.length,dated:candidates.filter(c=>c.publishedAt).length,feedBodies:candidates.filter(c=>c.bodyText).length,articles,elapsedMs:Date.now()-started});
  }catch(error){results.push({id:source.id,status:'failed',error:failure(error),elapsedMs:Date.now()-started});}
 }
 console.log(JSON.stringify({probedAt:new Date().toISOString(),modelCalls:0,published:false,proxyConfigured:!!process.env.EGRESS_PROXY_URL,results},null,2));
}finally{await closeDb();}
