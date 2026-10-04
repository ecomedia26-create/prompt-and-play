import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, Volume2, VolumeX } from 'lucide-react'
import { BRAND } from '../lib/brand'
import { useSound } from '../lib/sound'
import { EchoLogo } from './EchoLogo'
import { WhatsAppButton } from './WhatsAppButton'

const NAV = [
  { href: '#vault', label: 'הכספת' },
  { href: '#simulator', label: 'סימולטור בוט' },
  { href: '#tips', label: 'טיפים לקלוד' },
  { href: '#agency', label: 'אקו מדיה' },
]

export function Header() {
  const { enabled, toggle, play } = useSound()
  const { scrollY } = useScroll()
  const bg = useTransform(scrollY, [0, 120], ['rgba(7,7,9,0)', 'rgba(7,7,9,0.82)'])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* באנר עליון חברתי */}
      <div className="relative overflow-hidden border-b border-neon-blue/20 bg-void bg-gradient-to-l from-neon-purple/30 via-void to-neon-blue/25">
        <a
          href="#agency"
          className="flex items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium text-white/90 sm:text-sm"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-neon-blue" />
          <span>{BRAND.banner}</span>
        </a>
      </div>

      <motion.nav style={{ backgroundColor: bg }} className="border-b border-white/5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <EchoLogo />
          <ul className="hidden items-center gap-6 text-sm text-white/70 lg:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} onMouseEnter={() => play('hover')} className="transition hover:text-neon-blue">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-pressed={enabled}
              aria-label={enabled ? 'כיבוי סאונד' : 'הפעלת סאונד'}
              className={`glass flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition ${
                enabled ? 'text-neon-blue shadow-glow-blue' : 'text-white/60'
              }`}
            >
              {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span dir="ltr" className="hidden sm:inline">Sound: {enabled ? 'ON' : 'OFF'}</span>
            </button>
            <WhatsAppButton size="sm" label="וואטסאפ" className="hidden sm:inline-flex" />
          </div>
        </div>
      </motion.nav>
    </header>
  )
}
