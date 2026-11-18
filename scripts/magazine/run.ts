import {readFile,writeFile} from 'node:fs/promises';import path from 'node:path';import {execFile} from 'node:child_process';import {promisify} from 'node:util';import {createHash} from 'node:crypto';
import {beijingWeekday,beijingDate} from '@aihot/contracts/time';import {closeDb} from '@aihot/backend/db';
import {generateIssue} from '../../packages/editorial-magazine/backend/run.ts';import {periodFor} from '../../packages/editorial-magazine/backend/compose.ts';
import {publishSnapshot} from '../../packages/editorial-magazine/backend/publish.ts';
import {loadLibrary} from '../../packages/editorial-magazine/backend/library.ts';
process.umask(0o077);const exec=promisify(execFile),args=process.argv.slice(2);
const root=process.env.MAGAZINE_DATA_DIR;if(!root||!path.isAbsolute(root))throw new Error('MAGAZINE_DATA_DIR must be an absolute stable data directory');
const repoRoot=path.resolve(import.meta.dirname,'../..');if(root===repoRoot||root.startsWith(repoRoot+path.sep))throw new Error('Magazine data must be outside source');
try{
 // Reuse the existing designated credential for fixed GitHub release reads; never copy it to source/config or the Codex child.
 const githubTokenFile=process.env.MAGAZINE_GITHUB_TOKEN_FILE;const githubToken=githubTokenFile?(await readFile(githubTokenFile,'utf8')).trim():undefined;
 if(githubTokenFile&&!githubToken)throw new Error('Designated GitHub credential is empty');
 if(githubToken)process.env.GITHUB_TOKEN=githubToken;
 if(!args.includes('--publish-only')){
  const previous=await loadLibrary(path.join(root,'library.json'));const needWeekly=!previous.issues.some(i=>i.kind==='weekly'&&i.end===periodFor('weekly',new Date()).end);
  const kinds=args.includes('--both')?['daily','weekly']:args.includes('--weekly')?['weekly']:['daily',...(beijingWeekday(beijingDate(new Date()))==='星期一'||needWeekly?['weekly']:[])];
  for(const kind of kinds)await generateIssue(kind as 'daily'|'weekly',root,path.join(repoRoot,'configs/industry/sources.json'));
 }
 const library=await loadLibrary(path.join(root,'library.json'));
 if(!library.issues.some(i=>i.kind==='daily')||!library.issues.some(i=>i.kind==='weekly'))throw new Error('Both daily and weekly editions are required before magazine publication');
 if(args.includes('--publish')){
  if(!githubToken)throw new Error('Designated GitHub credential file is required for publishing');
  const env={...process.env,GH_TOKEN:githubToken};const gh=process.env.GH_BINARY||'gh';
  const data=JSON.stringify(library)+'\n',sha256=createHash('sha256').update(data).digest('hex'),asset=`magazine-${sha256}.json`,file=path.join(root,asset);
  await writeFile(file,data,{mode:0o600});
  const revision=process.env.MAGAZINE_PRODUCER_REVISION;if(!/^[0-9a-f]{40}$/.test(revision??''))throw new Error('A verified producer release revision is required');
  const manifest={schemaVersion:2,asset,sha256,producerRevision:revision,generatedAt:library.issues.reduce((a,i)=>i.generatedAt>a?i.generatedAt:a,'')};
  const manifestFile=path.join(root,'manifest.json');await writeFile(manifestFile,JSON.stringify(manifest),{mode:0o600});
  await publishSnapshot(async args=>(await exec(gh,args,{env})).stdout,{asset,file,manifestFile,sha256,revision:revision!});
  console.log(`Published ${asset}; reader dispatch accepted`);
 }
}finally{await closeDb();}
