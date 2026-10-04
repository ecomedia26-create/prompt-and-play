import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// קוד משותף לפונקציות השרת ב-Vercel. קבצים שמתחילים בקו תחתון לא הופכים לנתיב API.
// המפתח ANTHROPIC_API_KEY מוגדר רק בהגדרות הפרויקט ב-Vercel ולעולם לא נשלח לדפדפן.

export interface SkillRecord {
  id: string
  category: string
  title_he: string
  title_en: string
  tags: string[]
  short_desc: string
  system_prompt: string
}

export const MODEL = 'claude-opus-5-5'
// סקילי ה-5D הם ידע פנימי של אקו מדיה ולא נחשפים דרך ה-API
const PROPRIETARY = new Set(['development'])
export const WATERMARK = '// הונגש באהבה לקהילה ע"י אקו מדיה | לייעוץ ופיתוח פתרונות AI: 053-426-2621'

let cache: SkillRecord[] | null = null
export function publicSkills(): SkillRecord[] {
  // הקובץ נכלל בפונקציה דרך includeFiles ב-vercel.json
  cache ??= (JSON.parse(readFileSync(join(process.cwd(), 'src/data/public_skills_data.json'), 'utf8')) as SkillRecord[]).filter(
    (s) => !PROPRIETARY.has(s.category),
  )
  return cache
}

export const aiEnabled = () => !!process.env.ANTHROPIC_API_KEY
export const client = () => new Anthropic()

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

// הגבלת קצב בסיסית לכל IP (בזיכרון של המופע), כדי שהמפתח לא ינוצל לרעה
const hits = new Map<string, number[]>()
export function rateLimited(req: Request, max = 20, windowMs = 10 * 60_000) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > max
}

export function textOf(msg: Anthropic.Beta.BetaMessage) {
  return msg.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
}

export function apiErrorStatus(err: unknown) {
  if (err instanceof Anthropic.RateLimitError) return 429
  if (err instanceof Anthropic.APIError) return 502
  return 500
}
