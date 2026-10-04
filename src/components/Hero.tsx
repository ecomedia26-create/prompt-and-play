import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { Search } from 'lucide-react'
import { useEffect, type FormEvent } from 'react'
import { PROPRIETARY, SKILLS } from '../data/skills'
import { useIsTouch, usePrefersReducedMotion } from '../hooks/useIsTouch'
import { useA11y } from '../lib/a11y'
import { goToLibrary, setSearch, useSearch } from '../lib/search'
import { useSound } from '../lib/sound'

// רק הפרומפטים הפתוחים נספרים כ"חינם"; סקילי ה-5D נעולים
const FREE = SKILLS.filter((s) => !PROPRIETARY.has(s.category)).length

const EXAMPLES = ['לכתוב פוסט שמוכר', 'תסריט לרילס', 'בוט וואטסאפ ללידים', 'הצעת מחיר ללקוח']

// גיבור: שורה אחת שמסבירה מה יש כאן, וחיפוש גדול כפעולה הראשית
export function Hero() {
  const query = useSearch()
  const { play } = useSound()
  const touch = useIsTouch()
  const { calm } = useA11y()
  const prefersReduced = usePrefersReducedMotion()
  const still = calm || prefersReduced
  const narrow = typeof window !== 'undefined' && window.innerWidth < 480

  // גלילה: התוכן מתרחק לאט ונמוג, כאילו הגולש עף למעלה דרך העננים
  const { scrollY } = useScroll()
  const lift = useTransform(scrollY, [0, 500], [0, -120])
  const fade = useTransform(scrollY, [0, 420], [1, 0.15])
  const blur = useTransform(scrollY, [0, 420], ['blur(0px)', 'blur(6px)'])

  // עכבר: הכותרת נוטה ומרחפת בעדינות לכיוון הסמן
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotY = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 80, damping: 18 })
  const rotX = useSpring(useTransform(my, [-1, 1], [3, -3]), { stiffness: 80, damping: 18 })
  const shiftX = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 80, damping: 18 })
  useEffect(() => {
    if (touch || still) return
    const move = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1)
      my.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [touch, still, mx, my])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    play('click')
    goToLibrary()
  }

  return (
    <section id="top" className="relative pt-36 pb-12 sm:pt-44 sm:pb-16">
      <motion.div style={{ y: lift, opacity: fade, filter: blur }} className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="[perspective:900px]">
          <motion.h1
            dir="ltr"
            style={{ rotateX: rotX, rotateY: rotY, x: shiftX }}
            className="font-display text-5xl font-extrabold leading-none tracking-tight [text-shadow:0_2px_18px_rgba(18,20,70,.35)] sm:text-7xl lg:text-8xl"
          >
            {['Prompt', '&', 'Play'].map((w, i) => (
              <motion.span
                key={w}
                initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.1 + i * 0.14, type: 'spring', stiffness: 110, damping: 16 }}
                className={`inline-block ${w === '&' ? 'mx-3 font-light text-white/70' : ''}`}
              >
                {w}
              </motion.span>
            ))}
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-5 max-w-xl text-xl font-medium leading-snug text-white [text-shadow:0_1px_10px_rgba(18,20,70,.45)] sm:text-2xl"
        >
          {FREE} פרומפטים מוכנים ל-AI שעושים עבודה אמיתית לעסק שלכם. בחינם.
        </motion.p>

        <motion.form
          role="search"
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full bg-white p-1.5 shadow-xl shadow-[#141846]/25 sm:p-2"
        >
          <Search className="ms-3 h-5 w-5 shrink-0 text-[#4a4f9c] sm:h-6 sm:w-6" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={narrow ? 'מה AI יעשה לעסק שלכם?' : 'מה תרצו ש-AI יעשה לעסק שלכם?'}
            aria-label="חיפוש פרומפט"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-[#141846] outline-none placeholder:text-[#141846]/45 sm:text-lg"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-[#1c2160] px-5 py-2.5 font-bold text-white transition hover:bg-[#262c78] sm:px-7 sm:py-3"
          >
            חיפוש
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                play('click')
                setSearch(ex)
                goToLibrary()
              }}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              {ex}
            </button>
          ))}
        </motion.div>

        <p className="mt-6 text-sm text-white/85">{FREE} פרומפטים · בעברית · בלי הרשמה · מבית אקו מדיה</p>
      </motion.div>
    </section>
  )
}
