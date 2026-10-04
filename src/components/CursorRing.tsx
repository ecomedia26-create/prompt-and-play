import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

// טבעת סמן רכה שמשתהה אחרי העכבר ומתרחבת מעל כל דבר לחיץ (מסכי עכבר בלבד)
export function CursorRing() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 350, damping: 30, mass: 0.5 })
  const [hot, setHot] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setHot(!!(e.target as Element | null)?.closest?.('a, button, input, label, summary, [role="tab"]'))
    }
    const press = () => setDown(true)
    const release = () => setDown(false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
    }
  }, [x, y])

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[70] -translate-x-1/2 -translate-y-1/2"
    >
      <motion.div
        animate={{ scale: down ? 0.8 : hot ? 1.8 : 1, opacity: hot ? 0.9 : 0.55 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
      />
    </motion.div>
  )
}
