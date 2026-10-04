import { motion } from 'framer-motion'
import { RevealTitle } from './RevealTitle'

const TIPS = [
  { title: 'תנו ל-AI תפקיד', text: 'פתחו ב"אתה קופירייטר בכיר שמתמחה ב..." והתשובות יהיו מקצועיות יותר.' },
  { title: 'ספרו על העסק', text: 'מה אתם מוכרים, למי, ובמה אתם שונים מהמתחרים.' },
  { title: 'הגדירו פורמט', text: '"3 גרסאות, עד 80 מילה, עם קריאה לפעולה" עדיף על "תכתוב פוסט".' },
  { title: 'תנו דוגמה', text: 'הדביקו פוסט שעבד לכם וכתבו "בסגנון הזה".' },
  { title: 'הפרידו הוראות מחומר', text: 'שימו טקסט מצורף בין תגיות <מסמך>...</מסמך> כדי שה-AI לא יתבלבל.' },
  { title: 'אל תתפשרו על הטיוטה הראשונה', text: 'בקשו "קצר יותר", "יותר ישראלי", "תן עוד 5 כותרות".' },
]

export function ProTips() {
  return (
    <section id="tips" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <RevealTitle className="text-[clamp(2.6rem,8vw,7rem)] leading-[0.95] tracking-tight">6 טיפים מהירים</RevealTitle>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.06 }}
              className="glass rounded-2xl p-5"
            >
              <h3 className="font-bold">
                <span className="me-2 text-white/50">{i + 1}.</span>
                {t.title}
              </h3>
              <p className="mt-1.5 text-sm text-white/75">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
