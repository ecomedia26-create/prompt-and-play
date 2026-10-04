import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { CATEGORIES, POPULAR, SKILLS, type CategoryId, type Skill } from '../data/skills'
import { recommend } from '../lib/recommend'
import { setSearch, useSearch } from '../lib/search'
import { onOpenSkill } from '../lib/skillBus'
import { useSound } from '../lib/sound'
import { RevealTitle } from './RevealTitle'
import { SkillCard } from './SkillCard'
import { SkillModal } from './SkillModal'

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <RevealTitle className="text-[clamp(2.6rem,8vw,7rem)] leading-[0.95] tracking-tight">{title}</RevealTitle>
      <p className="mt-2 max-w-2xl text-white/85">{sub}</p>
    </div>
  )
}

// "התחילו כאן" + הספרייה המלאה עם סינון וחיפוש. המודאל של הפרומפט יושב כאן ונפתח דרך openSkill
export function Library() {
  const [cat, setCat] = useState<CategoryId | 'all'>('all')
  const [open, setOpen] = useState<Skill | null>(null)
  const query = useSearch()
  const q = useDeferredValue(query.trim())
  const { play } = useSound()

  const popular = useMemo(() => POPULAR.map((id) => SKILLS.find((s) => s.id === id)).filter((s): s is Skill => !!s), [])
  const list = useMemo(() => {
    const pool = SKILLS.filter((s) => cat === 'all' || s.category === cat)
    if (!q) return pool
    // חיפוש חופשי בעברית: מדורג לפי התאמה, כך שהתוצאה הכי רלוונטית ראשונה
    const hits = recommend(q, pool.length, 2, pool)
    return hits.length ? hits : pool.filter((s) => s.title_he.includes(q) || s.short_desc.includes(q))
  }, [cat, q])
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: SKILLS.length }
    SKILLS.forEach((s) => (c[s.category] = (c[s.category] ?? 0) + 1))
    return c
  }, [])
  const close = useCallback(() => setOpen(null), [])

  // פתיחה מבחוץ: כרטיס, עוזר ה-AI, או קישור שיתוף עם ?skill=<id>
  useEffect(() => {
    const show = (id: string) => {
      const s = SKILLS.find((x) => x.id === id)
      if (s) setOpen(s)
    }
    const fromUrl = new URLSearchParams(window.location.search).get('skill')
    if (fromUrl) show(fromUrl)
    return onOpenSkill(show)
  }, [])

  return (
    <>
      <section id="start" className="relative scroll-mt-24 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="התחילו כאן" sub="ששת הפרומפטים שהכי שווים לעסק קטן. לוחצים העתק, מדביקים ב-Claude או ב-ChatGPT, וזהו." />
          <div className={GRID.replace('xl:grid-cols-4', '')}>
            {popular.map((s, i) => (
              <SkillCard key={s.id} skill={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section id="library" className="relative scroll-mt-24 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle title="הספרייה" sub={`כל ${SKILLS.length} הפרומפטים, לפי תחום. לחצו "התאמה לעסק" כדי למלא את הפרטים שלכם לפני ההעתקה.`} />
            <label className="glass mb-6 flex w-full items-center gap-2 rounded-full px-4 py-2.5 focus-within:border-white/50 lg:w-80">
              <Search className="h-5 w-5 shrink-0 text-white/50" />
              <input
                type="search"
                value={query}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="חיפוש: פוסט, וואטסאפ, רילס..."
                aria-label="חיפוש בספרייה"
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/45"
              />
            </label>
          </div>

          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
            {CATEGORIES.map((c) => {
              const active = cat === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    play('click')
                    setCat(c.id)
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? 'bg-white text-[#141846]' : 'glass text-white/80 hover:text-white'
                  }`}
                >
                  {c.label} <span className="opacity-60">({counts[c.id] ?? 0})</span>
                </button>
              )
            })}
          </div>

          {q && (
            <p className="mb-4 flex items-center gap-2 text-sm text-white/85">
              {list.length} תוצאות עבור "{q}"
              <button
                type="button"
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-1 rounded-full border border-white/25 px-2.5 py-0.5 text-xs hover:bg-white/10"
              >
                <X className="h-3 w-3" />
                ניקוי
              </button>
            </p>
          )}

          <motion.div layout className={GRID}>
            <AnimatePresence mode="popLayout">
              {list.map((s, i) => (
                <SkillCard key={s.id} skill={s} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>

          {list.length === 0 && <p className="py-16 text-center text-white/70">לא מצאנו פרומפט כזה. נסו מילה אחרת.</p>}
        </div>
      </section>
      <SkillModal skill={open} onClose={close} />
    </>
  )
}
