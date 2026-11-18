import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';import path from 'node:path';
import {librarySchema,type Library} from '../contracts.ts';
export async function loadLibrary(file:string):Promise<Library>{
 try{return librarySchema.parse(JSON.parse(await readFile(file,'utf8')));}
 catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return {schemaVersion:2,issues:[]};throw error;}
}
export async function atomicJson(file:string,value:unknown):Promise<void>{await mkdir(path.dirname(file),{recursive:true,mode:0o700});const pending=file+'.pending';await writeFile(pending,JSON.stringify(value,null,2)+'\n',{mode:0o600});await rename(pending,file);}
