import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useRef } from 'react'

const TOOLS = ['Claude', 'ChatGPT', 'Gemini', 'Runway', 'Kling', 'Suno', 'Midjourney', 'After Effects', 'WhatsApp', 'FFmpeg']

const wrap = (min: number, max: number, v: number) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

// פס הכלים זורם לבד, ומאיץ ומחליף כיוון לפי מהירות הגלילה
export function ToolsMarquee({ calm = false }: { calm?: boolean }) {
  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [0, 1000], [0, 5], { clamp: false })
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`)
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    if (calm) return
    let move = dir.current * 1.6 * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    move += dir.current * move * f
    base.set(base.get() + move)
  })

  return (
    <div dir="ltr" aria-hidden="true" className="relative overflow-hidden py-5 [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
      <motion.div style={{ x }} className="flex w-max gap-14 whitespace-nowrap">
        {[0, 1].map((k) => (
          <div key={k} className="flex gap-14">
            {TOOLS.map((t) => (
              <span key={t} className="font-display text-lg font-bold tracking-tight text-white/50 sm:text-xl">
                {t}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
