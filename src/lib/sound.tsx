import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

// סאונד מותג מסונתז ב-Web Audio: פסקול אמביינט + אפקטים לאינטראקציות, בלי קבצי אודיו.
type Cue = 'hover' | 'click' | 'copy' | 'open'

interface SoundCtx {
  enabled: boolean
  toggle: () => void
  play: (cue: Cue) => void
}

const Ctx = createContext<SoundCtx>({ enabled: false, toggle: () => {}, play: () => {} })

interface Engine {
  ctx: AudioContext
  master: GainNode
  ambient: GainNode
  sources: AudioScheduledSourceNode[]
}

const CUES: Record<Cue, { f0: number; f1: number; d: number; v: number; type: OscillatorType }> = {
  hover: { f0: 1200, f1: 1800, d: 0.07, v: 0.08, type: 'sine' },
  click: { f0: 620, f1: 240, d: 0.12, v: 0.22, type: 'triangle' },
  copy: { f0: 660, f1: 1980, d: 0.3, v: 0.25, type: 'sine' },
  open: { f0: 180, f1: 720, d: 0.35, v: 0.16, type: 'sawtooth' },
}

function buildEngine(): Engine {
  const ctx = new AudioContext()
  const comp = ctx.createDynamicsCompressor()
  comp.connect(ctx.destination)
  const master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(comp)

  // פד אמביינט "הד": שלושה מתנדים מכוונים מעט אחד מהשני, דרך פילטר שנושם לאט
  const ambient = ctx.createGain()
  ambient.gain.value = 0
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 700
  filter.Q.value = 6
  filter.connect(ambient).connect(master)

  const sources: AudioScheduledSourceNode[] = []
  for (const [freq, type, detune] of [
    [55, 'sine', 0],
    [110, 'sawtooth', -7],
    [164.81, 'triangle', 6],
  ] as [number, OscillatorType, number][]) {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = freq
    o.detune.value = detune
    const g = ctx.createGain()
    g.gain.value = type === 'sawtooth' ? 0.18 : 0.5
    o.connect(g).connect(filter)
    o.start()
    sources.push(o)
  }
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.08
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 450
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()
  sources.push(lfo)

  return { ctx, master, ambient, sources }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const engine = useRef<Engine | null>(null)

  const play = useCallback(
    (cue: Cue) => {
      const e = engine.current
      if (!enabled || !e) return
      const { ctx, master } = e
      const p = CUES[cue]
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain).connect(master)
      osc.type = p.type
      osc.frequency.setValueAtTime(p.f0, t)
      osc.frequency.exponentialRampToValueAtTime(p.f1, t + p.d)
      gain.gain.setValueAtTime(p.v, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + p.d + 0.08)
      osc.start(t)
      osc.stop(t + p.d + 0.1)
    },
    [enabled],
  )

  // חייב לרוץ בתוך ה-click עצמו: Safari ו-iOS לא מפעילים אודיו שנוצר מחוץ למחווה של המשתמש
  const toggle = useCallback(() => {
    const next = !enabled
    if (next) {
      const e = (engine.current ??= buildEngine())
      void e.ctx.resume()
      const t = e.ctx.currentTime
      e.ambient.gain.cancelScheduledValues(t)
      e.ambient.gain.setValueAtTime(e.ambient.gain.value, t)
      e.ambient.gain.linearRampToValueAtTime(0.14, t + 1.5)
    } else if (engine.current) {
      const e = engine.current
      const t = e.ctx.currentTime
      e.ambient.gain.cancelScheduledValues(t)
      e.ambient.gain.setValueAtTime(e.ambient.gain.value, t)
      e.ambient.gain.linearRampToValueAtTime(0, t + 0.6)
      setTimeout(() => void e.ctx.suspend(), 700)
    }
    setEnabled(next)
  }, [enabled])

  // השהיית הפסקול כשהלשונית מוסתרת
  useEffect(() => {
    const onVis = () => {
      const e = engine.current
      if (!e || !enabled) return
      void (document.hidden ? e.ctx.suspend() : e.ctx.resume())
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [enabled])

  useEffect(
    () => () => {
      engine.current?.sources.forEach((s) => s.stop())
      void engine.current?.ctx.close()
    },
    [],
  )

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSound = () => useContext(Ctx)
