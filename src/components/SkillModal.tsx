import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Lock, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { accentFor, PROPRIETARY, type Skill } from '../data/skills'
import { BRAND, withWatermark } from '../lib/brand'
import { useSound } from '../lib/sound'
import { WhatsAppButton } from './WhatsAppButton'

interface Props {
  skill: Skill | null
  onClose: () => void
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // גיבוי לדפדפנים ישנים / הקשר לא מאובטח
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

// מודאל פופ-אפ: תצוגת הפרומפט (LTR) + העתקה בלחיצה אחת עם חתימת Watermark של אקו מדיה
export function SkillModal({ skill, onClose }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { play } = useSound()

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

  const copied = !!skill && copiedId === skill.id
  const locked = skill ? PROPRIETARY.has(skill.category) : false
  const accent = skill ? accentFor(skill.category) : '#00F0FF'

  const onCopy = async () => {
    if (!skill || locked) return
    if (await copyText(withWatermark(skill.system_prompt))) {
      play('copy')
      setCopiedId(skill.id)
      setTimeout(() => setCopiedId(null), 2400)
    }
  }

  return (
    <AnimatePresence>
      {skill && (
        <motion.div
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
            initial={{ y: 60, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 40, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="neon-border relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-[#12153d] p-6 sm:rounded-3xl sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="סגירה"
              className="absolute top-4 end-4 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-xs font-semibold" style={{ color: accent }}>
              {skill.category_he}
            </span>
            <h2 id="skill-title" className="mt-1 font-display text-2xl font-black sm:text-3xl">
              {skill.title_he}
            </h2>
            <p dir="ltr" className="text-end font-mono text-xs text-white/40">
              {skill.title_en}
            </p>
            <p className="mt-3 text-white/75">{skill.short_desc}</p>

            {locked ? (
              <div className="mt-6 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/5 p-6 text-center">
                <Lock className="mx-auto h-8 w-8 text-fuchsia-300" />
                <h3 className="mt-3 text-lg font-bold">ידע 5D בלעדי לאקו מדיה</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                  ארכיטקטורת אתרי ה-5D, השיידרים וחוויות התלת-ממד נשמרים כנכס פנימי של הסוכנות. האתר הזה הוא ההדגמה החיה. רוצים
                  חוויה כזו לעסק שלכם?
                </p>
                <WhatsAppButton
                  className="mt-5"
                  label="בנו לי אתר 5D"
                  message={`היי יצחק, הגעתי דרך Prompt & Play וראיתי את "${skill.title_he}". אשמח לשמוע על פיתוח אתר 5D לעסק שלי.`}
                />
              </div>
            ) : (
              <>
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-2" dir="ltr">
                    <span className="flex gap-1.5">
                      <i className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                      <i className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                      <i className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                    </span>
                    <span className="font-mono text-[11px] text-white/40">{skill.id}.prompt</span>
                  </div>
                  <pre
                    dir={/[֐-׿]/.test(skill.system_prompt.slice(0, 10)) ? 'rtl' : 'ltr'}
                    className="max-h-72 overflow-auto whitespace-pre-wrap p-4 text-start font-mono text-[13px] leading-relaxed text-neon-blue/90"
                  >
                    {skill.system_prompt}
                    {'\n\n'}
                    <span dir="rtl" className="block text-white/35">
                      {BRAND.watermark}
                    </span>
                  </pre>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    type="button"
                    onClick={onCopy}
                    whileTap={{ scale: 0.97 }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold transition ${
                      copied
                        ? 'bg-wa text-void shadow-glow-wa'
                        : 'bg-gradient-to-l from-neon-blue to-neon-purple text-void shadow-glow-blue hover:brightness-110'
                    }`}
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    {copied ? 'הועתק! הדביקו ב-Claude' : 'העתק סקיל בלחיצה אחת'}
                  </motion.button>
                  <WhatsAppButton
                    size="sm"
                    label="רוצים גרסה מותאמת לעסק?"
                    className="justify-center py-3.5"
                    message={`היי יצחק, הגעתי דרך Prompt & Play והעתקתי את "${skill.title_he}". אשמח לגרסה מותאמת אישית לעסק שלי.`}
                  />
                </div>
                <p className="mt-3 text-center text-xs text-white/40">
                  ההעתקה כוללת חתימת קרדיט של אקו מדיה. טיפ: הדביקו כ-System Prompt בפרויקט ייעודי ב-Claude.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
