import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { onCopied } from '../lib/copyFx'

interface Flight {
  id: number
  x: number
  y: number
}

export function PlaneIcon({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`drop-shadow-[0_4px_8px_rgba(20,24,70,.35)] ${className}`} aria-hidden="true">
      <path d="M2 11.5 22 3l-6.5 18-3.2-7.3L2 11.5Z" fill="#fff" />
      <path d="M12.3 13.7 22 3 8.8 12.6l3.5 1.1Z" fill="#cfe9ff" />
    </svg>
  )
}

// מטוס נייר שממריא מכפתור ההעתקה אל העננים, והודעה קטנה שהפרומפט מוכן
export function CopyFlight() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [toast, setToast] = useState(0)

  useEffect(
    () =>
      onCopied(({ x, y }) => {
        const id = Date.now() + Math.random()
        setFlights((f) => [...f, { id, x, y }])
        setToast(id)
        setTimeout(() => setFlights((f) => f.filter((p) => p.id !== id)), 1500)
        setTimeout(() => setToast((t) => (t === id ? 0 : t)), 2200)
      }),
    [],
  )

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
        {flights.map((f) => (
          <motion.div
            key={f.id}
            className="absolute"
            style={{ left: f.x - 18, top: f.y - 18 }}
            initial={{ x: 0, y: 0, rotate: -20, scale: 0.6, opacity: 1 }}
            animate={{
              x: [0, -60, 120, 420],
              y: [0, -80, -260, -f.y - 120],
              rotate: [-20, -40, 10, 25],
              scale: [0.6, 1.1, 1, 0.7],
              opacity: [1, 1, 1, 0],
            }}
            transition={{ duration: 1.4, ease: 'easeIn', times: [0, 0.25, 0.6, 1] }}
          >
            <PlaneIcon />
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {!!toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4"
          >
            {/* המרכוז במעטפת: האנימציה של framer דורסת translate של Tailwind על אותו אלמנט */}
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#141846] shadow-xl">
              <Check className="h-4 w-4 shrink-0 text-wa" />
              הועתק! הדביקו ב-Claude או ב-ChatGPT
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
