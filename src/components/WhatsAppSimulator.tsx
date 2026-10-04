import { AnimatePresence, motion, useInView } from 'framer-motion'
import { CheckCheck, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSound } from '../lib/sound'
import { WhatsAppButton } from './WhatsAppButton'

type Msg = { from: 'bot' | 'user'; text: string }

const SCENARIOS: { id: string; label: string; bot: string; script: Msg[] }[] = [
  {
    id: 'leads',
    label: 'סינון לידים',
    bot: 'סוכן הלידים של העסק',
    script: [
      { from: 'user', text: 'היי, ראיתי את המודעה שלכם, אפשר פרטים?' },
      { from: 'bot', text: 'היי! שמח שפנית 🙌 כדי שאתאים לך בדיוק, 3 שאלות קצרות. במה העסק שלך עוסק?' },
      { from: 'user', text: 'יש לי סטודיו לפילאטיס בחיפה' },
      { from: 'bot', text: 'מעולה! ומתי היית רוצה שהקמפיין יעלה לאוויר?' },
      { from: 'user', text: 'עד סוף החודש' },
      { from: 'bot', text: 'ובערך איזה תקציב חודשי לקחת בחשבון?' },
      { from: 'user', text: 'בסביבות 3,000 ₪' },
      { from: 'bot', text: 'תודה! סיכמתי הכל ✅ נציג יחזור אליך היום. רוצה כבר לקבוע שיחה קצרה ליום ראשון ב-10:00?' },
    ],
  },
  {
    id: 'restaurant',
    label: 'הזמנה ממסעדה',
    bot: 'בוט ההזמנות של הפיצרייה',
    script: [
      { from: 'user', text: 'אפשר להזמין משלוח?' },
      { from: 'bot', text: 'בטח! 🍕 המנה של היום: פיצה טרטופו ב-20% הנחה. מה בא לך?' },
      { from: 'user', text: 'פיצה משפחתית עם זיתים' },
      { from: 'bot', text: 'בחירה מצוינת! להוסיף לחם שום ושתייה גדולה ב-15 ₪ בלבד?' },
      { from: 'user', text: 'יאללה, כן' },
      { from: 'bot', text: 'סגור! לאיזו כתובת לשלוח ומה מספר הטלפון?' },
      { from: 'user', text: 'הרצל 12, רמת גן. 050-0000000' },
      { from: 'bot', text: 'ההזמנה התקבלה ✅ זמן משלוח משוער: 35 דקות. בתיאבון!' },
    ],
  },
  {
    id: 'realestate',
    label: 'עוזר נדל"ן',
    bot: 'העוזר של משרד התיווך',
    script: [
      { from: 'user', text: 'מחפשים דירה להשכרה' },
      { from: 'bot', text: 'איזה כיף, אעזור לכם למצוא! 🏡 באיזה אזור או שכונה?' },
      { from: 'user', text: 'צפון תל אביב' },
      { from: 'bot', text: 'וכמה חדרים ובאיזה תקציב חודשי?' },
      { from: 'user', text: '3 חדרים, עד 7,500' },
      { from: 'bot', text: 'הפרופיל שלכם מוכן ✅ 3 חד׳ | צפון ת"א | עד 7,500 ₪. מצאתי 4 נכסים מתאימים, לשלוח?' },
    ],
  },
]

// סימולטור שיחת וואטסאפ חיה המדגים פעולת בוט
export function WhatsAppSimulator() {
  const [sid, setSid] = useState(SCENARIOS[0].id)
  const [shown, setShown] = useState(0)
  const [run, setRun] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const { play } = useSound()
  const scenario = SCENARIOS.find((s) => s.id === sid)!

  const next = scenario.script[shown]
  const typing = inView && next?.from === 'bot'

  const restart = (id: string) => {
    setSid(id)
    setShown(0)
    setRun((r) => r + 1)
  }

  useEffect(() => {
    if (!inView || !next) return
    const t = setTimeout(() => {
      setShown((n) => n + 1)
      play('hover')
    }, next.from === 'bot' ? 1300 : 900)
    return () => clearTimeout(t)
  }, [inView, next, play])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [shown, typing])

  return (
    <section id="simulator" ref={ref} className="relative scroll-mt-28 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p dir="ltr" className="text-end font-mono text-sm tracking-[0.3em] text-wa lg:text-start">LIVE PREVIEW</p>
          <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">
            ככה נראה בוט <span className="text-wa">שעובד בשבילכם</span>
          </h2>
          <p className="mt-4 max-w-lg text-lg text-white/90">
            הסקילים בכספת הם הבסיס. אקו מדיה לוקחת אותם צעד קדימה ומחברת אותם לוואטסאפ של העסק, ליומן ול-CRM, כך שהבוט מסנן
            לידים, לוקח הזמנות וקובע פגישות גם בשתיים בלילה.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  play('click')
                  restart(s.id)
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  sid === s.id ? 'bg-wa text-void shadow-glow-wa' : 'glass text-white/70 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <WhatsAppButton className="mt-8" label="אני רוצה בוט כזה לעסק" message="היי יצחק, ראיתי את סימולטור הבוט ב-Prompt & Play ואשמח לבוט וואטסאפ לעסק שלי." />
        </div>

        {/* מוקאפ טלפון */}
        <div className="relative mx-auto w-full max-w-[360px]">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-wa/20 blur-3xl" />
          <div className="overflow-hidden rounded-[2.5rem] border-[10px] border-[#1a1b22] bg-[#0b141a] shadow-2xl">
            <div className="flex items-center gap-3 bg-[#202c33] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-xs font-black text-void">
                AI
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{scenario.bot}</p>
                <p className="text-[11px] text-wa">{typing ? 'מקליד/ה...' : 'מחובר/ת'}</p>
              </div>
              <button type="button" onClick={() => restart(sid)} aria-label="הפעלה מחדש" className="text-white/50 hover:text-white">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            <div
              ref={scroller}
              className="flex h-[440px] flex-col gap-2 overflow-y-auto bg-[radial-gradient(#ffffff08_1px,transparent_1px)] p-3 [background-size:16px_16px]"
            >
              <AnimatePresence initial={false}>
                {scenario.script.slice(0, shown).map((m, i) => (
                  <motion.div
                    key={`${sid}-${run}-${i}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-snug shadow ${
                      m.from === 'user' ? 'self-start rounded-ss-sm bg-[#005c4b]' : 'self-end rounded-se-sm bg-[#202c33]'
                    }`}
                  >
                    {m.text}
                    <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-white/40">
                      {`10:${(12 + i).toString().padStart(2, '0')}`}
                      {m.from === 'user' && <CheckCheck className="h-3 w-3 text-sky-400" />}
                    </span>
                  </motion.div>
                ))}
                {typing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-1 self-end rounded-xl bg-[#202c33] px-4 py-3"
                  >
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-white/50" style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 bg-[#202c33] px-3 py-2">
              <div className="flex-1 rounded-full bg-[#2a3942] px-4 py-2 text-xs text-white/40">הקלידו הודעה</div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-wa text-void">➤</div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-white/85">הדגמה מבוססת על סקילי הבוטים מהכספת · Powered by אקו מדיה</p>
        </div>
      </div>
    </section>
  )
}
