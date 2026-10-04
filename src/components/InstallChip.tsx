import { AnimatePresence, motion } from 'framer-motion'
import { Download, Share, X } from 'lucide-react'
import { useState } from 'react'
import { useInstall } from '../lib/install'
import { useSound } from '../lib/sound'

// כפתור "התקינו כאפליקציה": מופיע רק כשההתקנה אפשרית (או באייפון, עם הסבר קצר)
export function InstallChip() {
  const { mode, install } = useInstall()
  const [iosHelp, setIosHelp] = useState(false)
  const { play } = useSound()
  if (!mode) return null

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        onClick={() => {
          play('click')
          if (mode === 'prompt') void install()
          else setIosHelp(true)
        }}
        className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <Download className="h-4 w-4 text-neon-blue" />
        התקינו כאפליקציה
      </motion.button>

      <AnimatePresence>
        {iosHelp && (
          <motion.div
            role="dialog"
            aria-label="התקנה באייפון"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="neon-border fixed inset-x-3 bottom-24 z-[61] rounded-2xl bg-[#12153d]/95 p-5 text-start backdrop-blur-xl"
          >
            <button
              type="button"
              aria-label="סגירה"
              onClick={() => setIosHelp(false)}
              className="absolute top-3 end-3 rounded-full p-1.5 text-white/60 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="font-bold">הוספה למסך הבית באייפון</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-white/85">
              <li>
                לחצו על כפתור השיתוף <Share className="inline h-4 w-4 text-neon-blue" /> בתחתית ספארי
              </li>
              <li>בחרו "הוספה למסך הבית"</li>
              <li>לחצו "הוסף", והאייקון של אקו מדיה יופיע לצד האפליקציות שלכם</li>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
