import { useEffect, useState } from 'react'

// האם הוגדר מפתח AI ב-Vercel. נבדק פעם אחת לכל טעינת עמוד; בפיתוח מקומי התשובה היא false.
let check: Promise<boolean> | null = null

export function aiAvailable() {
  check ??= fetch('/api/assistant')
    .then((r) => (r.ok ? r.json() : { ai: false }))
    .then((d: { ai?: boolean }) => !!d.ai)
    .catch(() => false)
  return check
}

export function useAiAvailable(enabled = true) {
  const [ai, setAi] = useState(false)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    void aiAvailable().then((v) => alive && setAi(v))
    return () => {
      alive = false
    }
  }, [enabled])
  return ai
}
