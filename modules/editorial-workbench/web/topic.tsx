import { useState } from "react";
import { data, Link } from "react-router";
import {
  adminPageGet,
  GRAY_HEADERS,
} from "../../../apps/web/app/lib/admin.server.ts";
import type {
  TopicDetail,
  Evidence,
  TopicStatus,
  Audience,
  EvidenceKind,
  DraftPacket,
} from "../contracts.ts";
import { STATUSES, AUDIENCES, EVIDENCE_KINDS } from "../contracts.ts";
import {
  useLocale,
  Language,
  useCommand,
  Field,
  input,
  button,
  panel,
} from "./shared.tsx";
export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { id?: string };
}) {
  const me = await adminPageGet<{ csrf: string }>(request, "/api/admin/me");
  const topic = await adminPageGet<TopicDetail>(
    request,
    "/api/admin/editorial/topics/" + encodeURIComponent(params.id ?? ""),
  );
  return data({ topic, csrf: me.csrf }, { headers: GRAY_HEADERS });
}
export const headers = () => GRAY_HEADERS;
export default function TopicPage({
  loaderData,
}: {
  loaderData: { topic: TopicDetail; csrf: string };
}) {
  return (
    <Editor
      key={loaderData.topic.id}
      initial={loaderData.topic}
      csrf={loaderData.csrf}
    />
  );
}
function Editor({ initial, csrf }: { initial: TopicDetail; csrf: string }) {
  const { locale, choose, t } = useLocale();
  const command = useCommand(csrf, t);
  const [topic, setTopic] = useState(initial);
  const [dirty, setDirty] = useState<string[]>([]);
  const [articleId, setArticleId] = useState("");
  const root = "/api/admin/editorial/topics/" + topic.id;
  const mark = (key: string) =>
    setDirty((v) => (v.includes(key) ? v : [...v, key]));
  const edit = (patch: Partial<TopicDetail>) => {
    setTopic((v) => ({ ...v, ...patch }));
    mark("topic");
  };
  async function save(
    section: string,
    path: string,
    body: object,
    method = "POST",
  ) {
    const result = await command.run<TopicDetail>(method, root + path, {
      expectedVersion: topic.version,
      ...body,
    });
    if (result) {
      setTopic((v) => ({
        ...v,
        version: result.version,
        reviewStatus: result.reviewStatus,
        ...(section === "prepare" ? { draft: result.draft } : {}),
        ...(section === "add" ? { evidence: result.evidence } : {}),
      }));
      setDirty((v) => v.filter((k) => k !== section));
    }
  }
  const draft = topic.draft;
  const draftEdit = (patch: Partial<DraftPacket>) => {
    if (draft) {
      setTopic((v) => ({ ...v, draft: { ...draft, ...patch } }));
      mark("draft");
    }
  };
  function evidenceEdit(index: number, patch: Partial<Evidence>) {
    setTopic((v) => ({
      ...v,
      evidence: v.evidence.map((e, i) =>
        i === index ? { ...e, ...patch } : e,
      ),
    }));
    mark("evidence-" + index);
  }
  return (
    <div className="space-y-6" lang={locale}>
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <Link to="/admin/editorial" className="text-sm text-accent">
            ← {t("back")}
          </Link>
          <h1 className="mt-3 text-2xl font-semibold">{t("topicTitle")}</h1>
          <p className="mt-2 text-sm text-ink-3">
            {t("review")}:{" "}
            <strong data-testid="review-status">{t(topic.reviewStatus)}</strong>{" "}
            · {t("version")} {topic.version}
          </p>
        </div>
        <Language {...{ locale, choose, t }} />
      </header>
      {command.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 p-3 text-sm"
        >
          {command.error}{" "}
          <a href={"/admin/editorial/" + topic.id} className="underline">
            {t("reload")}
          </a>
        </div>
      )}
      {command.notice && (
        <p role="status" className="text-sm text-accent">
          {command.notice}
        </p>
      )}
      <section className={panel + " space-y-4"}>
        <Field label={t("title")}>
          <input
            className={input}
            maxLength={300}
            value={topic.title}
            onChange={(e) => edit({ title: e.target.value })}
          />
        </Field>
        <div className="flex flex-wrap gap-5">
          {AUDIENCES.map((a) => (
            <label className="flex items-center gap-2 text-sm" key={a}>
              <input
                type="checkbox"
                checked={topic.audiences.includes(a)}
                onChange={(e) =>
                  edit({
                    audiences: e.target.checked
                      ? [...topic.audiences, a]
                      : (topic.audiences.filter((v) => v !== a) as Audience[]),
                  })
                }
              />
              {t(a === "development" ? "development" : "finance")}
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("status")}>
            <select
              className={input}
              value={topic.status}
              onChange={(e) => edit({ status: e.target.value as TopicStatus })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("publicationUrl")}>
            <input
              type="url"
              className={input}
              value={topic.publicationUrl ?? ""}
              onChange={(e) => edit({ publicationUrl: e.target.value || null })}
            />
          </Field>
        </div>
        <Field label={t("notes")}>
          <textarea
            className={input}
            rows={4}
            maxLength={20000}
            value={topic.privateNotes}
            onChange={(e) => edit({ privateNotes: e.target.value })}
          />
        </Field>
        <button
          className={button}
          disabled={command.busy}
          onClick={() =>
            void save(
              "topic",
              "",
              {
                title: topic.title,
                audiences: topic.audiences,
                status: topic.status,
                privateNotes: topic.privateNotes,
                publicationUrl: topic.publicationUrl,
              },
              "PATCH",
            )
          }
        >
          {t("saveTopic")}
        </button>
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("sources")}</h2>
        {topic.evidence.map((e, i) => (
          <article key={e.articleId} className={panel + " space-y-4"}>
            <div>
              <a
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="break-words font-medium text-accent"
              >
                {e.title}
              </a>
              <p className="mt-1 text-sm text-ink-3">
                {e.source} ·{" "}
                {e.publishedAt
                  ? new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Shanghai",
                    }).format(new Date(e.publishedAt))
                  : t("unknownDate")}
              </p>
              {!e.available && (
                <p className="text-sm text-red-600">{t("unavailable")}</p>
              )}
              {!e.checked && (
                <p className="text-sm text-ink-3">{t("unchecked")}</p>
              )}
            </div>
            <Field label={t("claim")}>
              <textarea
                className={input}
                rows={3}
                value={e.claim}
                onChange={(event) =>
                  evidenceEdit(i, { claim: event.target.value })
                }
              />
            </Field>
            <Field label={t("limitations")}>
              <textarea
                className={input}
                rows={2}
                value={e.limitations}
                onChange={(event) =>
                  evidenceEdit(i, { limitations: event.target.value })
                }
              />
            </Field>
            <Field label={t("kind")}>
              <select
                className={input}
                value={e.kind}
                onChange={(event) =>
                  evidenceEdit(i, { kind: event.target.value as EvidenceKind })
                }
              >
                {EVIDENCE_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(k)}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={e.checked}
                onChange={(event) =>
                  evidenceEdit(i, { checked: event.target.checked })
                }
              />
              {t("checked")}
            </label>
            <button
              className={button}
              disabled={command.busy}
              onClick={() =>
                void save("evidence-" + i, "/evidence", {
                  evidence: {
                    articleId: e.articleId,
                    claim: e.claim,
                    limitations: e.limitations,
                    kind: e.kind,
                    checked: e.checked,
                  },
                })
              }
            >
              {t("saveEvidence")}
            </button>
          </article>
        ))}
        <div className={panel + " flex flex-wrap items-end gap-3"}>
          <Field label={t("sourceId")}>
            <input
              className={input}
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
            />
          </Field>
          <button
            className={button}
            disabled={
              command.busy ||
              !articleId.trim() ||
              dirty.some((k) => k.startsWith("evidence"))
            }
            onClick={() =>
              void save("add", "/evidence", {
                evidence: {
                  articleId,
                  claim: "",
                  limitations: "",
                  kind: "official_claim",
                  checked: false,
                },
              })
            }
          >
            {t("addEvidence")}
          </button>
        </div>
      </section>
      <section className={panel + " space-y-4"}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t("draft")}</h2>
          <button
            className={button}
            disabled={command.busy || dirty.length > 0}
            onClick={() => void save("prepare", "/draft", {})}
          >
            {t("prepareDraft")}
          </button>
        </div>
        {draft && (
          <>
            <Field label={t("angle")}>
              <textarea
                className={input}
                rows={2}
                value={draft.angle}
                onChange={(e) => draftEdit({ angle: e.target.value })}
              />
            </Field>
            <Field label={t("summary")}>
              <textarea
                className={input}
                rows={6}
                value={draft.factualSummary}
                onChange={(e) => draftEdit({ factualSummary: e.target.value })}
              />
            </Field>
            <Field label={t("impact")}>
              <textarea
                className={input}
                rows={3}
                value={draft.audienceImpact}
                onChange={(e) => draftEdit({ audienceImpact: e.target.value })}
              />
            </Field>
            <Field label={t("questions")}>
              <textarea
                className={input}
                rows={3}
                value={draft.verificationQuestions.join("\n")}
                onChange={(e) =>
                  draftEdit({
                    verificationQuestions: e.target.value
                      ? e.target.value.split("\n")
                      : [],
                  })
                }
              />
            </Field>
            <p className="text-xs text-ink-3">{t("questionHint")}</p>
            <button
              className={button}
              disabled={command.busy}
              onClick={() => void save("draft", "/draft", { draft }, "PATCH")}
            >
              {t("saveDraft")}
            </button>
          </>
        )}
        <p className="text-sm text-ink-3">{t("warning")}</p>
        <div className="flex flex-wrap gap-3">
          <button
            className={button}
            disabled={command.busy || dirty.length > 0}
            onClick={() => void save("review", "/verify", {})}
          >
            {t("verify")}
          </button>
          <a href={root + "/export"} download className={button}>
            {t("export")}
          </a>
        </div>
      </section>
    </div>
  );
}
