import { PROPRIETARY, SKILLS, type CategoryId, type Skill } from '../data/skills'

// המלצה מקומית וחינמית (בלי שרת ובלי AI): ניקוד לפי מילים מהקטלוג ומילון נרדפות עברי.
// משמשת כשאין מפתח AI מוגדר ב-Vercel, או כשהשרת לא זמין.

const SYNONYMS: [RegExp, CategoryId | string[]][] = [
  [/וידא|סרטו|פרסומ|קולנוע|ריל|טיקטוק|יוטיוב|מודעה|קמפיין|veo|sora|kling|runway/i, 'video_ads'],
  [/עריכ|אפקט|כתוביות|after|ffmpeg|premiere|davinci|צבע|vfx/i, 'vfx_editing'],
  [/בוט|וואטסאפ|ווטסאפ|whatsapp|לקוח|לידים|ליד|מכיר|שיווק|פוסט|תוכן|אינסטגרם|פייסבוק|לינקדאין|מייל|מסעדה|הזמנ|תור|פגיש|נדל|מחיר|הצע/i, 'business_bots'],
  [/מוזיק|שיר|ג'ינגל|ג׳ינגל|סאונד|suno|קריינ|קול/i, ['suno', 'music', 'audio', 'voice', 'jingle']],
  [/תמונ|עיצוב|לוגו|באנר|midjourney|image|גרפיק/i, ['image', 'midjourney', 'design', 'visual']],
  [/פוסט|רשתות|אינסטגרם|פייסבוק/i, ['פוסט', 'רשתות', 'קופי']],
  [/הצע.{0,3}מחיר|הצעת/i, ['הצע', 'high-ticket', 'proposal']],
  [/ריל|טיקטוק|reels/i, ['reels', 'הוק', 'רילס']],
  [/ליד/i, ['לידים', 'סינון']],
]

const tokenize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
    // הסרת אותיות שימוש נפוצות בעברית (ה, ו, ב, ל, מ, ש) כדי ש"לוידאו" יתאים ל"וידאו"
    .map((w) => (/^[הובלמש][֐-׿]{3,}$/.test(w) ? w.slice(1) : w))

export const isPublic = (s: Skill) => !PROPRIETARY.has(s.category)

export function recommend(query: string, limit = 3, minScore = 1, pool: Skill[] = SKILLS.filter(isPublic)): Skill[] {
  const words = tokenize(query)
  const cats = new Set<string>()
  const extra: string[] = []
  for (const [re, hit] of SYNONYMS) {
    if (!re.test(query)) continue
    if (Array.isArray(hit)) extra.push(...hit)
    else cats.add(hit)
  }
  const scored = pool.map((s) => {
    // התאמה בשם או ב"מה תקבלו" שווה יותר מהתאמה בתיאור או בתגיות
    const head = [s.title_he, s.title_en, s.outcome_he ?? ''].join(' ').toLowerCase()
    const hay = [s.short_desc, s.category_he, ...(s.tools ?? []), ...s.tags].join(' ').toLowerCase()
    let score = cats.has(s.category) ? 1 : 0
    for (const w of [...words, ...extra]) {
      if (head.includes(w)) score += w.length > 3 ? 4 : 2
      else if (hay.includes(w)) score += w.length > 3 ? 2 : 1
    }
    if (s.tags.some((t) => words.includes(t.toLowerCase()))) score += 3
    return { s, score }
  })
  return scored
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s)
}

export const AGENCY_HINT = /אתר|5d|תלת|מותא|פיתוח|לבנות לי|תבנו|חיבור|crm|api|אוטומצי מלא/i
