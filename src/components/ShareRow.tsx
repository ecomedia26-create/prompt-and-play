import { Check, Link2, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { Skill } from '../data/skills'
import { BRAND } from '../lib/brand'
import { useSound } from '../lib/sound'
import { WhatsAppIcon } from './WhatsAppIcon'

function LinkedinIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

// שיתוף סקיל בוואטסאפ ובלינקדאין, עם קישור שפותח את הסקיל ישירות באתר
export function ShareRow({ skill }: { skill: Skill }) {
  const [copied, setCopied] = useState(false)
  const { play } = useSound()
  const url = `${BRAND.appUrl}/?skill=${encodeURIComponent(skill.id)}`
  const text = `${skill.title_he}: סקיל AI חינמי לעסקים מ-Prompt & Play של אקו מדיה`
  const canNativeShare = typeof navigator.share === 'function'

  const btn =
    'inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:border-white/40 hover:text-white'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      play('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('העתיקו את הקישור:', url)
    }
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
      <span className="text-xs text-white/60">שתפו:</span>
      <a
        className={btn}
        href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => play('click')}
      >
        <WhatsAppIcon className="h-3.5 w-3.5 text-wa" />
        וואטסאפ
      </a>
      <a
        className={btn}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => play('click')}
      >
        <LinkedinIcon className="h-3.5 w-3.5 text-[#4ea3e8]" />
        לינקדאין
      </a>
      <button type="button" className={btn} onClick={() => void copyLink()}>
        {copied ? <Check className="h-3.5 w-3.5 text-wa" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? 'הקישור הועתק' : 'העתקת קישור'}
      </button>
      {canNativeShare && (
        <button
          type="button"
          className={btn}
          onClick={() => void navigator.share({ title: skill.title_he, text, url }).catch(() => {})}
        >
          <Share2 className="h-3.5 w-3.5" />
          עוד
        </button>
      )}
    </div>
  )
}
