export type Gh=(args:string[])=>Promise<string>;
interface Snapshot {asset:string;file:string;manifestFile:string;sha256:string;revision:string;}
const repo='runchengxie/ai-editorial',tag='magazine-current';
export async function publishSnapshot(gh:Gh,snapshot:Snapshot):Promise<void>{
 const read=async()=>{try{return JSON.parse(await gh(['api',`repos/${repo}/releases/tags/${tag}`]));}catch(error){if(String((error as any).stderr??error).includes('404'))return null;throw error;}};
 let release=await read();
 if(!release){
  try{await gh(['release','create',tag,'--repo',repo,'--target',snapshot.revision,'--title','Magazine data','--notes','Initializing magazine data','--latest=false']);}
  catch(error){if(!await read())throw error;}
  release=await read();
 }
 const exists=(r:any)=>r?.assets?.some((a:any)=>a.name===snapshot.asset);
 if(!exists(release)){
  try{await gh(['release','upload',tag,snapshot.file,'--repo',repo]);}
  catch(error){if(!exists(await read()))throw error;}
 }
 const points=(r:any)=>{try{return JSON.parse(r.body).sha256===snapshot.sha256;}catch{return false;}};
 if(!points(release)){
  try{await gh(['release','edit',tag,'--repo',repo,'--notes-file',snapshot.manifestFile]);}
  catch(error){if(!points(await read()))throw error;}
 }
 const published=await read();if(!exists(published)||!points(published))throw new Error('Published magazine pointer verification failed');
 // A dispatch has no idempotency key. Never repeat one in this invocation after an uncertain response.
 await gh(['workflow','run','pages.yml','--repo','runchengxie/ai-editorial-pages','--ref','main']);
}
