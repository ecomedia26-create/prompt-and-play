import { motion } from 'framer-motion'
import { ClipboardPaste, MousePointerClick, PenLine } from 'lucide-react'

const STEPS = [
  { icon: MousePointerClick, title: 'בחרו פרומפט', text: 'חפשו לפי מה שהעסק צריך, או התחילו מששת הפופולריים.' },
  { icon: PenLine, title: 'מלאו פרטי עסק', text: 'שם העסק, קהל היעד ומה מוכרים. הפרומפט מתעדכן מול העיניים.' },
  { icon: ClipboardPaste, title: 'הדביקו ב-Claude או ב-ChatGPT', text: 'לוחצים העתק או פותחים ישר בצ׳אט, ומקבלים תוצאה מוכנה לעבודה.' },
]

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-black sm:text-4xl">איך זה עובד</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass flex gap-4 rounded-2xl p-5"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-lg font-black text-[#141846]">
                {i + 1}
              </span>
              <div>
                <h3 className="flex items-center gap-2 font-bold">
                  {s.title}
                  <s.icon className="h-4 w-4 text-white/60" />
                </h3>
                <p className="mt-1 text-sm text-white/75">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
