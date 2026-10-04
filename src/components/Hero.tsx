import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { SKILLS } from '../data/skills'
import { goToLibrary, setSearch, useSearch } from '../lib/search'
import { useSound } from '../lib/sound'

const EXAMPLES = ['לכתוב פוסט שמוכר', 'תסריט לרילס', 'בוט וואטסאפ ללידים', 'הצעת מחיר ללקוח']

// גיבור: שורה אחת שמסבירה מה יש כאן, וחיפוש גדול כפעולה הראשית
export function Hero() {
  const query = useSearch()
  const { play } = useSound()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    play('click')
    goToLibrary()
  }

  return (
    <section id="top" className="relative pt-36 pb-12 sm:pt-44 sm:pb-16">
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.h1
          dir="ltr"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="font-display text-5xl font-black leading-none tracking-tight [text-shadow:0_2px_18px_rgba(18,20,70,.35)] sm:text-7xl"
        >
          Prompt <span className="text-neon-gradient [text-shadow:none]">&</span> Play
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-5 max-w-xl text-xl font-medium leading-snug text-white [text-shadow:0_1px_10px_rgba(18,20,70,.45)] sm:text-2xl"
        >
          {SKILLS.length} פרומפטים מוכנים ל-AI שעושים עבודה אמיתית לעסק שלכם. בחינם.
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
            placeholder="מה תרצו ש-AI יעשה לעסק שלכם?"
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

        <p className="mt-6 text-sm text-white/85">{SKILLS.length} פרומפטים · בעברית · בלי הרשמה · מבית אקו מדיה</p>
      </div>
    </section>
  )
}
