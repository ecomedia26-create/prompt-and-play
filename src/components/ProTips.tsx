import { motion } from 'framer-motion'
import { Brain, FileCode2, ScanEye, ShieldCheck } from 'lucide-react'

const TIPS = [
  { icon: Brain, en: 'Delegation', he: 'האצלה', text: 'הגדירו מראש מה המודל מבצע ומה נשאר בידי הצוות האנושי.' },
  { icon: FileCode2, en: 'Description', he: 'תיאור', text: 'עטפו הוראות בתגיות XML כמו <instructions> והוסיפו דוגמאות Few-Shot.' },
  { icon: ScanEye, en: 'Discernment', he: 'שיקול דעת', text: 'בקשו מ-Claude ביקורת עצמית (Self-Critique) בסוף כל פלט לשיפור איטרטיבי.' },
  { icon: ShieldCheck, en: 'Diligence', he: 'אחריות', text: 'פתחו Project ייעודי עם בסיס ידע לכל לקוח, ושמרו על דיוק ואתיקה עסקית.' },
]

export function ProTips() {
  return (
    <section id="tips" className="scroll-mt-28 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p dir="ltr" className="text-end font-mono text-sm tracking-[0.3em] text-neon-purple lg:text-start">CLAUDE PRO TIPS · 4D</p>
        <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">ככה מוציאים מהסקילים את המקסימום</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map((t, i) => (
            <motion.div
              key={t.en}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-3xl p-6"
            >
              <t.icon className="h-8 w-8 text-neon-purple" />
              <h3 className="mt-4 text-xl font-bold">
                {t.he} <span dir="ltr" className="font-mono text-sm text-white/40">{t.en}</span>
              </h3>
              <p className="mt-2 text-sm text-white/65">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
