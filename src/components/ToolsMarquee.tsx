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
    <div dir="ltr" aria-hidden="true" className="relative overflow-hidden border-y border-white/10 bg-white/[0.04] py-4 backdrop-blur-sm">
      <motion.div style={{ x }} className="flex w-max gap-10 whitespace-nowrap">
        {[0, 1].map((k) => (
          <div key={k} className="flex gap-10">
            {TOOLS.map((t) => (
              <span key={t} className="font-display text-2xl font-black tracking-tight text-white/55 sm:text-3xl">
                {t}
                <span className="ms-10 text-white/25">✦</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
