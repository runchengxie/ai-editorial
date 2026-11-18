// One saved packet, one receipt-governed generation, private outputs only.
import {mkdir,readFile,writeFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {successfulMainCheck} from './checks.ts';
import {packetSchema} from '../../modules/editorial-magazine/contracts.ts';
import {pilotMarkdown} from './pilot-render.ts';
import {codexJson} from '../../modules/editorial-magazine/backend/codex.ts';
import {composePrompt} from '../../modules/editorial-magazine/backend/prompt.ts';
import {commitIssueResponse} from '../../modules/editorial-magazine/backend/run.ts';
import {closeDb} from '@aihot/backend/db';

const args=process.argv.slice(2);
if(!args.length||args.includes('--help'))console.log('Usage: node --env-file=<private worker env> scripts/magazine/pilot.ts --packet <saved packet> --out <new evaluation directory>\nUses the existing receipt ledger and budget. Generates one edition only; never publishes or enables automation.');
else try{
 if(args.length!==4||args[0]!=='--packet'||args[2]!=='--out')throw new Error('Expected --packet <file> --out <directory>');
 const data=process.env.DATA_ROOT;if(!data||!path.isAbsolute(data))throw new Error('DATA_ROOT must be an absolute external directory');
 const evaluations=await realpath(path.join(data,'ai-editorial/evaluations'));
 const repo=await realpath(path.resolve(import.meta.dirname,'../..')),code=process.env.CODE_ROOT?await realpath(process.env.CODE_ROOT):repo;
 const exec=promisify(execFile),git=async(...args:string[])=>(await exec('git',args,{cwd:repo})).stdout.trim();
 if(await git('branch','--show-current')!=='main'||await git('status','--porcelain'))throw new Error('Run pilot generation from clean, checked main after integration');
 const producerRevision=await git('rev-parse','HEAD');
 if(evaluations===code||evaluations.startsWith(code+path.sep)||evaluations===repo||evaluations.startsWith(repo+path.sep))throw new Error('Pilot data must be outside source repositories');
 const input=await realpath(args[1]),requested=path.resolve(args[3]);
 if(!input.startsWith(evaluations+path.sep)||!requested.startsWith(evaluations+path.sep))throw new Error('Pilot inputs and output must be under the external project evaluations directory');
 if(await realpath(path.dirname(requested))!==path.dirname(requested))throw new Error('Pilot output parent must not redirect through a symlink');
 // Refuse an existing output directory: recovery uses the saved response, not a blind new CLI run.
 await mkdir(requested,{mode:0o700});const output=await realpath(requested);
 if(output!==requested||!output.startsWith(evaluations+path.sep))throw new Error('Pilot output must not redirect outside its evaluation directory');
 const raw=await readFile(input);if(raw.length>2_000_000)throw new Error('Oversized packet');
 const packet=packetSchema.parse(JSON.parse(raw.toString('utf8')));
 const tokenFile=process.env.MAGAZINE_GITHUB_TOKEN_FILE;if(!tokenFile)throw new Error('Designated GitHub credential file is required for the checked-main gate');
 const token=(await readFile(tokenFile,'utf8')).trim();if(!token)throw new Error('Designated GitHub credential is empty');
 const runs=JSON.parse((await exec(process.env.GH_BINARY||'gh',['api',`repos/runchengxie/ai-editorial/actions/workflows/check.yml/runs?head_sha=${producerRevision}&branch=main&event=push&per_page=100`],{env:{...process.env,GH_TOKEN:token},timeout:30000,maxBuffer:2_000_000})).stdout);
 if(!successfulMainCheck(runs,producerRevision))throw new Error('Wait for successful push checks on this exact main revision before pilot generation');
 process.env.MAGAZINE_WORK_DIR=path.join(output,'codex');
 const result=await codexJson(`${packet.kind}-${packet.end}`,composePrompt(packet));
 const library=await commitIssueResponse(result,packet,path.join(output,'library.json'));
 const issue=library.issues.find(i=>i.id===`${packet.kind}-${packet.end}`)!;
 for(const locale of ['en','zh'] as const)await writeFile(path.join(output,`draft.${locale==='zh'?'zh-CN':'en'}.md`),pilotMarkdown(issue,locale),{mode:0o600});
 await writeFile(path.join(output,'acceptance.json'),JSON.stringify({createdAt:new Date().toISOString(),producerRevision,id:issue.id,receiptId:result.receiptId,reused:result.reused,packetSha256:createHash('sha256').update(raw).digest('hex'),candidates:packet.evidence.length,features:issue.stories.length,briefs:issue.briefs.length,sources:issue.sources.length,featureAudiences:issue.stories.map(s=>s.audience),evidenceValidation:'passed',editorialReview:'pending',published:false},null,2)+'\n',{mode:0o600});
 console.log(`Private draft: ${output}; ${issue.stories.length} features, ${issue.briefs.length} briefs. Editorial review pending; not published.`);
}finally{await closeDb();}

