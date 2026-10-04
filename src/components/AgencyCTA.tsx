import { motion } from 'framer-motion'
import { Bot, Clapperboard, Orbit } from 'lucide-react'
import { BRAND } from '../lib/brand'
import { WhatsAppButton } from './WhatsAppButton'

const SERVICES = [
  { icon: Orbit, title: 'אתרי 5D', text: 'אתרים חיים בתלת-ממד, כמו זה שאתם גולשים בו.' },
  { icon: Clapperboard, title: 'סרטוני AI', text: 'פרסומות וידאו קולנועיות, מהרעיון ועד הגרסה הסופית.' },
  { icon: Bot, title: 'בוטים לעסקים', text: 'בוטי וואטסאפ שמסננים לידים, לוקחים הזמנות וקובעים תורים.' },
]

// בלוק אקו מדיה אחד וחזק עם קריאה אחת לפעולה
export function AgencyCTA() {
  return (
    <section id="agency" className="relative scroll-mt-24 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#151a4c]/80 px-6 py-12 text-center backdrop-blur-xl sm:px-12"
        >
          <p className="text-sm font-semibold text-white/70">
            {BRAND.nameHe} · <span dir="ltr">{BRAND.nameEn}</span>
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-black leading-tight sm:text-5xl">
            האתר הזה נבנה ע"י אקו מדיה. רוצים כזה לעסק שלכם?
          </h2>

          <div className="mt-8 grid gap-3 text-start sm:grid-cols-3">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <s.icon className="h-6 w-6 text-neon-blue" />
                <h3 className="mt-3 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-white/70">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <WhatsAppButton label="דברו איתנו בוואטסאפ" />
            <a
              href={BRAND.siteUrl}
              target="_blank"
              rel="noopener"
              className="text-sm font-semibold text-white/80 underline-offset-4 transition hover:text-white hover:underline"
            >
              לאתר אקו מדיה: <span dir="ltr">{BRAND.siteDisplay}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
