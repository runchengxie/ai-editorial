import{test}from'node:test';import assert from'node:assert/strict';import{mkdtemp,writeFile,rm}from'node:fs/promises';import{tmpdir}from'node:os';import path from'node:path';
import{needsClusterInitialization,markOwnedCluster,assertDatabaseOwnership,databaseOwnershipComment}from'../../../scripts/magazine/ownership.ts';
test('installer refuses unknown clusters and databases while allowing its own marked instance',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'magazine-owner-'));try{
  assert.equal(await needsClusterInitialization(root),true);await writeFile(path.join(root,'PG_VERSION'),'18');
  await assert.rejects(needsClusterInitialization(root),/unowned/);await markOwnedCluster(root);assert.equal(await needsClusterInitialization(root),false);
  assert.throws(()=>assertDatabaseOwnership(''),/unowned/);assert.throws(()=>assertDatabaseOwnership('unrelated app'),/unowned/);assert.doesNotThrow(()=>assertDatabaseOwnership(databaseOwnershipComment));
 }finally{await rm(root,{recursive:true});}
});
