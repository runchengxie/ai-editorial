// In-doubt requests remain blocked until an operator checks the outcome and authorizes recovery.
// A primary already handed to a backup stays unknown for billing; only its backup may need recovery.
import { audit, Conflict } from "../audit.ts";
import { sql } from "../db.ts";
import { resumeAfterRelease } from "../jobs/content.ts";
import { sweepUngrouped } from "../jobs/events.ts";
import { retryReleasedReceiptJobs } from "../jobs/queue.ts";
import { closeInterruptedRuns } from "../jobs/runs.ts";
import { markStaleDeliveries } from "../notify/deliver.ts";
import { markStalePendingReceipts, releaseUnknownReceipt } from "../providers/receipts.ts";

export const AUTO_RELEASE_NOTE = "自动放行：结果未知超过 30 分钟，未核对是否计费";

async function release(id: number, error: string, actor: string, note: string, billed: boolean | null, autoReleased = false) {
  return sql.begin(async (tx) => {
    const receipt = await releaseUnknownReceipt(tx, id, error, { autoReleased });
    if (!receipt) return null;
    const requeued = await resumeAfterRelease(receipt, tx);
    await audit(actor, "receipt.release", `receipt:${id}`, note, { status: "unknown" }, { status: "failed", billed, requeued }, { db: tx });
    return { id, status: "failed", subject: receipt.subject, purpose: receipt.purpose, requeued };
  });
}

/** Record verified billing, or explicitly unknown billing for an authorized manual recovery. */
export async function releaseReceipt(id: number, input: { billed: boolean | null; note: string }, actor: string) {
  if (!input.note?.trim()) throw new Error("note is required");
  if (input.billed !== null && typeof input.billed !== "boolean") throw new Error("billed must be true, false or null");
  const [row] = await sql<{ status: string }[]>`SELECT status FROM receipts WHERE id = ${id}`;
  if (!row) return null;
  if (row.status !== "unknown") throw new Conflict("只有结果未知的回执需要人工核对");
  const error = input.billed === null ? `人工放行：计费未知，按授权恢复。${input.note}`
    : `人工核对：${input.billed ? "供应商已计费但结果未取回" : "供应商未计费"}。${input.note}`;
  return release(id, error, actor, input.note, input.billed);
}

/** Compatibility entry point: elapsed time cannot establish billing or authorize another request. */
export async function autoReleaseUnknownReceipts(_now = Date.now()) {
  return { released: 0, requeued: 0 };
}

/** ops.recover, every 10 minutes. */
export async function recoverStaleWork() {
  return { runs: await closeInterruptedRuns(), receipts: await markStalePendingReceipts(), released: await autoReleaseUnknownReceipts(), jobs: await retryReleasedReceiptJobs(), grouping: await sweepUngrouped(), deliveries: await markStaleDeliveries() };
}
