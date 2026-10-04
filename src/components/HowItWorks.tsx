import { motion } from 'framer-motion'
import { RevealTitle } from './RevealTitle'

const STEPS = [
  { title: 'בחרו פרומפט', text: 'חפשו לפי מה שהעסק צריך, או התחילו מששת הפופולריים.' },
  { title: 'מלאו פרטי עסק', text: 'שם העסק, קהל היעד ומה מוכרים. הפרומפט מתעדכן מול העיניים.' },
  { title: 'הדביקו ב-Claude או ב-ChatGPT', text: 'לוחצים העתק או פותחים ישר בצ׳אט, ומקבלים תוצאה מוכנה לעבודה.' },
]

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <RevealTitle >איך זה עובד</RevealTitle>
        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass flex flex-col items-center rounded-2xl p-6 text-center"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-lg font-black text-[#141846]">
                {i + 1}
              </span>
              <div className="mt-4">
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-white/75">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
