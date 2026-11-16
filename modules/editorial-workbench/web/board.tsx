import { useState } from "react";
import { data, Form, Link, useNavigate, useSearchParams } from "react-router";
import {
  adminPageGet,
  GRAY_HEADERS,
} from "../../../apps/web/app/lib/admin.server.ts";
import type { Topic, TopicDetail } from "../contracts.ts";
import { STATUSES, AUDIENCES } from "../contracts.ts";
import {
  useLocale,
  Language,
  useCommand,
  Field,
  input,
  button,
  panel,
} from "./shared.tsx";
export async function loader({ request }: { request: Request }) {
  const u = new URL(request.url);
  const query = new URLSearchParams();
  for (const k of ["status", "audience", "q", "cursor"])
    if (u.searchParams.get(k)) query.set(k, u.searchParams.get(k)!);
  const me = await adminPageGet<{ csrf: string }>(request, "/api/admin/me");
  const topics = await adminPageGet<{
    rows: Topic[];
    nextCursor: string | null;
  }>(request, "/api/admin/editorial/topics?" + query);
  return data({ ...topics, csrf: me.csrf }, { headers: GRAY_HEADERS });
}
export const headers = () => GRAY_HEADERS;
export default function Board({
  loaderData,
}: {
  loaderData: { rows: Topic[]; nextCursor: string | null; csrf: string };
}) {
  const [params] = useSearchParams();
  const { locale, choose, t } = useLocale();
  const command = useCommand(loaderData.csrf, t);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<
    { id: string; title: string; source: string }[] | null
  >(null);
  const [searchError, setSearchError] = useState("");
  const [audiences, setAudiences] = useState<string[]>([
    "finance-research",
    "development",
  ]);
  async function search() {
    setSearchError("");
    try {
      const r = await fetch("/api/admin/content?q=" + encodeURIComponent(q));
      const v = await r.json();
      if (!r.ok) throw new Error(v.detail ?? t("failed"));
      setRows(v.rows);
    } catch {
      setSearchError(t("failed"));
    }
  }
  return (
    <div className="space-y-6" lang={locale}>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wider text-ink-3">
            {t("privateLabel")}
          </p>
          <h1 className="text-2xl font-semibold">{t("boardTitle")}</h1>
          <p className="mt-2 text-sm text-ink-3">{t("intro")}</p>
        </div>
        <Language {...{ locale, choose, t }} />
      </header>
      <section className={panel}>
        <h2 className="mb-4 font-semibold">{t("sourceSearch")}</h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void search();
          }}
        >
          <input
            aria-label={t("sourceSearch")}
            className={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className={button} disabled={!q.trim()}>
            {t("search")}
          </button>
        </form>
        <div className="my-4 flex flex-wrap gap-5">
          {AUDIENCES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={audiences.includes(a)}
                onChange={(e) =>
                  setAudiences(
                    e.target.checked
                      ? [...audiences, a]
                      : audiences.filter((x) => x !== a),
                  )
                }
              />
              {t(a === "development" ? "development" : "finance")}
            </label>
          ))}
        </div>
        {searchError && <p role="alert">{searchError}</p>}
        {rows?.length === 0 && (
          <p className="text-sm text-ink-3">{t("searchEmpty")}</p>
        )}
        {rows?.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-3"
          >
            <div>
              <p>{r.title}</p>
              <small className="text-ink-3">{r.source}</small>
            </div>
            <button
              className={button}
              disabled={command.busy || !audiences.length}
              onClick={async () => {
                const v = await command.run<TopicDetail>(
                  "POST",
                  "/api/admin/editorial/topics",
                  { articleId: r.id, audiences },
                );
                if (v) navigate("/admin/editorial/" + v.id);
              }}
            >
              {t("importTopic")}
            </button>
          </div>
        ))}
        <Link
          className="mt-3 inline-block text-sm text-accent"
          to="/admin/sources"
        >
          {t("sourceAdmin")}
        </Link>
      </section>
      {command.error && <p role="alert">{command.error}</p>}
      <Form className="flex flex-wrap gap-3">
        <Field label={t("status")}>
          <select
            name="status"
            className={input}
            defaultValue={params.get("status") ?? ""}
          >
            <option value="">{t("all")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("audience")}>
          <select
            name="audience"
            className={input}
            defaultValue={params.get("audience") ?? ""}
          >
            <option value="">{t("all")}</option>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {t(a === "development" ? "development" : "finance")}
              </option>
            ))}
          </select>
        </Field>
        <button className={button}>{t("search")}</button>
      </Form>
      <section className="grid gap-3">
        {loaderData.rows.length === 0 && <p className={panel}>{t("empty")}</p>}
        {loaderData.rows.map((topic) => (
          <Link
            to={"/admin/editorial/" + topic.id}
            key={topic.id}
            className={panel + " block hover:border-accent"}
          >
            <h2 className="font-semibold">{topic.title}</h2>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-3">
              <span>{t(topic.status)}</span>
              <span>{t(topic.reviewStatus)}</span>
              {topic.audiences.map((a) => (
                <span key={a}>
                  {t(a === "development" ? "development" : "finance")}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
      {loaderData.nextCursor && (
        <Link
          className={button}
          to={
            "?" +
            new URLSearchParams({
              ...Object.fromEntries(params),
              cursor: loaderData.nextCursor,
            })
          }
        >
          {t("next")}
        </Link>
      )}
    </div>
  );
}
