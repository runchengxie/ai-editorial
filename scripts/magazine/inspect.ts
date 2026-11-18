// Free evidence inspection only: never imports model generation or publication.
import {mkdir,mkdtemp,readFile,writeFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {collectPacket} from '../../modules/editorial-magazine/backend/evidence.ts';
import type {Packet} from '../../modules/editorial-magazine/contracts.ts';

const args=process.argv.slice(2);
if(args.includes('--help')){
 console.log('Usage: node scripts/magazine/inspect.ts [--kind daily|weekly|both] [--at ISO-date]\nRequires DATA_ROOT. Optionally reads MAGAZINE_GITHUB_TOKEN_FILE for public release listings.\nWrites private evidence and a count summary under DATA_ROOT/ai-editorial/evaluations/. No model calls or publication.');
}else{
 const options=new Map<string,string>();
 for(let i=0;i<args.length;i+=2){
  if(!['--kind','--at'].includes(args[i])||!args[i+1]||options.has(args[i]))throw new Error('Expected --kind daily|weekly|both and optional --at ISO-date');
  options.set(args[i],args[i+1]);
 }
 const kind=options.get('--kind')??'both';
 if(!['daily','weekly','both'].includes(kind))throw new Error('Invalid kind');
 const at=options.get('--at');
 if(at&&!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(at))throw new Error('--at must include an explicit ISO timestamp timezone');
 const now=at?new Date(at):new Date();
 if(!Number.isFinite(now.getTime()))throw new Error('Invalid --at date');
 const dataRoot=process.env.DATA_ROOT;
 if(!dataRoot||!path.isAbsolute(dataRoot))throw new Error('DATA_ROOT must be an existing absolute external data directory');
 const data=await realpath(dataRoot),repo=await realpath(path.resolve(import.meta.dirname,'../..'));
 const code=process.env.CODE_ROOT?await realpath(process.env.CODE_ROOT):repo;
 if(data===code||data.startsWith(code+path.sep)||data===repo||data.startsWith(repo+path.sep))throw new Error('DATA_ROOT must be outside source repositories');
 const tokenFile=process.env.MAGAZINE_GITHUB_TOKEN_FILE;
 if(tokenFile){const token=(await readFile(tokenFile,'utf8')).trim();if(!token)throw new Error('Designated GitHub credential is empty');process.env.GITHUB_TOKEN=token;}
 process.umask(0o077);
 await mkdir(path.join(data,'ai-editorial/evaluations'),{recursive:true,mode:0o700});
 const output=await mkdtemp(path.join(data,'ai-editorial/evaluations',`magazine-inspect-${new Date().toISOString().replace(/[:.]/g,'-')}-`));
 const pack=JSON.parse(await readFile(path.join(repo,'industry/sources.json'),'utf8'));
 const summaries=[];
 for(const selected of kind==='both'?['daily','weekly']: [kind]){
  const discoveries:import('../../modules/editorial-magazine/backend/evidence.ts').DiscoveryCheck[]=[];
  const packet=await collectPacket(selected as Packet['kind'],pack,now,{onDiscovery:c=>discoveries.push(c)});
  await writeFile(path.join(output,`${selected}.packet.json`),JSON.stringify(packet,null,2)+'\n',{mode:0o600});
  const audiences:Record<string,number>={},levels:Record<string,number>={};
  for(const e of packet.evidence){audiences[e.audience]=(audiences[e.audience]??0)+1;levels[e.level]=(levels[e.level]??0)+1;}
  summaries.push({kind:selected,start:packet.start,end:packet.end,coverageStart:packet.coverageStart,coverageEnd:packet.coverageEnd,
   candidates:packet.evidence.length,sources:new Set(packet.evidence.map(e=>e.source)).size,audiences,levels,discoveries,
   textCharacters:packet.evidence.reduce((sum,e)=>sum+e.text.length,0),items:packet.evidence.map(({id,title,url,source,publishedAt,audience,level,text})=>({id,title,url,source,publishedAt,audience,level,textCharacters:text.length}))});
 }
 const summary={inspectedAt:new Date().toISOString(),modelCalls:0,published:false,output,editions:summaries};
 await writeFile(path.join(output,'summary.json'),JSON.stringify(summary,null,2)+'\n',{mode:0o600});
 for(const s of summaries)console.log(`${s.kind} ${s.end}: ${s.candidates} candidates, ${s.sources} sources; ${JSON.stringify(s.audiences)}`);
 console.log(`Private evidence: ${output}\nModel calls: 0; published: false`);
}
