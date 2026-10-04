import { BRAND, waLink } from '../lib/brand'
import { EcoLogo } from './EcoLogo'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 pb-28 sm:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-white/50 sm:flex-row sm:px-6">
        <EcoLogo />
        <p className="text-center">
          Prompt & Play הוא מיזם קהילתי חינמי מבית {BRAND.nameHe}. © {YEAR}
        </p>
        <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-wa" dir="ltr">
          WhatsApp {BRAND.phoneDisplay}
        </a>
      </div>
    </footer>
  )
}
