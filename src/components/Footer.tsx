import { BRAND, waLink } from '../lib/brand'
import { EcoLogo } from './EcoLogo'
import { InstallChip } from './InstallChip'
import { openLegal } from '../lib/legal'

const LINK = 'text-xs text-white/70 underline-offset-2 hover:text-white hover:underline'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-white/15 bg-[#141846]/70 py-10 pb-28 backdrop-blur-md sm:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-white/75 sm:flex-row sm:px-6">
        <EcoLogo />
        <div className="flex flex-col items-center gap-3">
          <p className="text-center">
            Prompt & Play הוא מיזם קהילתי חינמי מבית {BRAND.nameHe}. © {YEAR} כל הזכויות שמורות.
          </p>
          <nav aria-label="מידע משפטי" className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <button type="button" onClick={() => openLegal('terms')} className={LINK}>
              תנאי שימוש
            </button>
            <button type="button" onClick={() => openLegal('privacy')} className={LINK}>
              מדיניות פרטיות
            </button>
            <button type="button" onClick={() => window.dispatchEvent(new Event('pp:a11y-statement'))} className={LINK}>
              הצהרת נגישות
            </button>
          </nav>
          <InstallChip />
        </div>
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <a href={BRAND.siteUrl} target="_blank" rel="noopener" className="font-semibold text-white hover:text-neon-blue">
            לאתר אקו מדיה: <span dir="ltr">{BRAND.siteDisplay}</span>
          </a>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-wa" dir="ltr">
            WhatsApp {BRAND.phoneDisplay}
          </a>
        </div>
      </div>
    </footer>
  )
}
