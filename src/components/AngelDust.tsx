import { useEffect, useRef } from 'react'

interface Mote {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
  hue: number
}

// שובל אבק כוכבים זוהר שעוקב אחרי הסמן, כמו מלאך שמרחף בשמיים (מסכי עכבר בלבד)
export function AngelDust() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const motes: Mote[] = []
    let px = -1
    let py = -1
    const onMove = (e: PointerEvent) => {
      const dist = px < 0 ? 0 : Math.hypot(e.clientX - px, e.clientY - py)
      const n = Math.min(6, 1 + Math.floor(dist / 8))
      for (let i = 0; i < n && motes.length < 260; i++) {
        motes.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.6,
          vy: Math.random() * 0.6 + 0.2,
          life: 1,
          size: Math.random() * 2.2 + 0.8,
          hue: Math.random() < 0.6 ? 45 : Math.random() < 0.5 ? 190 : 275,
        })
      }
      px = e.clientX
      py = e.clientY
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (!motes.length) return
      ctx.globalCompositeOperation = 'lighter'
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i]
        m.x += m.vx
        m.y += m.vy
        m.vy *= 0.985
        m.life -= 0.018
        if (m.life <= 0) {
          motes.splice(i, 1)
          continue
        }
        const r = m.size * (0.6 + m.life)
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 4)
        g.addColorStop(0, `hsla(${m.hue}, 100%, 92%, ${m.life})`)
        g.addColorStop(0.3, `hsla(${m.hue}, 100%, 70%, ${m.life * 0.5})`)
        g.addColorStop(1, `hsla(${m.hue}, 100%, 60%, 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(m.x, m.y, r * 4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] h-full w-full" />
}
