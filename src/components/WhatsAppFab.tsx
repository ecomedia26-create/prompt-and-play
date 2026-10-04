import { motion, useScroll, useTransform } from 'framer-motion'
import { waLink } from '../lib/brand'
import { useSound } from '../lib/sound'
import { WhatsAppIcon } from './WhatsAppIcon'

// קריאה אחת לפעולה בכל האתר: כפתור וואטסאפ צף
export function WhatsAppFab() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [100, 300], [0, 1])
  const { play } = useSound()
  return (
    <motion.a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => play('click')}
      style={{ opacity }}
      aria-label="שלחו הודעת וואטסאפ לאקו מדיה"
      className="group fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full bg-wa p-3.5 text-void shadow-glow-wa"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap font-bold transition-all duration-300 group-hover:max-w-xs sm:inline">
        דברו עם אקו מדיה
      </span>
    </motion.a>
  )
}
