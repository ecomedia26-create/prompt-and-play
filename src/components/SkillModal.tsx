import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Copy, ExternalLink, Lock, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fillPrompt, PROPRIETARY, type Skill } from '../data/skills'
import { BRAND, waLink, withWatermark } from '../lib/brand'
import { chatgptUrl, claudeUrl, copyText } from '../lib/copy'
import { celebrateCopy } from '../lib/copyFx'
import { useSound } from '../lib/sound'
import { ShareRow } from './ShareRow'
import { TryItNow } from './TryItNow'
import { WhatsAppButton } from './WhatsAppButton'

interface Props {
  skill: Skill | null
  onClose: () => void
}

// טופס מילוי + תצוגה חיה של הפרומפט, והעתקה / פתיחה ישירה ב-Claude או ב-ChatGPT
function PromptBuilder({ skill }: { skill: Skill }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const { play } = useSound()
  const prompt = withWatermark(fillPrompt(skill, values))

  const onCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget
    if (await copyText(prompt)) {
      play('copy')
      celebrateCopy(btn)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    }
  }

  const linkBtn =
    'inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10'

  return (
    <>
      {!!skill.variables?.length && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-white/90">1. מלאו את פרטי העסק (אפשר להשאיר את הדוגמה)</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {skill.variables.map((v) => (
              <label key={v.key} className="block text-sm">
                <span className="mb-1 block text-white/75">{v.label_he}</span>
                <input
                  value={values[v.key] ?? ''}
                  onChange={(e) => setValues((x) => ({ ...x, [v.key]: e.target.value }))}
                  placeholder={v.placeholder}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 outline-none transition placeholder:text-white/35 focus:border-white/50 focus:bg-white/10"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <h3 className="mt-6 text-sm font-bold text-white/90">2. הפרומפט שלכם</h3>
      <pre
        dir={skill.template_he ? 'rtl' : 'ltr'}
        className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/40 p-4 text-start font-sans text-[13px] leading-relaxed text-white/85"
      >
        {prompt}
      </pre>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <motion.button
          type="button"
          onClick={onCopy}
          whileTap={{ scale: 0.97 }}
          className={`inline-flex flex-[1.4] items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition ${
            copied ? 'bg-wa text-void' : 'bg-white text-[#141846] hover:bg-white/90'
          }`}
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          {copied ? 'הועתק! הדביקו בצ׳אט' : 'העתק'}
        </motion.button>
        <a href={claudeUrl(prompt)} target="_blank" rel="noopener" onClick={() => play('click')} className={linkBtn}>
          פתח ב-Claude <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a href={chatgptUrl(prompt)} target="_blank" rel="noopener" onClick={() => play('click')} className={linkBtn}>
          פתח ב-ChatGPT <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {skill.example_output_he && (
        <details className="group mt-5 rounded-2xl border border-white/10 bg-white/5">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
            דוגמה לתוצאה שתקבלו
            <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <p className="whitespace-pre-wrap px-4 pb-4 text-sm leading-relaxed text-white/75">{skill.example_output_he}</p>
        </details>
      )}

      <p className="mt-4 text-center text-xs text-white/55">
        רוצים גרסה מותאמת אישית לעסק?{' '}
        <a
          href={waLink(`היי יצחק, הגעתי דרך Prompt & Play והשתמשתי ב"${skill.title_he}". אשמח לגרסה מותאמת לעסק שלי.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-wa underline-offset-2 hover:underline"
        >
          דברו עם {BRAND.nameHe}
        </a>
      </p>
      <TryItNow skill={skill} />
    </>
  )
}

export function SkillModal({ skill, onClose }: Props) {
  useEffect(() => {
    if (!skill) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [skill, onClose])

  const locked = skill ? PROPRIETARY.has(skill.category) : false

  return (
    <AnimatePresence>
      {skill && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#0b0d2a]/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="skill-title"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            className="relative flex max-h-[92svh] w-full max-w-2xl flex-col rounded-t-3xl border border-white/15 bg-[#14183f] shadow-2xl sm:rounded-3xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="סגירה"
              className="absolute top-4 end-4 z-10 rounded-full bg-[#14183f]/80 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-y-auto overscroll-contain p-6 sm:p-8">
              <span className="text-xs font-semibold text-white/60">
                {skill.category_he}
              </span>
              <h2 id="skill-title" className="mt-1 pe-10 font-display text-2xl font-black sm:text-3xl">
                {skill.title_he}
              </h2>
              <p className="mt-2 text-white/80">{skill.outcome_he ?? skill.short_desc}</p>

              {locked ? (
                <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
                  <Lock className="mx-auto h-8 w-8 text-white/70" />
                  <h3 className="mt-3 text-lg font-bold">ידע 5D בלעדי לאקו מדיה</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                    ארכיטקטורת אתרי ה-5D, השיידרים וחוויות התלת-ממד נשמרים כנכס פנימי של הסוכנות. האתר הזה הוא ההדגמה החיה.
                    רוצים חוויה כזו לעסק שלכם?
                  </p>
                  <WhatsAppButton
                    className="mt-5"
                    label="בנו לי אתר 5D"
                    message={`היי יצחק, הגעתי דרך Prompt & Play וראיתי את "${skill.title_he}". אשמח לשמוע על פיתוח אתר 5D לעסק שלי.`}
                  />
                </div>
              ) : (
                <PromptBuilder key={skill.id} skill={skill} />
              )}
              <ShareRow skill={skill} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
