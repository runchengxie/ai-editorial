// Explicit one-shot operations; no operation installs or enables a timer.
import {readFile,realpath} from 'node:fs/promises';
import {parseEnv} from 'node:util';
import {spawn} from 'node:child_process';
import path from 'node:path';

const args=process.argv.slice(2);
if(args.length===0||args[0]==='--help'){
 console.log('Usage: node scripts/magazine/manual.ts generate|publish\ngenerate: generate both editions with the installed worker and existing receipt budget; does not publish.\npublish: publish the saved library and dispatch the reader; never calls a model.\nRequires CONFIG_ROOT; reads projects/ai-editorial/magazine.env. Neither command enables automation.');
}else{
 if(args.length!==1||!['generate','publish'].includes(args[0]))throw new Error('Expected exactly generate or publish');
 const config=process.env.CONFIG_ROOT;
 if(!config||!path.isAbsolute(config))throw new Error('CONFIG_ROOT must be an absolute private configuration directory');
 const values=parseEnv(await readFile(path.join(config,'projects/ai-editorial/magazine.env'),'utf8'));
 const {MAGAZINE_RELEASE:release,DATA_ROOT:data,MAGAZINE_PRODUCER_REVISION:revision}=values;
 if(!data||!path.isAbsolute(data)||!revision||!/^[a-f0-9]{40}$/.test(revision)||release!==path.join(data,'ai-editorial/releases',revision))throw new Error('A verified installed stable release is required');
 if(await realpath(release)!==release)throw new Error('Stable release must not redirect to a different directory');
 const script=path.join(release,'scripts/magazine/run.ts');
 const operation=args[0]==='generate'?['--both']:['--publish-only','--publish'];
 const child=spawn(process.execPath,[script,...operation],{cwd:release,env:{...process.env,...values},stdio:'inherit'});
 child.on('error',error=>{console.error(error.message);process.exitCode=1;});
 child.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0);});
}
