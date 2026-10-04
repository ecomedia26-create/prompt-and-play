import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { useIsTouch } from '../hooks/useIsTouch'

interface Props {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  target?: string
  strength?: number
}

// כפתור מגנטי: נמשך לסמן העכבר עם פיזיקת קפיץ (מבוטל במסכי מגע)
export function MagneticButton({ children, href, onClick, className = '', target, strength = 0.35 }: Props) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  const touch = useIsTouch()
  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 15 })

  const onMove = (e: React.MouseEvent) => {
    if (touch || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const common = {
    ref,
    onMouseMove: onMove,
    onMouseLeave: reset,
    style: { x, y },
    whileTap: { scale: 0.96 },
    className,
  }

  return href ? (
    <motion.a {...common} href={href} target={target} rel={target ? 'noopener noreferrer' : undefined} onClick={onClick}>
      {children}
    </motion.a>
  ) : (
    <motion.button {...common} type="button" onClick={onClick}>
      {children}
    </motion.button>
  )
}
