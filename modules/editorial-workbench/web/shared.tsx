import { useEffect, useState, cloneElement, type ReactElement } from "react";
import { message, type Locale } from "./locale.ts";
import type { MessageKey } from "./locales/en.ts";
export function useLocale() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    try {
      if (localStorage.getItem("editorial.locale") === "zh-CN")
        setLocale("zh-CN");
    } catch {}
  }, []);
  const choose = (v: Locale) => {
    setLocale(v);
    try {
      localStorage.setItem("editorial.locale", v);
    } catch {}
  };
  return { locale, choose, t: (key: MessageKey) => message(locale, key) };
}
export const input =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-ink";
export const button =
  "rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-accent disabled:opacity-50";
export const panel = "rounded-xl border border-line bg-surface p-4 sm:p-6";
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ "aria-label"?: string }>;
}) {
  return (
    <label className="grid gap-1.5 text-sm text-ink-2">
      {label}
      {cloneElement(children, { "aria-label": label })}
    </label>
  );
}
export function Language({
  locale,
  choose,
  t,
}: {
  locale: Locale;
  choose: (l: Locale) => void;
  t: (k: MessageKey) => string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      {t("language")}
      <select
        aria-label={t("language")}
        className={input}
        value={locale}
        onChange={(e) => choose(e.target.value as Locale)}
      >
        <option value="en">English</option>
        <option value="zh-CN">简体中文</option>
      </select>
    </label>
  );
}
export function useCommand(csrf: string, t: (k: MessageKey) => string) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  async function run<T>(
    method: string,
    path: string,
    body: unknown,
  ): Promise<T | null> {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const r = await fetch(path, {
        method,
        headers: { "content-type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail ?? t("failed"));
      setNotice(t("saved"));
      return data as T;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("failed"));
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { run, error, notice, busy };
}
