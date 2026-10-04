import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// כותרת שעולה מתוך "חריץ" כשהיא נכנסת למסך
export function RevealTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`overflow-hidden pb-1 font-display font-black ${className}`}>
      <motion.span
        className="block"
        initial={{ y: '105%' }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </h2>
  )
}
