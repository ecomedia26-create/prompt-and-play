import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpLeft, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { accentFor, SKILLS, type Skill } from '../data/skills'
import { aiAvailable } from '../lib/ai'
import { waLink } from '../lib/brand'
import { AGENCY_HINT, recommend } from '../lib/recommend'
import { openSkill } from '../lib/skillBus'
import { useSound } from '../lib/sound'
import { WhatsAppIcon } from './WhatsAppIcon'

interface Msg {
  role: 'user' | 'assistant'
  text: string
  skills?: Skill[]
  agency?: boolean
}

const STARTERS = ['פרסומת וידאו לעסק שלי', 'בוט וואטסאפ שמסנן לידים', 'פוסטים לרשתות החברתיות', 'אתר תלת-ממד לעסק']

const GREETING: Msg = {
  role: 'assistant',
  text: 'היי! ספרו לי במשפט מה העסק שלכם צריך, ואמליץ על הסקיל המתאים מהכספת.',
}

const byId = (ids: string[]) => ids.map((id) => SKILLS.find((s) => s.id === id)).filter((s): s is Skill => !!s)

function localAnswer(text: string): Msg {
  // בקשה לפתרון מותאם (אתר 5D, פיתוח, חיבור למערכות): מפנים לאקו מדיה ומציגים רק סקילים שממש מתאימים
  const custom = AGENCY_HINT.test(text)
  const skills = recommend(text, 3, custom ? 6 : 1)
  let reply = 'הנה מה שהכי מתאים לכם מהכספת. לחצו על סקיל כדי לראות אותו ולהעתיק:'
  if (custom) reply = 'את זה אקו מדיה בונה בהתאמה אישית לעסקים, כמו האתר שאתם גולשים בו עכשיו. שלחו הודעה ונחזור אליכם.'
  else if (!skills.length) reply = 'לא מצאתי סקיל מדויק לזה בכספת. נשמע כמו משהו שכדאי לבנות לכם בהתאמה אישית.'
  return { role: 'assistant', text: reply, skills, agency: custom || !skills.length }
}

// עוזר AI צף: עם מפתח ב-Vercel הוא משוחח דרך Claude, ובלעדיו ממליץ מקומית וחינם מתוך הקטלוג
export function AssistantChat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([GREETING])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const list = useRef<HTMLDivElement>(null)
  const { play } = useSound()

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, busy])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    play('click')
    const history = [...msgs, { role: 'user' as const, text: q }]
    setMsgs(history)
    setDraft('')
    setBusy(true)
    let answer: Msg | null = null
    if (await aiAvailable()) {
      try {
        const r = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: history.slice(1).map((m) => ({ role: m.role, content: m.text })) }),
        })
        if (r.ok) {
          const d = (await r.json()) as { reply: string; skill_ids: string[]; suggest_agency: boolean }
          answer = { role: 'assistant', text: d.reply, skills: byId(d.skill_ids), agency: d.suggest_agency }
        }
      } catch {
        // נופלים להמלצה המקומית
      }
    } else {
      await new Promise((r) => setTimeout(r, 450))
    }
    setMsgs((m) => [...m, answer ?? localAnswer(q)])
    setBusy(false)
    play('open')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void send(draft)
  }

  const lastQuestion = [...msgs].reverse().find((m) => m.role === 'user')?.text ?? ''

  return (
    <>
      <motion.button
        type="button"
        onClick={() => {
          play(open ? 'click' : 'open')
          setOpen(!open)
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-expanded={open}
        aria-label={open ? 'סגירת העוזר' : 'פתיחת עוזר ה-AI'}
        className="fixed bottom-5 right-5 z-[58] flex items-center gap-2 rounded-full border border-white/20 bg-[#1c2160]/90 p-3 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur sm:px-4"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? 'סגירה' : 'לא בטוחים? שאלו את העוזר'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="עוזר ה-AI של אקו מדיה"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="fixed bottom-20 right-3 left-3 z-[58] flex max-h-[70svh] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#14183f]/95 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-5 sm:w-[380px]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-void">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold leading-tight">העוזר של אקו מדיה</p>
                <p className="text-xs text-white/60">ממליץ על הסקיל המתאים לעסק שלכם</p>
              </div>
            </div>

            <div ref={list} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-start' : 'flex justify-end'}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user' ? 'rounded-ss-sm bg-neon-blue/90 text-void' : 'rounded-se-sm bg-white/10 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {!!m.skills?.length && (
                      <div className="mt-2.5 space-y-1.5">
                        {m.skills.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              play('open')
                              openSkill(s.id)
                            }}
                            className="flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-start transition hover:border-white/40"
                          >
                            <span>
                              <span className="block text-[11px] font-semibold" style={{ color: accentFor(s.category) }}>
                                {s.category_he}
                              </span>
                              <span className="block font-semibold">{s.title_he}</span>
                            </span>
                            <ArrowUpLeft className="h-4 w-4 shrink-0 text-white/60" />
                          </button>
                        ))}
                      </div>
                    )}
                    {m.agency && (
                      <a
                        href={waLink(`היי יצחק, הגעתי דרך העוזר של Prompt & Play. אני מחפש: ${lastQuestion}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => play('click')}
                        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-wa px-3 py-1.5 text-xs font-bold text-void"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                        לבנות את זה עם אקו מדיה
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-end">
                  <div className="flex gap-1 rounded-2xl bg-white/10 px-4 py-3">
                    {[0, 1, 2].map((d) => (
                      <motion.i
                        key={d}
                        className="h-2 w-2 rounded-full bg-white/70"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {msgs.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/85 transition hover:border-neon-blue hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/10 p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="מה העסק שלכם צריך?"
                maxLength={600}
                aria-label="הודעה לעוזר"
                className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm outline-none placeholder:text-white/45 focus:bg-white/15"
              />
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                aria-label="שליחה"
                className="grid h-10 w-10 place-items-center rounded-full bg-neon-blue text-void transition disabled:opacity-40"
              >
                <Send className="h-4 w-4 -scale-x-100" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
