// Private acceptance metrics. Counts and review flags do not establish semantic factual accuracy.
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import path from 'node:path';
import {packetSchema,librarySchema,type Packet,type Issue} from '../../packages/editorial-magazine/contracts.ts';

export function assessIssue(packet:Packet,issue:Issue){
 if(issue.id!==`${packet.kind}-${packet.end}`||(['kind','start','end','coverageStart','coverageEnd','generatedAt'] as const).some(field=>issue[field]!==packet[field]))throw new Error('Issue does not match packet');
 const evidence=new Map(packet.evidence.map(e=>[e.id,e]));
 const blocks=[issue.title,issue.lead,...issue.briefs,...issue.outlook.map(o=>o.text),...issue.stories.flatMap(s=>[s.headline,s.summary,...s.paragraphs,...s.related,...(s.practicalNote?[s.practicalNote]:[])])];
 const used=new Set(blocks.flatMap(b=>b.sourceIds));
 for(const id of used)if(!evidence.has(id))throw new Error(`Unknown evidence reference: ${id}`);
 for(const source of issue.sources){const original=evidence.get(source.id);if(!original||['url','title','source','publishedAt','level','audience'].some(k=>source[k as keyof typeof source]!==original[k as keyof typeof original]))throw new Error('Public source differs from evidence packet');}
 if(issue.sources.length!==used.size||new Set(issue.sources.map(s=>s.id)).size!==used.size||issue.sources.some(s=>!used.has(s.id)))throw new Error('Public source set does not match block references');
 const titles=issue.stories.map(s=>s.headline.en.toLowerCase().replace(/[^\p{L}\p{N}]/gu,''));
 const primary=[...issue.stories.map(s=>s.summary),...issue.briefs].map(b=>[...new Set(b.sourceIds)]);
 const counts=new Map<string,number>();for(const ids of primary)for(const id of ids)counts.set(id,(counts.get(id)??0)+1);
 const featureAudiences={finance:0,development:0,general:0};for(const story of issue.stories)featureAudiences[story.audience]++;
 return {issueId:issue.id,kind:issue.kind,candidates:packet.evidence.length,features:issue.stories.length,briefs:issue.briefs.length,sourceArticles:issue.sources.length,sourceFeeds:new Set(issue.sources.map(s=>s.source)).size,
  unusedEvidence:packet.evidence.filter(e=>!used.has(e.id)).map(({id,title,audience})=>({id,title,audience})),featureAudiences,
  articleSupportedFeatures:issue.stories.filter(s=>s.summary.sourceIds.some(id=>evidence.get(id)!.level==='article')).length,
  practicalNotes:issue.stories.filter(s=>s.practicalNote).length,
  targets:{minimumFeatures:packet.kind==='daily'?7:10,minimumBriefs:packet.kind==='daily'?15:20,featureTargetMet:issue.stories.length>=(packet.kind==='daily'?7:10),briefTargetMet:issue.briefs.length>=(packet.kind==='daily'?15:20)},
  reviewFlags:{repeatedHeadlines:titles.length-new Set(titles).size,sharedLeadEvidence:[...counts].filter(([,n])=>n>1).map(([id,entries])=>({id,entries,title:evidence.get(id)!.title})),semanticFactReview:'required',distinctEventReview:'required'},published:false};
}

if(import.meta.main){
 const args=process.argv.slice(2);
 if(!args.length||args.includes('--help'))console.log('Usage: node scripts/magazine/quality.ts --packet <private packet> --library <private library> --out <new evaluation directory>\nRequires DATA_ROOT. Writes private quality metrics only; no network, model calls or publication.');
 else{
  if(args.length!==6||args[0]!=='--packet'||args[2]!=='--library'||args[4]!=='--out')throw new Error('Expected --packet, --library and --out');
  const data=process.env.DATA_ROOT;if(!data||!path.isAbsolute(data))throw new Error('DATA_ROOT must be an absolute external directory');
  const base=await realpath(path.join(data,'ai-editorial/evaluations')),repo=await realpath(path.resolve(import.meta.dirname,'../..'));
  if(base===repo||base.startsWith(repo+path.sep)||process.env.CODE_ROOT&&(base===process.env.CODE_ROOT||base.startsWith(process.env.CODE_ROOT+path.sep)))throw new Error('Evaluation data must be outside source');
  const input=await realpath(args[1]),libraryFile=await realpath(args[3]),out=path.resolve(args[5]);
  if(![input,libraryFile,out].every(p=>p.startsWith(base+path.sep))||await realpath(path.dirname(out))!==path.dirname(out))throw new Error('Use canonical paths under external evaluations');
  const packet=packetSchema.parse(JSON.parse(await readFile(input,'utf8'))),library=librarySchema.parse(JSON.parse(await readFile(libraryFile,'utf8')));
  const issue=library.issues.find(i=>i.id===`${packet.kind}-${packet.end}`);if(!issue)throw new Error('Matching issue not found');
  const report=assessIssue(packet,issue);
  await mkdir(out,{mode:0o700});await writeFile(path.join(out,'quality.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});
  console.log(`${report.issueId}: ${report.features} features, ${report.briefs} briefs, ${report.sourceArticles} articles / ${report.sourceFeeds} feeds. Semantic and distinct-event review required. Not published.`);
 }
}
