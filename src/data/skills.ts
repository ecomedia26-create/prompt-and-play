import raw from './public_skills_data.json'

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
}

const ORDER: CategoryId[] = ['video_ads', 'vfx_editing', 'business_bots', 'development']

// המקור: public_skills_data.json מתיקיית הדרייב. להחלפת הקטלוג מחליפים רק את קובץ ה-JSON.
export const SKILLS = [...(raw as Skill[])].sort(
  (a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category),
)

// קטגוריית ה-5D היא נכס בלעדי של אקו מדיה: מוצגת כ-Showcase נעול, הפרומפט לא ניתן להעתקה.
export const PROPRIETARY: ReadonlySet<CategoryId> = new Set(['development'])

export const CATEGORIES: { id: CategoryId | 'all'; label: string; accent: string }[] = [
  { id: 'all', label: 'הכל', accent: '#ffffff' },
  { id: 'video_ads', label: 'פרסומות וידאו וקולנוע', accent: '#00F0FF' },
  { id: 'vfx_editing', label: 'עריכת וידאו ואפקטים', accent: '#9333EA' },
  { id: 'business_bots', label: 'בוטים ושיווק לעסקים', accent: '#25D366' },
  { id: 'development', label: 'חוויות 5D (בלעדי)', accent: '#F0ABFC' },
]

export const accentFor = (c: CategoryId) =>
  CATEGORIES.find((x) => x.id === c)?.accent ?? '#00F0FF'
