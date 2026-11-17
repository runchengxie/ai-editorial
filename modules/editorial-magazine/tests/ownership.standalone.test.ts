import{test}from'node:test';import assert from'node:assert/strict';import{mkdtemp,writeFile,rm}from'node:fs/promises';import{tmpdir}from'node:os';import path from'node:path';
import{needsClusterInitialization,markOwnedCluster,assertDatabaseOwnership,databaseOwnershipComment,socketDatabaseEnvironment}from'../../../scripts/magazine/ownership.ts';
test('installer refuses unknown clusters and databases while allowing its own marked instance',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'magazine-owner-'));try{
  assert.equal(await needsClusterInitialization(root),true);await writeFile(path.join(root,'PG_VERSION'),'18');
  await assert.rejects(needsClusterInitialization(root),/unowned/);await markOwnedCluster(root);assert.equal(await needsClusterInitialization(root),false);
  assert.throws(()=>assertDatabaseOwnership(''),/unowned/);assert.throws(()=>assertDatabaseOwnership('unrelated app'),/unowned/);assert.doesNotThrow(()=>assertDatabaseOwnership(databaseOwnershipComment));
 }finally{await rm(root,{recursive:true});}
});

test('dedicated socket configuration is interpreted by the installed PostgreSQL client',async()=>{
 const {default:postgres}=await import('postgres');const oldHost=process.env.PGHOST,oldPort=process.env.PGPORT;
 const config=socketDatabaseEnvironment('/run/user/1000/ai-editorial-postgres');Object.assign(process.env,{PGHOST:config.PGHOST,PGPORT:config.PGPORT});
 const sql=postgres(config.DATABASE_URL);try{assert.equal(sql.options.path,config.PGHOST+'/.s.PGSQL.21850');assert.equal(sql.options.database,'ai_editorial');}finally{await sql.end();if(oldHost===undefined)delete process.env.PGHOST;else process.env.PGHOST=oldHost;if(oldPort===undefined)delete process.env.PGPORT;else process.env.PGPORT=oldPort;}
});
