import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { BRAND, waLink } from '../lib/brand'
import { legalFromHash, type LegalDoc } from '../lib/legal'


const UPDATED = '5 באוקטובר 2026'


function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="font-bold text-white">{title}</h3>
      <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-white/80">{children}</div>
    </section>
  )
}

const Contact = () => (
  <p>
    {BRAND.nameHe}, בוואטסאפ או בטלפון{' '}
    <a href={waLink('היי, יש לי שאלה לגבי Prompt & Play')} target="_blank" rel="noopener noreferrer" className="underline" dir="ltr">
      {BRAND.phoneDisplay}
    </a>
    .
  </p>
)

function Privacy() {
  return (
    <>
      <p className="text-sm leading-relaxed text-white/80">
        Prompt & Play מופעל ע"י {BRAND.nameHe}. אנחנו אוספים כמה שפחות מידע. כאן מוסבר מה בדיוק קורה עם המידע שלכם.
      </p>
      <Section title="אין הרשמה">
        <p>הספרייה לא מבקשת שם, טלפון או אימייל. הפרטים שאתם ממלאים בפרומפט (שם העסק, קהל יעד וכו') נשארים בדפדפן שלכם ולא נשלחים אלינו.</p>
      </Section>
      <Section title="מחשבון המחיר">
        <p>
          אם תבקשו הצעת מחיר במחשבון (בעמוד /calculator), השם, הטלפון, האימייל והבחירות שלכם נשלחים אלינו ואליכם במייל דרך שירות המיילים
          EmailJS (או FormSubmit כגיבוי), כדי שנוכל לשלוח את ההצעה ולחזור אליכם. בקשה בוואטסאפ עוברת ישירות לוואטסאפ. לא נשתמש בפרטים לשום מטרה אחרת.
        </p>
      </Section>
      <Section title="סטטיסטיקת ביקורים">
        <p>
          אנחנו משתמשים ב-Vercel Web Analytics כדי לדעת כמה אנשים מבקרים ובאילו עמודים. הכלי לא משתמש בעוגיות, לא מזהה אתכם אישית ולא עוקב אחריכם
          באתרים אחרים. המידע מצטבר (כמו מספר ביקורים, מדינה, סוג מכשיר ודפדפן).
        </p>
      </Section>
      <Section title="מה נשמר אצלכם בדפדפן">
        <p>העדפות הנגישות שבחרתם, וסימון שכבר ראיתם את הפתיחה בביקור הנוכחי. אפשר למחוק אותם בכל רגע דרך הגדרות הדפדפן.</p>
      </Section>
      <Section title="העוזר החכם">
        <p>
          אם תכתבו לעוזר או תריצו פרומפט באתר, הטקסט נשלח לשירות ה-AI של Anthropic (Claude) כדי לייצר תשובה, ואינו נשמר אצלנו. אל תכתבו שם מידע
          אישי רגיש.
        </p>
      </Section>
      <Section title="וואטסאפ וקישורים חיצוניים">
        <p>
          לחיצה על כפתור וואטסאפ, או על פתיחה ב-Claude או ב-ChatGPT, מעבירה אתכם לשירות חיצוני שחלה עליו מדיניות הפרטיות שלו. אם תפנו אלינו בוואטסאפ,
          נשתמש בפרטים רק כדי לחזור אליכם.
        </p>
      </Section>
      <Section title="הזכויות שלכם">
        <p>לפי חוק הגנת הפרטיות אתם יכולים לבקש לעיין במידע עליכם, לתקן אותו או למחוק אותו. לכל פנייה:</p>
        <Contact />
      </Section>
    </>
  )
}

function Terms() {
  return (
    <>
      <p className="text-sm leading-relaxed text-white/80">השימוש ב-Prompt & Play חינמי. השימוש באתר מהווה הסכמה לתנאים האלה.</p>
      <Section title="מה מותר">
        <p>מותר להעתיק את הפרומפטים ולהשתמש בהם לעסק שלכם, גם למטרות מסחריות. אסור למכור אותם כאוסף או להעתיק את האתר עצמו.</p>
      </Section>
      <Section title="תוצאות ה-AI">
        <p>
          התשובות מגיעות מכלי AI של צד שלישי ועלולות להכיל טעויות. בדקו כל תוצר לפני שאתם מפרסמים, שולחים ללקוח או מקבלים על פיו החלטה. התוכן באתר
          אינו ייעוץ משפטי, פיננסי או מקצועי.
        </p>
      </Section>
      <Section title="קניין רוחני">
        <p>
          העיצוב, הקוד, הטקסטים ושם Prompt & Play שייכים ל{BRAND.nameHe}. ידע פיתוח אתרי ה-5D מוצג כהדגמה בלבד ונשאר נכס של הסוכנות. Claude, ChatGPT
          ושאר שמות הכלים שייכים לבעליהם, ואין לנו קשר רשמי איתם.
        </p>
      </Section>
      <Section title="אחריות">
        <p>האתר ניתן כמו שהוא (AS IS), ללא התחייבות לזמינות רציפה. {BRAND.nameHe} לא אחראית לנזק שנגרם משימוש בפרומפטים או בתוצרים שלהם.</p>
      </Section>
      <Section title="שינויים ודין">
        <p>אנחנו עשויים לעדכן את האתר ואת התנאים. על התנאים חל הדין הישראלי.</p>
      </Section>
      <Section title="יצירת קשר">
        <Contact />
      </Section>
    </>
  )
}

const TITLES: Record<LegalDoc, string> = { privacy: 'מדיניות פרטיות', terms: 'תנאי שימוש' }

export function Legal() {
  const [doc, setDoc] = useState<LegalDoc | null>(legalFromHash)

  useEffect(() => {
    const show = (e: Event) => setDoc((e as CustomEvent<LegalDoc>).detail)
    window.addEventListener('pp:legal', show)
    return () => window.removeEventListener('pp:legal', show)
  }, [])

  useEffect(() => {
    if (!doc) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDoc(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [doc])

  return (
    <AnimatePresence>
      {doc && (
        <motion.div
          data-lenis-prevent
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#0b0d2a]/70 backdrop-blur-sm" onClick={() => setDoc(null)} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="relative flex max-h-[88svh] w-full max-w-2xl flex-col rounded-t-3xl border border-white/15 bg-[#14183f] shadow-2xl sm:rounded-3xl"
          >
            <button
              type="button"
              onClick={() => setDoc(null)}
              aria-label="סגירה"
              className="absolute top-4 end-4 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="overflow-y-auto overscroll-contain p-6 sm:p-8">
              <h2 id="legal-title" className="pe-10 font-display text-2xl font-bold">
                {TITLES[doc]}
              </h2>
              <p className="mt-1 text-xs text-white/55">עודכן לאחרונה: {UPDATED}</p>
              <div className="mt-4">{doc === 'privacy' ? <Privacy /> : <Terms />}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
