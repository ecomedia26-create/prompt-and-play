import { AnimatePresence, motion } from 'framer-motion'
import { Search, ShieldCheck } from 'lucide-react'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { CATEGORIES, SKILLS, type CategoryId, type Skill } from '../data/skills'
import { useSound } from '../lib/sound'
import { SkillCard } from './SkillCard'
import { SkillModal } from './SkillModal'

export function Vault() {
  const [cat, setCat] = useState<CategoryId | 'all'>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<Skill | null>(null)
  const q = useDeferredValue(query.trim().toLowerCase())
  const { play } = useSound()

  const list = useMemo(
    () =>
      SKILLS.filter((s) => (cat === 'all' || s.category === cat) &&
        (!q || [s.title_he, s.title_en, s.short_desc, s.category_he, ...s.tags].join(' ').toLowerCase().includes(q))),
    [cat, q],
  )
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: SKILLS.length }
    SKILLS.forEach((s) => (c[s.category] = (c[s.category] ?? 0) + 1))
    return c
  }, [])
  const close = useCallback(() => setOpen(null), [])

  return (
    <section id="vault" className="relative scroll-mt-28 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p dir="ltr" className="text-end font-mono text-sm tracking-[0.3em] text-neon-blue lg:text-start">THE VAULT</p>
            <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">
              הכספת: <span className="text-neon-gradient">{SKILLS.length} סקילים</span> לעסקים
            </h2>
            <p className="mt-3 max-w-xl text-white/90">
              לחצו על כרטיסייה, העתיקו את הפרומפט והדביקו ב-Claude. חינם לגמרי, באדיבות אקו מדיה.
            </p>
          </div>
          <label className="glass flex w-full items-center gap-2 rounded-full px-4 py-3 focus-within:border-neon-blue/60 lg:w-80">
            <Search className="h-5 w-5 shrink-0 text-white/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש מהיר: וידאו, וואטסאפ, Suno..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
            />
          </label>
        </motion.div>

        <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
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
                className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? 'text-void' : 'glass text-white/70 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="cat-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: c.accent, boxShadow: `0 0 20px ${c.accent}88` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <span className="relative">
                  {c.label} <span className="opacity-60">({counts[c.id] ?? 0})</span>
                </span>
              </button>
            )
          })}
        </div>

        <motion.div layout className="grid auto-rows-[minmax(190px,auto)] grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((s, i) => (
              <SkillCard key={s.id} skill={s} index={i} onOpen={setOpen} />
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && (
          <p className="py-16 text-center text-white/50">לא נמצאו סקילים. נסו מילת חיפוש אחרת.</p>
        )}

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-white/85">
          <ShieldCheck className="h-4 w-4" />
          סקילי ה-5D מוצגים כהדגמה בלבד. ידע הפיתוח שמור בלעדית לאקו מדיה.
        </p>
      </div>
      <SkillModal skill={open} onClose={close} />
    </section>
  )
}
