import { BRAND, waLink } from '../lib/brand'
import { EcoLogo } from './EcoLogo'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-white/15 bg-[#141846]/70 py-10 pb-28 backdrop-blur-md sm:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-white/75 sm:flex-row sm:px-6">
        <EcoLogo />
        <p className="text-center">
          Prompt & Play הוא מיזם קהילתי חינמי מבית {BRAND.nameHe}. © {YEAR}
        </p>
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
