import { motion } from 'framer-motion'

const BARS = [0.35, 0.7, 1, 0.55, 0.85, 0.45, 0.25]

// לוגו טקסטואלי עתידני: גל קול / הד זוהר + "Eco Media | אקו מדיה"
export function EcoLogo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-3" aria-label="אקו מדיה, חזרה לראש העמוד">
      <span className="relative flex h-9 items-center gap-[3px]" aria-hidden="true">
        {BARS.map((h, i) => (
          <span
            key={i}
            className="w-[3px] origin-center rounded-full bg-gradient-to-b from-neon-blue to-neon-purple animate-wave"
            style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </span>
      <motion.span
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col leading-none"
      >
        <span className="whitespace-nowrap font-display text-base font-black tracking-wide sm:text-lg">
          <span dir="ltr" className="text-neon-gradient">Eco Media</span>
          {!compact && <span className="mx-2 text-white/30">|</span>}
          {!compact && <span className="text-white">אקו מדיה</span>}
        </span>
        {!compact && (
          <span className="mt-1 hidden text-[10px] font-medium sm:block tracking-[0.25em] text-neon-blue/70">
            5D · AI VIDEO · BOTS
          </span>
        )}
      </motion.span>
    </a>
  )
}
