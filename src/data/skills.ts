import raw from './public_skills_data.json'
import templates from './templates_he.json'

export type CategoryId = 'development' | 'video_ads' | 'vfx_editing' | 'business_bots'
export type GridSize = 'large' | 'medium' | 'compact'

export interface Skill {
  id: string
  category: CategoryId
  category_he: string
  title_en: string
  title_he: string
  grid_size: GridSize
  tags: string[]
  short_desc: string
  system_prompt: string
  attribution: string
  // תבנית עברית מלאה עם שדות מילוי (templates_he.json); לסקילי ה-5D הנעולים אין תבנית
  outcome_he?: string
  tools?: string[]
  variables?: Variable[]
  example_output_he?: string
  template_he?: string
}

export interface Variable {
  key: string
  label_he: string
  placeholder: string
}

const ORDER: CategoryId[] = ['business_bots', 'video_ads', 'vfx_editing', 'development']

// המקור: public_skills_data.json מתיקיית הדרייב. להחלפת הקטלוג מחליפים רק את קובץ ה-JSON.
const TEMPLATES = templates as Record<string, Partial<Skill>>

export const SKILLS: Skill[] = [...(raw as Skill[])]
  .map((s) => ({ ...s, ...TEMPLATES[s.id] }))
  .sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category))

// "התחילו כאן": הפרומפטים הכי שימושיים לעסק קטן
export const POPULAR = [
  'israeli-whatsapp-funnel',
  'b2b-offer-architect',
  'viral-hook-scriptwriter',
  'social-media-manager',
  'ad-agency-creative-director',
  'ugc-tiktok-producer',
]

// הפרומפט המלא עם הערכים שהגולש מילא; שדה ריק מקבל את הדוגמה שלו
export function fillPrompt(skill: Skill, values: Record<string, string> = {}) {
  if (!skill.template_he) return skill.system_prompt
  const vars = new Map(skill.variables?.map((v) => [v.key, v]))
  return skill.template_he.replace(/\{\{(\w+)\}\}/g, (m, key: string) => values[key]?.trim() || vars.get(key)?.placeholder || m)
}

// קטגוריית ה-5D היא נכס בלעדי של אקו מדיה: מוצגת כ-Showcase נעול, הפרומפט לא ניתן להעתקה.
export const PROPRIETARY: ReadonlySet<CategoryId> = new Set(['development'])

export const CATEGORIES: { id: CategoryId | 'all'; label: string; accent: string }[] = [
  { id: 'all', label: 'הכל', accent: '#ffffff' },
  { id: 'business_bots', label: 'בוטים ושיווק לעסקים', accent: '#25D366' },
  { id: 'video_ads', label: 'פרסומות וידאו וקולנוע', accent: '#00F0FF' },
  { id: 'vfx_editing', label: 'עריכת וידאו ואפקטים', accent: '#9333EA' },
  { id: 'development', label: 'חוויות 5D (בלעדי)', accent: '#F0ABFC' },
]

export const accentFor = (c: CategoryId) =>
  CATEGORIES.find((x) => x.id === c)?.accent ?? '#00F0FF'
