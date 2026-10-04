import { motion } from 'framer-motion'
import { Bot, Clapperboard, Music2, Orbit } from 'lucide-react'
import { BRAND } from '../lib/brand'
import { WhatsAppButton } from './WhatsAppButton'

const SERVICES = [
  { icon: Orbit, title: 'אתרי 5D ותלת-ממד', text: 'חוויות מותג אינטראקטיביות ב-WebGL, בדיוק כמו האתר הזה.' },
  { icon: Clapperboard, title: 'פרסומות וידאו ב-AI', text: 'הפקות קולנועיות ב-Runway, Kling ו-Midjourney, מהקונספט ועד הגרסה הסופית.' },
  { icon: Music2, title: 'עריכה ופסקול מקורי', text: 'עריכה דינמית לרשתות ומוזיקה מקורית ב-Suno שמתאימה למותג.' },
  { icon: Bot, title: 'בוטים ואוטומציות', text: 'בוטי וואטסאפ שמסננים לידים, לוקחים הזמנות ומתחברים ל-CRM.' },
]

// Ultimate CTA: תיבת ניאון זוהרת להזמנת פרויקט מאקו מדיה
export function AgencyCTA() {
  return (
    <section id="agency" className="relative scroll-mt-28 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="neon-border relative overflow-hidden rounded-[2rem] bg-void-800 px-6 py-14 text-center sm:px-12"
        >
          <div className="absolute -top-32 start-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-neon-purple/25 blur-3xl" />
          <div className="absolute -bottom-32 end-1/4 h-64 w-96 rounded-full bg-neon-blue/20 blur-3xl" />

          <p className="relative text-sm font-semibold text-neon-blue">
            {BRAND.nameHe} · <span dir="ltr">{BRAND.nameEn}</span>
          </p>
          <h2 className="relative mt-3 font-display text-4xl font-black leading-tight sm:text-6xl">
            הסקילים בחינם.
            <br />
            <span className="text-neon-gradient">הקסם המלא אצלנו.</span>
          </h2>
          <p className="relative mx-auto mt-5 max-w-2xl text-lg text-white/75">
            אקו מדיה מפתחת לעסקים שרוצים להוביל את כל מה שראיתם כאן, בהתאמה מלאה למותג שלכם.
          </p>

          <div className="relative mt-10 grid gap-4 text-start sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="glass rounded-2xl p-5">
                <s.icon className="h-7 w-7 text-neon-blue" />
                <h3 className="mt-3 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-white/60">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-12 flex flex-col items-center gap-3">
            <WhatsAppButton label="קבעו שיחת אפיון חינם" />
            <p className="text-sm text-white/50">
              או התקשרו:{' '}
              <a dir="ltr" href={`tel:+${BRAND.phoneIntl}`} className="font-semibold text-white hover:text-wa">
                {BRAND.phoneDisplay}
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
