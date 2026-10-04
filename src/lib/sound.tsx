import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

// גרוב דיפ האוס בסגנון ניו יורק (Web Audio): קיק ארבע לרבע, האי-האט באוף-ביט, קלאפ, בס חם וסטאבים של אקורדים.
// הכל מסונתז בדפדפן, בלי קבצי אודיו ובלי רישיונות.
type Cue = 'hover' | 'click' | 'copy' | 'open'

interface SoundCtx {
  enabled: boolean
  toggle: () => void
  play: (cue: Cue) => void
}

const Ctx = createContext<SoundCtx>({ enabled: false, toggle: () => {}, play: () => {} })

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)

const BPM = 122
const SIXTEENTH = 60 / BPM / 4
const SWING = 0.12 * SIXTEENTH

// Am9 → Dm9 → Fmaj9 → Em7, שתי תיבות לכל אקורד
const CHORDS = [
  { root: 33, notes: [57, 60, 64, 67, 71] },
  { root: 38, notes: [57, 60, 62, 65, 69] },
  { root: 29, notes: [57, 60, 64, 67, 65] },
  { root: 28, notes: [55, 59, 62, 64, 67] },
]
const STABS = [3, 6, 10, 13]
const BASS: [number, number][] = [
  [2, 0],
  [6, 0],
  [9, 12],
  [10, 0],
  [14, 0],
]

interface Engine {
  ctx: AudioContext
  music: GainNode
  open: BiquadFilterNode
  whoosh: GainNode
  duck: GainNode
  drums: GainNode
  echo: AudioNode
  pad: BiquadFilterNode
  cues: GainNode
  noise: AudioBuffer
  step: number
  nextTime: number
  timer?: number
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
  const music = ctx.createGain()
  music.gain.value = 0
  // פילטר שנפתח ככל שגוללים עמוק יותר באתר: למעלה המוזיקה עמומה, למטה היא מלאה
  const open = ctx.createBiquadFilter()
  open.type = 'lowpass'
  open.frequency.value = 1600
  open.Q.value = 0.7
  music.connect(open).connect(comp)

  const drums = ctx.createGain()
  drums.connect(music)

  // סייד-צ'יין: הבס והאקורדים "נושמים" עם הקיק, כמו במיקס האוס אמיתי
  const duck = ctx.createGain()
  duck.connect(music)
  duck.connect(reverb)

  // דיליי של שמינית מנוקדת לסטאבים
  const echo = ctx.createDelay(1)
  echo.delayTime.value = SIXTEENTH * 3
  const fb = ctx.createGain()
  fb.gain.value = 0.28
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 2200
  echo.connect(tone).connect(fb).connect(echo)
  const echoOut = ctx.createGain()
  echoOut.gain.value = 0.45
  tone.connect(echoOut).connect(duck)

  const pad = ctx.createBiquadFilter()
  pad.type = 'lowpass'
  pad.frequency.value = 650
  pad.connect(duck)

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

  return { ctx, music, open, whoosh, duck, drums, echo, pad, cues, noise, step: 0, nextTime: 0 }
}

function kick(e: Engine, t: number) {
  const { ctx } = e
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.frequency.setValueAtTime(140, t)
  o.frequency.exponentialRampToValueAtTime(46, t + 0.11)
  g.gain.setValueAtTime(0.55, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.42)
  o.connect(g).connect(e.drums)
  o.start(t)
  o.stop(t + 0.45)
  e.duck.gain.cancelScheduledValues(t)
  e.duck.gain.setValueAtTime(0.45, t)
  e.duck.gain.setTargetAtTime(1, t + 0.03, 0.09)
}

function noiseHit(e: Engine, t: number, freq: number, type: BiquadFilterType, level: number, decay: number, out: AudioNode = e.drums) {
  const { ctx } = e
  const src = ctx.createBufferSource()
  src.buffer = e.noise
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  const g = ctx.createGain()
  g.gain.setValueAtTime(level, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + decay)
  src.connect(f).connect(g).connect(out)
  src.start(t, Math.random() * 0.5)
  src.stop(t + decay + 0.02)
}

function clap(e: Engine, t: number) {
  for (const [dt, lv] of [
    [0, 0.09],
    [0.011, 0.08],
    [0.023, 0.1],
  ])
    noiseHit(e, t + dt, 1500, 'bandpass', lv, 0.16, e.duck)
}

function bass(e: Engine, n: number, t: number) {
  const { ctx } = e
  const g = ctx.createGain()
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.setValueAtTime(520, t)
  f.frequency.exponentialRampToValueAtTime(180, t + 0.2)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.2, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.001, t + SIXTEENTH * 1.8)
  f.connect(g).connect(e.duck)
  for (const type of ['sine', 'triangle'] as OscillatorType[]) {
    const o = ctx.createOscillator()
    o.type = type
    o.frequency.value = midi(n)
    o.connect(f)
    o.start(t)
    o.stop(t + SIXTEENTH * 2)
  }
}

function stab(e: Engine, notes: number[], t: number, level: number) {
  const { ctx } = e
  const g = ctx.createGain()
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.Q.value = 2
  f.frequency.setValueAtTime(2400, t)
  f.frequency.exponentialRampToValueAtTime(500, t + 0.22)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(level / notes.length, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  f.connect(g)
  g.connect(e.duck)
  g.connect(e.echo)
  for (const n of notes) {
    for (const [type, detune] of [
      ['sawtooth', -7],
      ['square', 6],
    ] as [OscillatorType, number][]) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = midi(n)
      o.detune.value = detune
      o.connect(f)
      o.start(t)
      o.stop(t + 0.32)
    }
  }
}

function padChord(e: Engine, notes: number[], t: number, seconds: number) {
  const { ctx } = e
  const g = ctx.createGain()
  const peak = 0.05 / notes.length
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.8)
  g.gain.setValueAtTime(peak, t + seconds - 0.4)
  g.gain.linearRampToValueAtTime(0, t + seconds + 0.3)
  g.connect(e.pad)
  for (const n of notes) {
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = midi(n)
    o.connect(g)
    o.start(t)
    o.stop(t + seconds + 0.35)
  }
}

// צעד אחד (שש-עשרית) בלופ של 8 תיבות; הכלים נכנסים בהדרגה בפעם הראשונה
function scheduleStep(e: Engine, step: number, time: number) {
  const s = step % 16
  const bar = Math.floor(step / 16)
  const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length]
  const t = s % 2 ? time + SWING : time
  if (s % 4 === 0) kick(e, t)
  if (bar >= 1 && s % 4 === 2) noiseHit(e, t, 8000, 'highpass', 0.07, 0.09)
  else if (bar >= 1 && s % 2 === 1) noiseHit(e, t, 9500, 'highpass', 0.022, 0.035)
  if (bar >= 2 && (s === 4 || s === 12)) clap(e, t)
  if (bar >= 2) for (const [bs, oct] of BASS) if (bs === s) bass(e, chord.root + 12 + oct, t)
  if (bar >= 4 && STABS.includes(s)) stab(e, chord.notes, t, s === 3 ? 0.11 : 0.08)
  if (s === 0 && bar % 2 === 0) padChord(e, chord.notes, t, SIXTEENTH * 32)
}

function startMusic(e: Engine) {
  e.step = 0
  e.nextTime = e.ctx.currentTime + 0.1
  e.timer = window.setInterval(() => {
    while (e.nextTime < e.ctx.currentTime + 0.15) {
      scheduleStep(e, e.step, e.nextTime)
      e.step = (e.step + 1) % (16 * 16)
      if (e.step === 0) e.step = 16 * 8
      e.nextTime += SIXTEENTH
    }
  }, 25)
}

function stopMusic(e: Engine) {
  clearInterval(e.timer)
  e.timer = undefined
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
      if (!e.timer) {
        CUE_NOTES[cue].forEach((n, i) => playBell(e, n, t + i * 0.09, e.cues, CUE_LEVEL[cue]))
        return
      }
      // כשהגרוב מתנגן, הצלילים לקוחים מהאקורד הנוכחי כדי שישבו בתוך המוזיקה
      const chord = CHORDS[Math.floor(e.step / 32) % CHORDS.length].notes
      if (cue === 'hover') noiseHit(e, t, 7000, 'highpass', 0.035, 0.05, e.cues)
      else if (cue === 'copy') chord.slice(1, 4).forEach((n, i) => playBell(e, n + 12, t + i * 0.07, e.cues, 0.05))
      else stab(e, chord.map((n) => n + 12), t, cue === 'open' ? 0.07 : 0.05)
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
      ramp(e.music.gain, e.ctx, 1, 4)
      if (!e.timer) startMusic(e)
    } else if (engine.current) {
      const e = engine.current
      stopMusic(e)
      ramp(e.music.gain, e.ctx, 0, 1.5)
      e.suspendTimer = window.setTimeout(() => void e.ctx.suspend(), 1700)
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
      e.open.frequency.setTargetAtTime(1600 * Math.pow(18000 / 1600, depth), t, 0.25)
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
