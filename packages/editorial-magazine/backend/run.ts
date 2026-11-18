import {readFile,writeFile,mkdir} from 'node:fs/promises';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';
import {sql} from '@aihot/backend/db';import {completeReceipt,rejectReceivedResponse} from '@aihot/backend/providers/receipts';
import {stableJson} from '@aihot/backend/lib/ids';
import {collectPacket,type CollectionReport} from './evidence.ts';import {codexJson} from './codex.ts';import {composePrompt} from './prompt.ts';
import {projectIssue,mergeLibrary} from './compose.ts';import {loadLibrary,atomicJson} from './library.ts';
import type {Packet} from '../contracts.ts';
export async function generateIssue(kind:Packet['kind'],root:string,sourceFile:string){
 const libraryFile=path.join(root,'library.json'),reports=path.join(root,'collection-reports');
 await mkdir(reports,{recursive:true,mode:0o700});
 let fresh:Packet,collection:CollectionReport|undefined;
 try{fresh=await collectPacket(kind,JSON.parse(await readFile(sourceFile,'utf8')),new Date(),{onReport:r=>{collection=r;}});}
 finally{if(collection)await writeFile(path.join(reports,`${kind}-${randomUUID()}.json`),JSON.stringify({recordedAt:new Date().toISOString(),report:collection}),{flag:'wx',mode:0o600});}
 const revision=createHash('sha256').update(stableJson({kind:fresh.kind,start:fresh.start,end:fresh.end,evidence:fresh.evidence})).digest('hex');
 const packets=path.join(root,'packets');await mkdir(packets,{recursive:true,mode:0o700});const file=path.join(packets,revision+'.json');
 try{await writeFile(file,JSON.stringify(fresh),{flag:'wx',mode:0o600});}catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;}
 // Reuse the first packet's timestamps so restart/recovery has exactly the same logical request.
 const packet:Packet=JSON.parse(await readFile(file,'utf8'));const result=await codexJson(`${kind}-${packet.end}`,composePrompt(packet));
 return commitIssueResponse(result,packet,libraryFile);
}
export async function commitIssueResponse(result:{receiptId:number;response:unknown;reused:boolean},packet:Packet,libraryFile:string){
 let issue;
 try{issue=projectIssue(result.response,packet);}
 catch(error){await rejectReceivedResponse(result.receiptId,'Magazine output failed evidence validation');throw error;}
 // Persistence failures retain the already received model answer for recovery without another paid call.
 const library=mergeLibrary(await loadLibrary(libraryFile),issue);
 await atomicJson(libraryFile,library);await completeReceipt(sql,result.receiptId);
 console.log(`Magazine ${issue.id}: ${issue.stories.length} features, ${issue.briefs.length} briefs; receipt${result.receiptId}${result.reused?' reused':''}`);
 return library;
}
