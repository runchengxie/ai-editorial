import {execFile} from 'node:child_process';
import {mkdir,writeFile,readFile,mkdtemp} from 'node:fs/promises';
import path from 'node:path';
import {z} from 'zod';
import {config} from '@aihot/backend/config';
import {paidRequest,ModelUnavailableError} from '@aihot/backend/providers/receipts';
import {draftSchema,type Draft} from '../contracts.ts';
export type Launch=()=>Promise<{data:unknown;usage:Record<string,unknown>|null}>;
export async function codexJson(subject:string,prompt:string,launch?:Launch){
 if(!config.modelCallsEnabled)throw new ModelUnavailableError('Codex model calls are disabled');
 const model=process.env.CODEX_MODEL||'gpt-6.1-sol';
 return paidRequest({service:'codex-cli',model,purpose:'magazine-compose',subject,
  identity:{prompt,model,version:'magazine-v1'},requestSummary:{promptChars:prompt.length,promptVersion:'magazine-v1',transport:'codex-exec'}},
  async()=>{const answer=await (launch??(()=>launchCodex(prompt,model)))();return {response:draftSchema.parse(answer.data),usage:answer.usage};},
  async tx=>{const [budget]=await tx`SELECT service FROM budgets WHERE service='codex-cli'`;if(!budget)throw new Error('Explicit codex-cli quota budget required');const [unknown]=await tx`SELECT id FROM receipts WHERE service='codex-cli' AND subject=${subject} AND status IN ('pending','unknown') LIMIT 1`;if(unknown)throw new Error('Pending or unknown Codex outcome for this issue; operator review required');});
}
async function launchCodex(prompt:string,model:string):Promise<{data:Draft;usage:Record<string,unknown>|null}>{
 const root=process.env.MAGAZINE_WORK_DIR;if(!root||!path.isAbsolute(root))throw new Error('MAGAZINE_WORK_DIR must be an absolute external directory');
 await mkdir(root,{recursive:true,mode:0o700});const task=await mkdtemp(path.join(root,'call-'));
 const schemaFile=path.join(task,'schema.json'),output=path.join(task,'response.json');
 await writeFile(schemaFile,JSON.stringify(z.toJSONSchema(draftSchema)),{mode:0o600});
 const env=codexChildEnvironment(process.env);
 const args=['exec','--ignore-user-config','--skip-git-repo-check','--ephemeral','--sandbox','read-only','--model',model,
  '-c','model_reasoning_effort="low"','-c','web_search="disabled"','--disable','shell_tool','--disable','unified_exec','--disable','browser_use','--disable','apps','--disable','skill_search','--disable','shell_snapshot','--disable','plugins','--disable','hooks','--disable','image_generation','--disable','code_mode',
  '--json','-C',task,'--output-schema',schemaFile,'-o',output,'-'];
 const stdout=await new Promise<string>((resolve,reject)=>{
  const child=execFile(process.env.CODEX_BINARY||'codex',args,{cwd:task,env,timeout:600000,maxBuffer:2_000_000,killSignal:'SIGKILL'},async(error,out,err)=>{
   await writeFile(path.join(task,'stderr.log'),err,{mode:0o600}).catch(()=>{});
   if(error)return reject(new Error('Codex outcome uncertain: command failed or exceeded its deadline'));
   resolve(out);
  });child.stdin?.end(prompt);
 });
 let usage:Record<string,unknown>|null=null;
 for(const line of stdout.split('\n').filter(Boolean)){
  const event=JSON.parse(line);
  if(event.item&&['command_execution','mcp_tool_call','web_search','file_change'].includes(event.item.type))throw new Error('Unexpected Codex tool use');
  if(event.type==='turn.completed')usage=event.usage??null;
 }
 return {data:draftSchema.parse(JSON.parse(await readFile(output,'utf8'))),usage};
}

export function codexChildEnvironment(parent:NodeJS.ProcessEnv):NodeJS.ProcessEnv{
 const env:NodeJS.ProcessEnv={};for(const key of ['HOME','USER','LOGNAME','PATH','LANG','LC_ALL','XDG_CONFIG_HOME','XDG_CACHE_HOME','XDG_RUNTIME_DIR','CODEX_HOME','HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY','http_proxy','https_proxy','all_proxy','no_proxy','SSL_CERT_FILE','SSL_CERT_DIR'])if(parent[key])env[key]=parent[key];return env;
}
