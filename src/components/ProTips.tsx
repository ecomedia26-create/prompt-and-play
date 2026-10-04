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
    <section id="tips" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <RevealTitle >6 טיפים מהירים</RevealTitle>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.06 }}
              className="card rounded-3xl p-7 text-center"
            >
              <h3 className="font-bold">
                <span className="mb-1 block text-sm font-semibold text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                {t.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink/70">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
