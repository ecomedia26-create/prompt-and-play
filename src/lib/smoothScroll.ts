import Lenis from 'lenis'

// גלילה חלקה ואינרטית במחשב (במובייל נשארת הגלילה הטבעית)
let lenis: Lenis | null = null

export function startSmoothScroll() {
  lenis = new Lenis({ autoRaf: true, lerp: 0.09, anchors: true })
  return () => {
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el)
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// קישור ישיר לחלק באתר (למשל /#ads): קפיצה מיידית אחרי שהעמוד נבנה ומדד את עצמו.
// קופצים פעמיים, כי גובה החלקים (גופנים, הגלילה הצידית) מתייצב רק אחרי רגע
export function jumpToHash() {
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!id || id === 'privacy' || id === 'terms') return
  const jump = () => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - parseFloat(getComputedStyle(el).scrollMarginTop || '0')
    lenis?.resize()
    if (lenis) lenis.scrollTo(top, { immediate: true, force: true })
    else window.scrollTo({ top, behavior: 'instant' })
  }
  const timers = [400, 1200].map((ms) => setTimeout(jump, ms))
  return () => timers.forEach(clearTimeout)
}
