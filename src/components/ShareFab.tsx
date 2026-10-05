import { AnimatePresence, motion } from 'framer-motion'
import { Check, Link2, Share2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BRAND } from '../lib/brand'
import { copyText } from '../lib/copy'
import { useSound } from '../lib/sound'
import { WhatsAppIcon } from './WhatsAppIcon'

const TEXT = 'מצאתי אתר עם פרומפטים מוכנים ל-AI לעסקים, בעברית ובחינם. שווה להציץ:'

function FacebookIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
    </svg>
  )
}

// כתובת העמוד הנוכחי בדומיין הרשמי, כך שקישור לפרומפט (?skill=...) נשמר
const pageUrl = () => `${BRAND.appUrl}${window.location.pathname}${window.location.search}`

// כפתור צף לשיתוף האתר עם חברים: בטלפון נפתח תפריט השיתוף של המכשיר, במחשב חלונית קטנה
export function ShareFab() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { play } = useSound()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const share = () => {
    play('click')
    const url = pageUrl()
    if (typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches) {
      void navigator.share({ title: 'Prompt & Play', text: TEXT, url }).catch(() => {})
      return
    }
    setOpen((o) => !o)
  }

  const copyLink = async () => {
    if (await copyText(pageUrl())) {
      play('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else window.prompt('העתיקו את הקישור:', pageUrl())
  }

  const item =
    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10'

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-expanded={open}
        aria-label="שיתוף האתר עם חברים"
        title="שתפו עם חברים"
        className="fixed bottom-[8.25rem] left-6 z-[59] grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-[#1c2160]/90 text-white shadow-lg backdrop-blur transition hover:bg-[#262c78] sm:bottom-20 sm:left-5"
      >
        {open ? <X className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="שיתוף עם חברים"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="fixed bottom-[11.5rem] left-6 z-[61] w-60 rounded-2xl border border-white/15 bg-[#14183f]/95 p-2 shadow-2xl backdrop-blur-xl sm:bottom-[8.25rem] sm:left-5"
          >
            <p className="px-3 pt-1.5 pb-2 text-xs text-white/60">שתפו את Prompt & Play עם חברים</p>
            <a
              className={item}
              href={`https://wa.me/?text=${encodeURIComponent(`${TEXT}\n${pageUrl()}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                play('click')
                setOpen(false)
              }}
            >
              <WhatsAppIcon className="h-5 w-5 text-wa" />
              וואטסאפ
            </a>
            <a
              className={item}
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl())}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                play('click')
                setOpen(false)
              }}
            >
              <FacebookIcon className="h-5 w-5 text-[#4e8cf0]" />
              פייסבוק
            </a>
            <button type="button" className={item} onClick={() => void copyLink()}>
              {copied ? <Check className="h-5 w-5 text-wa" /> : <Link2 className="h-5 w-5" />}
              {copied ? 'הקישור הועתק' : 'העתקת קישור'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
