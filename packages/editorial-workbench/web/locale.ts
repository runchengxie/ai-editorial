import { en, type MessageKey } from "./locales/en.ts";
import { zh } from "./locales/zh-CN.ts";
export type Locale = "en" | "zh-CN";
export function message(locale: Locale, key: MessageKey): string {
  return (locale === "zh-CN" ? zh[key] : undefined) ?? en[key];
}
