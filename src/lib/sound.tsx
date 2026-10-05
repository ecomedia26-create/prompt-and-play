import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

// מוזיקת הרקע של האתר (קובץ ב-public/audio) מתנגנת רק אחרי לחיצה, עם פייד רך.
// צלילי הממשק ומשב הרוח בגלילה מסונתזים בדפדפן (Web Audio).
type Cue = 'hover' | 'click' | 'copy' | 'open'

interface SoundCtx {
  enabled: boolean
  toggle: () => void
  play: (cue: Cue) => void
}

const Ctx = createContext<SoundCtx>({ enabled: false, toggle: () => {}, play: () => {} })

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

const MUSIC_SRC = '/audio/background.mp3'
const OPEN_TOP = 3500

interface Engine {
  ctx: AudioContext
  audio: HTMLAudioElement
  music: GainNode
  open: BiquadFilterNode
  whoosh: GainNode
  cues: GainNode
  noise: AudioBuffer
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
  comp.threshold.value = -16
  comp.ratio.value = 3
  // עוצמה כללית נעימה ברקע (הקומפרסור מוסיף הגברה אוטומטית)
  const master = ctx.createGain()
  master.gain.value = 0.5
  comp.connect(master).connect(ctx.destination)

  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 2.2, 3)
  const wet = ctx.createGain()
  wet.gain.value = 0.35
  reverb.connect(wet).connect(comp)

  // ערוץ המוזיקה: עולה ויורד בפייד רך בהפעלה/כיבוי
  const audio = new Audio(MUSIC_SRC)
  audio.loop = true
  audio.preload = 'auto'
  const music = ctx.createGain()
  music.gain.value = 0
  // פילטר שנפתח ככל שגוללים עמוק יותר באתר: למעלה המוזיקה מעט רכה, למטה היא מלאה
  const open = ctx.createBiquadFilter()
  open.type = 'lowpass'
  open.frequency.value = OPEN_TOP
  open.Q.value = 0.5
  ctx.createMediaElementSource(audio).connect(music).connect(open).connect(master)

  const cues = ctx.createGain()
  cues.gain.value = 0.5
  cues.connect(comp)
  cues.connect(reverb)

  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const d = noise.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1

  // משב רוח שעוצמתו עוקבת אחרי מהירות הגלילה
  const whoosh = ctx.createGain()
  whoosh.gain.value = 0
  const wf = ctx.createBiquadFilter()
  wf.type = 'bandpass'
  wf.frequency.value = 700
  wf.Q.value = 0.6
  const wsrc = ctx.createBufferSource()
  wsrc.buffer = noise
  wsrc.loop = true
  wsrc.connect(wf).connect(whoosh).connect(comp)
  wsrc.start()

  return { ctx, audio, music, open, whoosh, cues, noise }
}

function playBell(e: Engine, n: number, t: number, out: AudioNode, level: number) {
  const { ctx } = e
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(level, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6)
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
    o.stop(t + 1.7)
  }
}

function ramp(param: AudioParam, ctx: AudioContext, to: number, seconds: number) {
  const t = ctx.currentTime
  param.cancelScheduledValues(t)
  param.setValueAtTime(param.value, t)
  param.linearRampToValueAtTime(to, t + seconds)
}

// צלילי ממשק מוזיקליים מאותו סולם, כך שהם משתלבים בפסקול
const CUE_NOTES: Record<Cue, number[]> = {
  hover: [88],
  click: [81],
  open: [76, 83],
  copy: [81, 84, 88],
}
const CUE_LEVEL: Record<Cue, number> = { hover: 0.02, click: 0.05, open: 0.05, copy: 0.07 }

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const engine = useRef<Engine | null>(null)

  const play = useCallback(
    (cue: Cue) => {
      const e = engine.current
      if (!enabled || !e) return
      const t = e.ctx.currentTime + 0.01
      CUE_NOTES[cue].forEach((n, i) => playBell(e, n, t + i * 0.09, e.cues, CUE_LEVEL[cue]))
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
      void e.audio.play().catch(() => {})
      ramp(e.music.gain, e.ctx, 1, 3)
    } else if (engine.current) {
      const e = engine.current
      ramp(e.music.gain, e.ctx, 0, 1.5)
      e.suspendTimer = window.setTimeout(() => {
        e.audio.pause()
        void e.ctx.suspend()
      }, 1700)
    }
    setEnabled(next)
  }, [enabled])

  // הגלילה מנגנת: פותחת את הפילטר של המוזיקה ומשמיעה משב רוח לפי המהירות
  useEffect(() => {
    const e = engine.current
    if (!enabled || !e) return
    let lastY = window.scrollY
    let lastT = performance.now()
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const y = window.scrollY
      const v = Math.abs(y - lastY) / Math.max(now - lastT, 1)
      lastY = y
      lastT = now
      const depth = Math.min(y / (window.innerHeight * 1.5), 1)
      const t = e.ctx.currentTime
      e.open.frequency.setTargetAtTime(OPEN_TOP * Math.pow(18000 / OPEN_TOP, depth), t, 0.25)
      e.whoosh.gain.setTargetAtTime(Math.min(v * 0.06, 0.09), t, v > 0.05 ? 0.05 : 0.25)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      e.whoosh.gain.setTargetAtTime(0, e.ctx.currentTime, 0.1)
    }
  }, [enabled])

  // השהיית הפסקול כשהלשונית מוסתרת
  useEffect(() => {
    const onVis = () => {
      const e = engine.current
      if (!e || !enabled) return
      if (document.hidden) {
        e.audio.pause()
        void e.ctx.suspend()
      } else {
        void e.ctx.resume()
        void e.audio.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [enabled])

  useEffect(
    () => () => {
      if (!engine.current) return
      engine.current.audio.pause()
      void engine.current.ctx.close()
    },
    [],
  )

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSound = () => useContext(Ctx)
