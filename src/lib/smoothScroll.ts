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
