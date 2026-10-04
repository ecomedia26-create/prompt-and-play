import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

// פסקול אמביינט גנרטיבי (Web Audio): אקורדים רכים וחמים, פעמונים עדינים וריוורב של "שמיים".
// הכל מסונתז בדפדפן, בלי קבצי אודיו ובלי רישיונות.
type Cue = 'hover' | 'click' | 'copy' | 'open'

interface SoundCtx {
  enabled: boolean
  toggle: () => void
  play: (cue: Cue) => void
}

const Ctx = createContext<SoundCtx>({ enabled: false, toggle: () => {}, play: () => {} })

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

// Cmaj9 → Am9 → Fmaj9 → G6/9: מהלך חלומי ופתוח
const CHORDS = [
  [48, 52, 55, 59, 62],
  [45, 52, 55, 59, 60],
  [41, 48, 52, 57, 55],
  [43, 50, 57, 59, 64],
]
const BELLS = [72, 74, 76, 79, 81, 84]
const CHORD_SECONDS = 9

interface Engine {
  ctx: AudioContext
  music: GainNode
  pad: BiquadFilterNode
  bells: GainNode
  cues: GainNode
  timers: number[]
  chord: number
  suspendTimer?: number
}

function impulse(ctx: AudioContext, seconds: number, decay: number) {
  const len = Math.floor(ctx.sampleRate * seconds)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

function buildEngine(): Engine {
  const ctx = new AudioContext()
  const comp = ctx.createDynamicsCompressor()
  comp.threshold.value = -18
  comp.connect(ctx.destination)

  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 4, 2.4)
  const wet = ctx.createGain()
  wet.gain.value = 0.7
  reverb.connect(wet).connect(comp)

  // ערוץ המוזיקה (פד + פעמונים): עולה ויורד בפייד רך בהפעלה/כיבוי
  const music = ctx.createGain()
  music.gain.value = 0
  music.connect(comp)
  music.connect(reverb)

  const pad = ctx.createBiquadFilter()
  pad.type = 'lowpass'
  pad.frequency.value = 1100
  pad.Q.value = 0.5
  pad.connect(music)

  const bells = ctx.createGain()
  bells.gain.value = 0.55
  bells.connect(music)

  const cues = ctx.createGain()
  cues.gain.value = 0.5
  cues.connect(comp)
  cues.connect(reverb)

  return { ctx, music, pad, bells, cues, timers: [], chord: 0 }
}

function playChord(e: Engine, notes: number[], t: number) {
  const { ctx, pad } = e
  const peak = 0.11 / notes.length
  for (const n of notes) {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(peak, t + 3.5)
    g.gain.setValueAtTime(peak, t + CHORD_SECONDS - 1)
    g.gain.linearRampToValueAtTime(0, t + CHORD_SECONDS + 4)
    g.connect(pad)
    for (const [type, detune] of [
      ['sine', -4],
      ['triangle', 5],
    ] as [OscillatorType, number][]) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = midi(n)
      o.detune.value = detune
      o.connect(g)
      o.start(t)
      o.stop(t + CHORD_SECONDS + 4.2)
    }
  }
}

function playBell(e: Engine, n: number, t: number, out: AudioNode = e.bells, level = 0.06) {
  const { ctx } = e
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(level, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2)
  g.connect(out)
  for (const [mult, amp] of [
    [1, 1],
    [2.003, 0.25],
    [3.01, 0.08],
  ]) {
    const o = ctx.createOscillator()
    const og = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = midi(n) * mult
    og.gain.value = amp
    o.connect(og).connect(g)
    o.start(t)
    o.stop(t + 3.3)
  }
}

function startMusic(e: Engine) {
  const next = () => {
    playChord(e, CHORDS[e.chord % CHORDS.length], e.ctx.currentTime + 0.05)
    e.chord++
  }
  next()
  e.timers.push(window.setInterval(next, (CHORD_SECONDS - 1) * 1000))
  const bell = () => {
    playBell(e, BELLS[Math.floor(Math.random() * BELLS.length)], e.ctx.currentTime + 0.05)
    e.timers.push(window.setTimeout(bell, 2200 + Math.random() * 3800))
  }
  e.timers.push(window.setTimeout(bell, 2500))
}

function stopMusic(e: Engine) {
  e.timers.forEach((id) => {
    clearInterval(id)
    clearTimeout(id)
  })
  e.timers = []
}

function ramp(param: AudioParam, ctx: AudioContext, to: number, seconds: number) {
  const t = ctx.currentTime
  param.cancelScheduledValues(t)
  param.setValueAtTime(param.value, t)
  param.linearRampToValueAtTime(to, t + seconds)
}

// צלילי ממשק מוזיקליים מאותו סולם, כך שהם משתלבים בפסקול
const CUE_NOTES: Record<Cue, number[]> = {
  hover: [84],
  click: [76],
  open: [72, 79],
  copy: [76, 79, 84],
}
const CUE_LEVEL: Record<Cue, number> = { hover: 0.025, click: 0.07, open: 0.07, copy: 0.09 }

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const engine = useRef<Engine | null>(null)

  const play = useCallback(
    (cue: Cue) => {
      const e = engine.current
      if (!enabled || !e) return
      CUE_NOTES[cue].forEach((n, i) => playBell(e, n, e.ctx.currentTime + i * 0.09, e.cues, CUE_LEVEL[cue]))
    },
    [enabled],
  )

  // חייב לרוץ בתוך ה-click עצמו: Safari ו-iOS לא מפעילים אודיו שנוצר מחוץ למחווה של המשתמש
  const toggle = useCallback(() => {
    const next = !enabled
    if (next) {
      const e = (engine.current ??= buildEngine())
      clearTimeout(e.suspendTimer)
      void e.ctx.resume()
      ramp(e.music.gain, e.ctx, 1, 3)
      startMusic(e)
    } else if (engine.current) {
      const e = engine.current
      stopMusic(e)
      ramp(e.music.gain, e.ctx, 0, 1.5)
      e.suspendTimer = window.setTimeout(() => void e.ctx.suspend(), 1700)
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
      if (!engine.current) return
      stopMusic(engine.current)
      void engine.current.ctx.close()
    },
    [],
  )

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSound = () => useContext(Ctx)
