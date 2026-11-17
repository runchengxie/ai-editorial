import{readFile,readdir,writeFile}from'node:fs/promises';import path from'node:path';
const marker='.ai-editorial-magazine.json';
export async function needsClusterInitialization(dir:string):Promise<boolean>{
 let files:string[];try{files=await readdir(dir);}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return true;throw error;}
 if(!files.length)return true;
 let owner:any;try{owner=JSON.parse(await readFile(path.join(dir,marker),'utf8'));}catch{throw new Error('Refusing to use an unowned PostgreSQL directory');}
 if(owner.project!=='ai-editorial-magazine'||owner.version!==1||!files.includes('PG_VERSION'))throw new Error('Refusing to use an unowned PostgreSQL cluster');
 return false;
}
export async function markOwnedCluster(dir:string):Promise<void>{await writeFile(path.join(dir,marker),JSON.stringify({project:'ai-editorial-magazine',version:1})+'\n',{mode:0o600});}
export const databaseOwnershipComment='ai-editorial-magazine:owned';
export function assertDatabaseOwnership(comment:string):void{if(comment.trim()!==databaseOwnershipComment)throw new Error('Refusing to migrate an unowned existing database');}
