import type { TopicDetail, DraftPacket } from "../contracts.ts";
export function prepareDraft(topic: TopicDetail): DraftPacket {
  return {
    angle: topic.title,
    factualSummary: topic.evidence
      .filter((e) => e.claim.trim())
      .map((e) => e.claim)
      .join("\n\n"),
    audienceImpact: "",
    verificationQuestions: topic.evidence
      .filter((e) => !e.checked || !e.available || !e.claim.trim())
      .map((e) => `Verify: ${e.title}`),
    references: topic.evidence.map((e) => ({
      articleId: e.articleId,
      url: e.url,
      title: e.title,
    })),
  };
}
const text = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/[\[\]\\`*_]/g, "\\$&");
const link = (s: string) => {
  try {
    const u = new URL(s);
    return ["http:", "https:"].includes(u.protocol)
      ? u.href.replace(/[()<>\s]/g, (c) => encodeURIComponent(c))
      : "";
  } catch {
    return "";
  }
};
export function exportDraft(topic: TopicDetail): {
  markdown: string;
  warnings: string[];
} {
  const d = topic.draft ?? prepareDraft(topic);
  const warnings: string[] = [];
  if (topic.reviewStatus !== "verified")
    warnings.push("Human review is incomplete.");
  if (d.verificationQuestions.length)
    warnings.push("Unresolved verification questions remain.");
  if (topic.evidence.some((e) => !e.available))
    warnings.push("Some evidence is unavailable.");
  if (topic.evidence.some((e) => !e.checked))
    warnings.push("Some evidence is unchecked or changed.");
  const lines = [
    `# ${text(topic.title)}`,
    ...warnings.map((w) => `> WARNING: ${w}`),
    "",
    "## Angle",
    text(d.angle),
    "",
    "## Factual summary",
    text(d.factualSummary),
    "",
    "## Audience impact",
    text(d.audienceImpact),
    "",
    "## Verification questions",
    ...d.verificationQuestions.map((q) => `- ${text(q)}`),
    "",
    "## Sources",
  ];
  for (const e of topic.evidence)
    lines.push(
      `- [${text(e.title)}](${link(e.url)}) — ${text(e.source)} — ${e.publishedAt ?? "Unknown date"} — ${e.kind}`,
      `  Claim: ${text(e.claim)}`,
      `  Limitations: ${text(e.limitations) || "Not recorded"}`,
    );
  return { markdown: lines.join("\n") + "\n", warnings };
}
