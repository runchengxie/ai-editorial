/** Require the exact completed push-main check; API status indexes can lag the run record. */
export function successfulMainCheck(value:any,revision:string):boolean{
 return /^[0-9a-f]{40}$/.test(revision)&&Array.isArray(value?.workflow_runs)&&value.workflow_runs.some((r:any)=>r.head_sha===revision&&r.head_branch==='main'&&r.event==='push'&&r.status==='completed'&&r.conclusion==='success');
}
