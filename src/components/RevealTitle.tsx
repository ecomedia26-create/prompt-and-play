import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// כותרת שעולה מתוך "חריץ" כשהיא נכנסת למסך.
// הצופה (whileInView) יושב על הכותרת עצמה: הטקסט המוזז נחתך ע"י overflow ולכן לא "נראה" ל-IntersectionObserver
export function RevealTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.h2
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className={`overflow-hidden pb-[0.08em] font-display font-black ${className}`}
    >
      <motion.span
        className="block"
        variants={{ hidden: { y: '105%' }, show: { y: 0 } }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </motion.h2>
  )
}
