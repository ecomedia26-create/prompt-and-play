import { motion } from 'framer-motion'
import { ChevronDown, Lock, Sparkles, Volume2 } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useIsTouch, usePrefersReducedMotion } from '../hooks/useIsTouch'
import { BRAND } from '../lib/brand'
import { useSound } from '../lib/sound'
import { MagneticButton } from './MagneticButton'
import { WhatsAppButton } from './WhatsAppButton'

const ParticleField = lazy(() => import('./ParticleField').then((m) => ({ default: m.ParticleField })))

const TITLE = 'Prompt & Play'

export function Hero() {
  const touch = useIsTouch()
  const reduced = usePrefersReducedMotion()
  const { enabled, toggle, play } = useSound()

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden pt-28">
      <div className="grid-bg absolute inset-0" />
      <div className="absolute inset-0">
        {!reduced && (
          <Suspense fallback={null}>
            <ParticleField interactive={!touch} />
          </Suspense>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#070709_78%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 text-center sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-white/80 sm:text-sm"
        >
          <Sparkles className="h-4 w-4 text-neon-blue" />
          30 סקילים ובוטים של AI לעסקים, בחינם, בלחיצה אחת
        </motion.p>

        {/* כותרת קינטית */}
        <h1 dir="ltr" className="font-display text-5xl font-black leading-none tracking-tight sm:text-7xl lg:text-8xl">
          {TITLE.split('').map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60, rotateX: -90, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.3 + i * 0.05, type: 'spring', stiffness: 120, damping: 14 }}
              className={`inline-block ${ch === '&' ? 'text-neon-gradient px-2' : ''}`}
              style={{ textShadow: ch === '&' ? undefined : '0 0 40px rgba(0,240,255,.35)' }}
            >
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/75 sm:text-xl"
        >
          ספריית הפרומפטים והבוטים החינמית לבעלי עסקים ויוצרים בישראל. פרסומות וידאו, עריכה, שיווק ובוטים, מוכנים להעתקה
          ל-Claude.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <MagneticButton
            href="#vault"
            onClick={() => play('open')}
            className="neon-border group inline-flex items-center gap-3 rounded-full bg-void-800 px-8 py-4 text-lg font-bold text-white shadow-glow-blue transition hover:shadow-glow-purple"
          >
            <Lock className="h-5 w-5 text-neon-blue transition group-hover:rotate-12" />
            <span dir="ltr">Unlock the Vault</span>
          </MagneticButton>
          <WhatsAppButton label="רוצים אתר כזה לעסק?" />
        </motion.div>

        {!enabled && (
          <motion.button
            type="button"
            onClick={toggle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-neon-blue/30 px-4 py-2 text-sm text-neon-blue transition hover:bg-neon-blue/10"
          >
            <Volume2 className="h-4 w-4 animate-pulse" />
            הפעילו את חוויית הסאונד
          </motion.button>
        )}

        {/* קולאאוט אקו מדיה */}
        <motion.a
          href="#agency"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="glass mx-auto mt-12 flex max-w-xl items-center gap-3 rounded-2xl px-5 py-4 text-start text-sm text-white/85 transition hover:border-neon-purple/50 sm:text-base"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple font-black text-void">
            5D
          </span>
          <span>{BRAND.heroCallout}</span>
        </motion.a>
      </div>

      <a href="#vault" aria-label="גללו לכספת" className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/40">
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </a>
    </section>
  )
}
