import { AnimatePresence, motion } from 'framer-motion'
import { Accessibility as A11yIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { resetA11y, setA11y, useA11y, type A11yKey } from '../lib/a11y'
import { BRAND, waLink } from '../lib/brand'

const OPTIONS: { key: A11yKey; label: string }[] = [
  { key: 'calm', label: 'עצירת אנימציות ותנועה' },
  { key: 'big', label: 'הגדלת טקסט' },
  { key: 'contrast', label: 'ניגודיות גבוהה' },
  { key: 'links', label: 'הדגשת קישורים' },
]

const UPDATED = '4 באוקטובר 2026'

function Statement({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-white/85">
      <p>
        Prompt & Play הוא מיזם קהילתי של {BRAND.nameHe}. אנחנו רוצים שכל אחד יוכל להשתמש באתר, כולל אנשים עם מוגבלות, ופועלים
        להנגשתו בהתאם לתקן הישראלי 5568 (המבוסס על WCAG 2.1) ברמה AA.
      </p>
      <p className="font-semibold text-white">מה עשינו באתר:</p>
      <ul className="list-disc space-y-1 ps-5">
        <li>תפריט נגישות לעצירת אנימציות, הגדלת טקסט, ניגודיות גבוהה והדגשת קישורים.</li>
        <li>כיבוד הגדרת "הפחתת תנועה" של מערכת ההפעלה: האנימציות והרקע התלת-ממדי כבויים אוטומטית.</li>
        <li>ניווט מלא במקלדת, תוויות לשדות טופס ולכפתורים, וכיווניות עברית (RTL).</li>
        <li>הסאונד כבוי כברירת מחדל ומופעל רק בלחיצה.</li>
      </ul>
      <p>
        ייתכן שעדיין יש באתר רכיבים שאינם נגישים במלואם. נתקלתם בבעיה? נשמח לשמוע ולתקן:{' '}
        <a href={waLink('היי, נתקלתי בבעיית נגישות באתר Prompt & Play:')} target="_blank" rel="noopener noreferrer" className="font-semibold text-wa underline">
          וואטסאפ
        </a>{' '}
        או בטלפון{' '}
        <a dir="ltr" href={`tel:+${BRAND.phoneIntl}`} className="font-semibold underline">
          {BRAND.phoneDisplay}
        </a>
        .
      </p>
      <p className="text-white/60">ההצהרה עודכנה לאחרונה ב-{UPDATED}.</p>
      <button type="button" onClick={onClose} className="mt-2 rounded-full border border-white/25 px-4 py-2 font-semibold hover:bg-white/10">
        חזרה
      </button>
    </div>
  )
}

// כפתור נגישות קבוע + חלונית הגדרות והצהרת נגישות
export function Accessibility() {
  const a = useA11y()
  const [open, setOpen] = useState(false)
  const [statement, setStatement] = useState(false)

  useEffect(() => {
    const show = () => {
      setOpen(true)
      setStatement(true)
    }
    window.addEventListener('pp:a11y-statement', show)
    if (!open) return () => window.removeEventListener('pp:a11y-statement', show)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pp:a11y-statement', show)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatement(false)
          setOpen(!open)
        }}
        aria-expanded={open}
        aria-label="תפריט נגישות"
        title="נגישות"
        className="fixed bottom-20 left-6 z-[59] grid h-11 w-11 place-items-center sm:bottom-auto sm:left-5 sm:top-1/2 sm:-translate-y-1/2 rounded-full border border-white/25 bg-[#1c2160]/90 text-white shadow-lg backdrop-blur transition hover:bg-[#262c78]"
      >
        <A11yIcon className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={statement ? 'הצהרת נגישות' : 'הגדרות נגישות'}
            data-lenis-prevent
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="fixed left-3 top-[10svh] z-[61] max-h-[80svh] w-[min(92vw,360px)] overflow-y-auto rounded-2xl border border-white/20 bg-[#14183f] p-5 shadow-2xl sm:left-20"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{statement ? 'הצהרת נגישות' : 'נגישות'}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="סגירה" className="rounded-full p-1.5 text-white/70 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            {statement ? (
              <Statement onClose={() => setStatement(false)} />
            ) : (
              <div className="space-y-2">
                {OPTIONS.map((o) => (
                  <label key={o.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5">
                    <span className="text-sm font-medium">{o.label}</span>
                    <input type="checkbox" checked={a[o.key]} onChange={(e) => setA11y(o.key, e.target.checked)} className="h-5 w-5 accent-[#25D366]" />
                  </label>
                ))}
                <div className="flex items-center justify-between pt-2 text-sm">
                  <button type="button" onClick={resetA11y} className="text-white/70 underline-offset-2 hover:underline">
                    איפוס
                  </button>
                  <button type="button" onClick={() => setStatement(true)} className="font-semibold underline-offset-2 hover:underline">
                    הצהרת נגישות
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
