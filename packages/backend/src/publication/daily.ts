// Public-only, unreviewed listing digest. Never reads internal topics, drafts or source bodies.
import type { Candidate } from '../sources/types.ts';
export interface DailySource {
  sourceId: string; sourceName: string; tier: string; ok: boolean; candidates: Candidate[];
}
export interface DailyItem {
  title: string; url: string; publishedAt: string; sourceId: string; sourceName: string;
  audience: 'finance' | 'development' | 'general';
}
export interface Edition {
  date: string; generatedAt: string; windowDays: 7;
  sources: { sourceId: string; sourceName: string; ok: boolean }[];
  items: DailyItem[];
}
const DAY = 86_400_000;
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
export function publicUrl(value: string): string | null {
  try {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) return null;
    for (const key of [...u.searchParams.keys()]) if (/^utm_|^(fbclid|gclid)$/i.test(key)) u.searchParams.delete(key);
    u.hash = ''; return u.toString();
  } catch { return null; }
}
export function editionDate(now: Date): string {
  return new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10);
}
function audience(title: string): DailyItem['audience'] {
  if (/data cent(?:er|re)|nuclear|electricity|\bsues\b|lawsuit|antitrust|brings together|数据中心|起诉/i.test(title)) return 'general';
  if (/financ|earnings|spreadsheet|excel|财报|投研|金融|财务/i.test(title)) return 'finance';
  if (/\b(api|sdk|code|coding|python|sql|dataset|analytics|agent|mcp|eval|developer|duckdb|pandas)\b|data (?:analysis|processing|automation)|开发|数据处理|数据分析|编程/i.test(title)) return 'development';
  return 'general';
}
export function selectEdition(rows: DailySource[], now = new Date()): Edition {
  if (!rows.length || rows.filter(r => r.ok).length / rows.length < .5) throw new Error('Source health below 50%; keeping previous publication');
  const candidates: (DailyItem & { score: number })[] = [];
  for (const row of rows.filter(r => r.ok)) for (const c of row.candidates) {
    const time = c.publishedAt?.getTime(); const url = publicUrl(c.url);
    if (!url || !c.title.trim() || !Number.isFinite(time) || time! > now.getTime() || time! < now.getTime() - 7 * DAY) continue;
    const group = audience(c.title);
    candidates.push({title:c.title.trim().slice(0,500),url,publishedAt:new Date(time!).toISOString(),
      sourceId:row.sourceId,sourceName:row.sourceName,audience:group,
      score:(group==='finance'?8:group==='development'?5:0)+(row.tier==='T1'?2:0)+(time!-(now.getTime()-7*DAY))/DAY});
  }
  candidates.sort((a,b)=>b.score-a.score || b.publishedAt.localeCompare(a.publishedAt) || a.url.localeCompare(b.url));
  const urls = new Set<string>(); const counts = new Map<string,number>(); const items: DailyItem[] = [];
  for (const {score:_,...item} of candidates) {
    if (urls.has(item.url) || (counts.get(item.sourceId)??0)>=2) continue;
    urls.add(item.url); counts.set(item.sourceId,(counts.get(item.sourceId)??0)+1);items.push(item);
    if(items.length===8)break;
  }
  if(!items.length)throw new Error('No eligible dated entries; keeping previous publication');
  return {date:editionDate(now),generatedAt:now.toISOString(),windowDays:7,
    sources:rows.map(r=>({sourceId:r.sourceId,sourceName:r.sourceName,ok:r.ok})),items};
}
// Validate and whitelist prior public state before retaining it. Never spread arbitrary archive objects.
export function restoreEditions(value: unknown, now = new Date()): Edition[] {
  if(!Array.isArray(value) || value.length>30)throw new Error('Invalid archive');
  const text=(v:unknown,max=500):string=>{if(typeof v!=='string'||!v.length||v.length>max)throw new Error('Invalid archive text');return v;};
  const editions: Edition[]=[];
  for(const raw of value){
    if(!raw||typeof raw!=='object')throw new Error('Invalid archive edition');
    const date=text(raw.date,10), generatedAt=text(raw.generatedAt,30);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!ISO_TIME.test(generatedAt)||!Number.isFinite(Date.parse(generatedAt))||editionDate(new Date(generatedAt))!==date||Date.parse(generatedAt)>now.getTime()||raw.windowDays!==7)throw new Error('Invalid archive date');
    if(now.getTime()-Date.parse(generatedAt)>30*DAY)continue;
    if(!Array.isArray(raw.items)||raw.items.length<1||raw.items.length>8||!Array.isArray(raw.sources)||raw.sources.length>100)throw new Error('Invalid archive bounds');
    const sources=raw.sources.map((s:any)=>{if(typeof s?.ok!=='boolean')throw new Error('Invalid archive source');return {sourceId:text(s.sourceId,150),sourceName:text(s.sourceName),ok:s.ok};});
    const items=raw.items.map((i:any):DailyItem=>{
      if(!i||!['finance','development','general'].includes(i.audience)||!publicUrl(i.url)||!ISO_TIME.test(i.publishedAt)||!Number.isFinite(Date.parse(i.publishedAt)))throw new Error('Invalid archive item');
      return {title:text(i.title),url:publicUrl(i.url)!,publishedAt:new Date(text(i.publishedAt,30)).toISOString(),sourceId:text(i.sourceId,150),sourceName:text(i.sourceName),audience:i.audience};
    });
    editions.push({date,generatedAt:new Date(generatedAt).toISOString(),windowDays:7,sources,items});
  }
  return editions.sort((a,b)=>b.date.localeCompare(a.date));
}
