import { motion, useScroll, useTransform } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { BRAND } from '../lib/brand'
import { useSound } from '../lib/sound'
import { EcoLogo } from './EcoLogo'

const NAV = [
  { href: '#library', label: 'הספרייה' },
  { href: '#how', label: 'איך זה עובד' },
  { href: '#tips', label: 'טיפים' },
  { href: '#agency', label: 'אקו מדיה' },
]

export function Header() {
  const { enabled, toggle } = useSound()
  const { scrollY } = useScroll()
  const bg = useTransform(scrollY, [0, 120], ['rgba(22,26,74,0.25)', 'rgba(22,26,74,0.8)'])

  return (
    <motion.header style={{ backgroundColor: bg }} className="fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <EcoLogo />
        <nav aria-label="ניווט ראשי" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm text-white/80">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/calculator"
            className="whitespace-nowrap rounded-full bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-md shadow-[#141846]/20 transition hover:bg-white/90 sm:px-4 sm:text-sm"
          >
            קבלו הצעת מחיר
          </a>
          <a
            href={BRAND.siteUrl}
            target="_blank"
            rel="noopener"
            className="hidden whitespace-nowrap text-xs font-semibold text-white/75 transition hover:text-white sm:inline"
          >
            לאתר אקו מדיה ↗
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-pressed={enabled}
            aria-label={enabled ? 'כיבוי מוזיקה' : 'הפעלת מוזיקה'}
            title={enabled ? 'כיבוי מוזיקה' : 'הפעלת מוזיקה'}
            className={`grid h-9 w-9 place-items-center rounded-full border border-white/15 transition hover:bg-white/10 ${
              enabled ? 'text-white' : 'text-white/60'
            }`}
          >
            {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </motion.header>
  )
}
