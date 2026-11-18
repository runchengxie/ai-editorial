import {test} from 'node:test';import assert from 'node:assert/strict';
import {publishSnapshot} from '../backend/publish.ts';
test('asset is uploaded before pointer changes, and a lost upload response is verified rather than retried',async()=>{
 const calls:string[]=[];const state:any={body:'old',assets:[]};
 const gh=async(args:string[])=>{calls.push(args.slice(0,3).join(' '));
  if(args[0]==='api')return JSON.stringify(state);
  if(args[1]==='upload'){state.assets=[{name:'magazine-hash.json'}];throw new Error('response lost');}
  if(args[1]==='edit'){state.body=JSON.stringify({sha256:'hash'});return '';}
  return 'accepted';
 };
 await publishSnapshot(gh,{asset:'magazine-hash.json',file:'/tmp/x',manifestFile:'/tmp/manifest',sha256:'hash',revision:'revision'});
 assert.equal(calls.filter(c=>c==='release upload magazine-current').length,1);
 assert.ok(calls.indexOf('release upload magazine-current')<calls.indexOf('release edit magazine-current'));
});
test('failed upload leaves the previous pointer and never dispatches',async()=>{
 let edit=false,dispatch=false;const gh=async(args:string[])=>{if(args[0]==='api')return JSON.stringify({body:'old',assets:[]});if(args[1]==='upload')throw new Error('upload failed');if(args[1]==='edit')edit=true;if(args[0]==='workflow')dispatch=true;return '';};
 await assert.rejects(publishSnapshot(gh,{asset:'magazine-hash.json',file:'/tmp/x',manifestFile:'/tmp/manifest',sha256:'hash',revision:'revision'}));assert.equal(edit,false);assert.equal(dispatch,false);
});
