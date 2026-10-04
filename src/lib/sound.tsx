import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

// סאונד מותג מסונתז ב-Web Audio: אין קבצי אודיו, אין משקל נוסף.
type Cue = 'hover' | 'click' | 'copy' | 'open'

interface SoundCtx {
  enabled: boolean
  toggle: () => void
  play: (cue: Cue) => void
}

const Ctx = createContext<SoundCtx>({ enabled: false, toggle: () => {}, play: () => {} })

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const ac = useRef<AudioContext | null>(null)

  const play = useCallback(
    (cue: Cue) => {
      if (!enabled) return
      const ctx = (ac.current ??= new AudioContext())
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain).connect(ctx.destination)
      const p = {
        hover: { f0: 880, f1: 1320, d: 0.06, v: 0.025, type: 'sine' as OscillatorType },
        click: { f0: 520, f1: 260, d: 0.09, v: 0.06, type: 'triangle' as OscillatorType },
        copy: { f0: 660, f1: 1760, d: 0.22, v: 0.07, type: 'sine' as OscillatorType },
        open: { f0: 220, f1: 660, d: 0.25, v: 0.05, type: 'sawtooth' as OscillatorType },
      }[cue]
      osc.type = p.type
      osc.frequency.setValueAtTime(p.f0, t)
      osc.frequency.exponentialRampToValueAtTime(p.f1, t + p.d)
      gain.gain.setValueAtTime(p.v, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + p.d + 0.05)
      osc.start(t)
      osc.stop(t + p.d + 0.06)
    },
    [enabled],
  )

  const toggle = useCallback(() => {
    setEnabled((e) => {
      if (!e) {
        const ctx = (ac.current ??= new AudioContext())
        void ctx.resume()
      }
      return !e
    })
  }, [])

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSound = () => useContext(Ctx)
