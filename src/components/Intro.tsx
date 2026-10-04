import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { PlaneIcon } from './CopyFlight'

const KEY = 'pp-intro-seen'

// עננים רכים לאורך קצה החצי, כדי שהפתיחה תיראה כמו ענן אמיתי שנקרע לשניים
const PUFFS = (edge: 'top' | 'bottom') =>
  [8, 22, 37, 52, 66, 81, 95]
    .map((x, i) => `radial-gradient(circle at ${x}% ${edge === 'bottom' ? 100 : 0}%, #f4ecff 0, #f4ecff ${9 + (i % 3) * 3}vmin, transparent ${10 + (i % 3) * 3}vmin)`)
    .join(',')

function seen() {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// פתיחה קצרה (פעם אחת לביקור): מטוס הנייר חוצה את המסך, העננים נפתחים וחושפים את האתר.
// כל לחיצה, מקש או גלילה מדלגים.
export function Intro() {
  const [show, setShow] = useState(() => !seen())

  useEffect(() => {
    if (!show) return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      // מצב פרטי: פשוט נציג שוב בביקור הבא
    }
    const done = () => setShow(false)
    const timer = setTimeout(done, 1900)
    const opts = { once: true, passive: true } as const
    window.addEventListener('pointerdown', done, opts)
    window.addEventListener('keydown', done, opts)
    window.addEventListener('wheel', done, opts)
    window.addEventListener('touchmove', done, opts)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', done)
      window.removeEventListener('keydown', done)
      window.removeEventListener('wheel', done)
      window.removeEventListener('touchmove', done)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="intro" aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] overflow-hidden" exit={{ opacity: 1 }} transition={{ duration: 1 }}>
          <motion.div
            className="absolute inset-x-0 top-0 h-[56%]"
            style={{ background: `${PUFFS('bottom')}, linear-gradient(180deg,#8f97e6 0%,#d9d2fb 70%,#f4ecff 100%)` }}
            exit={{ y: '-105%', filter: 'blur(6px)' }}
            transition={{ duration: 1, ease: [0.7, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[56%]"
            style={{ background: `${PUFFS('top')}, linear-gradient(0deg,#f6c9da 0%,#eadff9 70%,#f4ecff 100%)` }}
            exit={{ y: '105%', filter: 'blur(6px)' }}
            transition={{ duration: 1, ease: [0.7, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute inset-0 grid place-items-center"
            exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center text-[#1c2160]">
              <motion.p
                dir="ltr"
                initial={{ opacity: 0, y: 20, letterSpacing: '0.3em' }}
                animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-5xl font-black sm:text-7xl"
              >
                Prompt &amp; Play
              </motion.p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.5 }} className="mt-3 text-sm font-semibold">
                מבית אקו מדיה
              </motion.p>
            </div>
          </motion.div>
          <motion.div
            className="absolute left-0 top-[46%]"
            initial={{ x: '-15vw', y: 40, rotate: 20 }}
            animate={{ x: '110vw', y: -60, rotate: 8 }}
            transition={{ duration: 1.6, ease: [0.45, 0, 0.25, 1] }}
          >
            <PlaneIcon className="h-14 w-14" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
