export const STATUSES = [
  "inbox",
  "candidate",
  "in_progress",
  "published",
  "discarded",
] as const;
export const AUDIENCES = ["finance-research", "development"] as const;
export const EVIDENCE_KINDS = [
  "official_claim",
  "independent_test",
  "community_report",
] as const;
export type TopicStatus = (typeof STATUSES)[number];
export type Audience = (typeof AUDIENCES)[number];
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];
export type ReviewStatus = "unreviewed" | "verified" | "needs_changes";
export interface Evidence {
  articleId: string;
  url: string;
  source: string;
  title: string;
  publishedAt: string | null;
  claim: string;
  limitations: string;
  kind: EvidenceKind;
  checked: boolean;
  available: boolean;
  revision: number;
}
export interface DraftPacket {
  angle: string;
  factualSummary: string;
  audienceImpact: string;
  verificationQuestions: string[];
  references: { articleId: string; url: string; title: string }[];
}
export interface Topic {
  id: string;
  title: string;
  audiences: Audience[];
  status: TopicStatus;
  reviewStatus: ReviewStatus;
  privateNotes: string;
  publicationUrl: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface TopicDetail extends Topic {
  evidence: Evidence[];
  draft: DraftPacket | null;
}
export interface CreateTopicInput {
  articleId: string;
  audiences: Audience[];
}
export interface TopicPatch {
  title?: string;
  audiences?: Audience[];
  status?: TopicStatus;
  privateNotes?: string;
  publicationUrl?: string | null;
}
export interface TopicFilter {
  status?: TopicStatus;
  audience?: Audience;
  q?: string;
  cursor?: string;
}
export interface EvidenceInput {
  articleId: string;
  claim: string;
  limitations: string;
  kind: EvidenceKind;
  checked: boolean;
}
