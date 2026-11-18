// Installs only this project's checked release and user units. Credentials remain in their existing homes.
import {execFile} from 'node:child_process';import {promisify,parseEnv} from 'node:util';import {mkdir,readFile,writeFile,access,chmod,readdir} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {successfulMainCheck} from './checks.ts';
import {setTimeout as delay} from 'node:timers/promises';
import {needsClusterInitialization,markOwnedCluster,assertDatabaseOwnership,databaseOwnershipComment,socketDatabaseEnvironment} from './ownership.ts';
const exec=promisify(execFile);process.umask(0o077);
const required=(key:string)=>{const value=process.env[key];if(!value||!path.isAbsolute(value))throw new Error(`${key} must be an explicitly resolved absolute path`);return value;};
const code=required('CODE_ROOT'),data=required('DATA_ROOT'),config=required('CONFIG_ROOT'),pgBin=required('MAGAZINE_PG_BIN'),pgLib=required('MAGAZINE_PG_LIB');
if(pgBin.startsWith('/tmp/')||pgLib.startsWith('/tmp/'))throw new Error('Production PostgreSQL runtime must use a stable path');
const source=path.join(code,'ai-editorial'),base=path.join(data,'ai-editorial');await access(base);
const git=async(...args:string[])=>(await exec('git',args,{cwd:source})).stdout.trim();
if(await git('branch','--show-current')!=='main'||await git('status','--porcelain'))throw new Error('Install from a clean primary main checkout');
const revision=await git('rev-parse','HEAD');const privateDir=path.join(config,'projects/ai-editorial');await mkdir(privateDir,{recursive:true,mode:0o700});
const envFile=path.join(privateDir,'magazine.env');let previous:Record<string,string>={};try{previous=parseEnv(await readFile(envFile,'utf8')) as Record<string,string>;}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
const tokenFile=previous.MAGAZINE_GITHUB_TOKEN_FILE||path.join(config,'shared/github/primary.pat');const token=(await readFile(tokenFile,'utf8')).trim();if(!token)throw new Error('Designated GitHub credential is empty');
const ghEnv={...process.env,GH_TOKEN:token};const gh=previous.GH_BINARY||process.env.GH_BINARY||'gh';
const runs=JSON.parse((await exec(gh,['api',`repos/runchengxie/ai-editorial/actions/workflows/check.yml/runs?head_sha=${revision}&branch=main&event=push&per_page=100`],{env:ghEnv})).stdout);
if(!successfulMainCheck(runs,revision))throw new Error('Producer main must pass its exact revision checks before install');
const release=path.join(base,'releases',revision),archive=path.join(base,'releases',revision+'.tar');await mkdir(path.dirname(release),{recursive:true});
try{await access(path.join(release,'package.json'));}catch{
 await mkdir(release,{recursive:true});await exec('git',['archive','--format=tar','-o',archive,revision],{cwd:source});await exec('tar',['-xf',archive,'-C',release]);
}
await exec('npm',['ci','--no-audit','--no-fund'],{cwd:release,maxBuffer:5_000_000});
const pgData=path.join(base,'postgres'),socket=path.join(process.env.XDG_RUNTIME_DIR||`/run/user/${process.getuid!()}`,'ai-editorial-postgres');
const pgEnv={...process.env,LD_LIBRARY_PATH:pgLib};
if(await needsClusterInitialization(pgData)){
 await mkdir(pgData,{recursive:true,mode:0o700});if((await readdir(pgData)).length)throw new Error('Refusing to initialize nonempty PostgreSQL directory');
 await exec(path.join(pgBin,'initdb'),['-D',pgData,'--auth-local=peer','--auth-host=scram-sha-256','--no-locale','-E','UTF8'],{env:pgEnv});await markOwnedCluster(pgData);
}
const units=path.join(os.homedir(),'.config/systemd/user');await mkdir(units,{recursive:true});
const marker='# Managed by ai-editorial magazine installer.\n';
async function unit(name:string,body:string){const file=path.join(units,name);try{const old=await readFile(file,'utf8');if(!old.startsWith(marker))throw new Error('Refusing to replace unmanaged unit '+name);}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}await writeFile(file,marker+body,{mode:0o600});}
await unit('ai-editorial-postgres.service',`[Unit]\nDescription=AI Editorial magazine receipt database\nConditionPathExists=${pgData}/PG_VERSION\n[Service]\nType=simple\nRuntimeDirectory=ai-editorial-postgres\nRuntimeDirectoryMode=0700\nEnvironment=LD_LIBRARY_PATH=${pgLib}\nExecStart=${pgBin}/postgres -D ${pgData} -k ${socket} -h '' -p 21850\nRestart=on-failure\nTimeoutStopSec=60\n[Install]\nWantedBy=default.target\n`);
const database=socketDatabaseEnvironment(socket);
const values={...previous,CODE_ROOT:code,DATA_ROOT:data,CONFIG_ROOT:config,...database,AIHOT_DATA_DIR:path.join(base,'runtime'),AIHOT_CREDENTIALS_DIR:privateDir,
 MODEL_CALLS_ENABLED:previous.MODEL_CALLS_ENABLED||'true',COLLECT_ENABLED:'false',MAGAZINE_RELEASE:release,MAGAZINE_DATA_DIR:path.join(base,'magazine'),MAGAZINE_WORK_DIR:path.join(base,'magazine/codex'),MAGAZINE_PRODUCER_REVISION:revision,
 CODEX_HOME:previous.CODEX_HOME||process.env.CODEX_HOME||path.join(os.homedir(),'.codex'),CODEX_BINARY:previous.CODEX_BINARY||process.env.CODEX_BINARY||'codex',CODEX_MODEL:previous.CODEX_MODEL||'gpt-6.1-sol',
 GH_BINARY:gh,MAGAZINE_GITHUB_TOKEN_FILE:tokenFile,PATH:[path.dirname(process.execPath),path.join(code,'.runtime/bin'),path.join(os.homedir(),'.local/bin'),'/usr/local/bin','/usr/bin','/bin'].join(':')};
await writeFile(envFile,Object.entries(values).map(([key,value])=>`${key}=${JSON.stringify(value)}`).join('\n')+'\n',{mode:0o600});await chmod(envFile,0o600);
await unit('ai-editorial-magazine.service',`[Unit]\nDescription=Generate and publish AI Editorial daily and weekly articles\nRequires=ai-editorial-postgres.service\nAfter=ai-editorial-postgres.service network-online.target\nConditionPathExists=${release}/scripts/magazine/run.ts\n[Service]\nType=oneshot\nEnvironmentFile=${envFile}\nWorkingDirectory=${release}\nExecStart=${process.execPath} ${release}/scripts/magazine/run.ts --publish\nTimeoutStartSec=30min\nUMask=0077\nNice=10\n`);
await unit('ai-editorial-magazine.timer','[Unit]\nDescription=AI Editorial article generation schedule\n[Timer]\nOnCalendar=*-*-* 08:27:00 Asia/Shanghai\nPersistent=true\nUnit=ai-editorial-magazine.service\n[Install]\nWantedBy=timers.target\n');
await exec('systemctl',['--user','daemon-reload']);await exec('systemctl',['--user','enable','--now','ai-editorial-postgres.service']);
const env={...process.env,...values,LD_LIBRARY_PATH:pgLib};
let ready=false;for(let attempt=0;attempt<50;attempt++){try{await exec(path.join(pgBin,'pg_isready'),['-h',socket,'-p','21850','-d','postgres','-t','1'],{env});ready=true;break;}catch{await delay(100);}}if(!ready)throw new Error('Dedicated PostgreSQL socket did not become ready');
const catalogArgs=['-h',socket,'-p','21850','-d','postgres','-Atqc'];
const existing=(await exec(path.join(pgBin,'psql'),[...catalogArgs,"SELECT coalesce(shobj_description(oid,'pg_database'),'') FROM pg_database WHERE datname='ai_editorial'"],{env})).stdout;
const exists=(await exec(path.join(pgBin,'psql'),[...catalogArgs,"SELECT count(*) FROM pg_database WHERE datname='ai_editorial'"],{env})).stdout.trim()==='1';
if(exists)assertDatabaseOwnership(existing);
else{await exec(path.join(pgBin,'createdb'),['-h',socket,'-p','21850','ai_editorial'],{env});await exec(path.join(pgBin,'psql'),[...catalogArgs,`COMMENT ON DATABASE ai_editorial IS '${databaseOwnershipComment}'`],{env});}

await exec(process.execPath,['scripts/migrate.ts'],{cwd:release,env,maxBuffer:5_000_000});
const setup=path.join(base,'runtime','configure-magazine-budget.mjs');await mkdir(path.dirname(setup),{recursive:true});
await writeFile(setup,`import {createRequire} from 'node:module';const require=createRequire(${JSON.stringify(path.join(release,'package.json'))});const postgres=require('postgres');const sql=postgres(process.env.DATABASE_URL);await sql\`INSERT INTO budgets(service,per_minute,per_hour,per_day,note)VALUES('codex-cli',2,3,3,'Codex subscription quota: maximum3new calls per rolling24hours')ON CONFLICT(service)DO NOTHING\`;await sql.end();`,{mode:0o600});
await exec(process.execPath,[setup],{env});
console.log(`Installed producer ${revision}; database ready. Installation does not enable generation or publication. Keep the timer disabled during evaluation; see docs/magazine.md for explicit manual operations and later activation.`);
