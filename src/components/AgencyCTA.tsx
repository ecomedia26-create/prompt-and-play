import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useIsTouch } from '../hooks/useIsTouch'
import { BRAND } from '../lib/brand'
import { RevealTitle } from './RevealTitle'
import { WhatsAppButton } from './WhatsAppButton'
import { WhatsAppIcon } from './WhatsAppIcon'

// ---- הדגמות חיות לכל שירות ----

// אתרי 5D: שכבות זכוכית בתלת-ממד שמסתובבות אחרי העכבר
function Demo5D() {
  const touch = useIsTouch()
  const rx = useMotionValue(-18)
  const ry = useMotionValue(28)
  const sx = useSpring(rx, { stiffness: 80, damping: 16 })
  const sy = useSpring(ry, { stiffness: 80, damping: 16 })
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (touch) return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 70)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 50)
  }
  const layers = ['#00F0FF', '#7c8cff', '#9333EA', '#f0abfc']
  return (
    <div onPointerMove={onMove} className="grid h-full place-items-center [perspective:1100px]">
      <motion.div
        style={{ rotateX: sx, rotateY: sy, transformStyle: 'preserve-3d' }}
        animate={touch ? { rotateY: [20, -20, 20] } : undefined}
        transition={touch ? { duration: 8, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className="relative h-48 w-64 sm:h-56 sm:w-80"
      >
        {layers.map((c, i) => (
          <div
            key={c}
            className="absolute inset-0 rounded-2xl border border-white/40 backdrop-blur-[2px]"
            style={{ transform: `translateZ(${i * 34 - 50}px)`, background: `linear-gradient(135deg, ${c}55, ${c}10)` }}
          >
            {i === layers.length - 1 && (
              <div className="flex h-full flex-col justify-between p-4 text-start">
                <span className="font-display text-xl font-black">5D</span>
                <span className="text-xs text-white/80">שכבה {i + 1} · WebGL · Scroll · Sound</span>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// סרטוני AI: נגן עם סצנות מתחלפות, REC וטיימקוד רץ
const SCENES = [
  'radial-gradient(circle at 30% 70%, #ffb38a, transparent 55%), linear-gradient(160deg,#1d2b64,#f8cdda)',
  'radial-gradient(circle at 70% 30%, #00F0FF88, transparent 50%), linear-gradient(200deg,#0f0c29,#302b63 55%,#24243e)',
  'radial-gradient(circle at 50% 80%, #f0abfc, transparent 55%), linear-gradient(140deg,#355c7d,#6c5b7b,#c06c84)',
]
function DemoVideo() {
  const [scene, setScene] = useState(0)
  const [frames, setFrames] = useState(0)
  useEffect(() => {
    const a = setInterval(() => setScene((s) => (s + 1) % SCENES.length), 2600)
    const b = setInterval(() => setFrames((f) => f + 1), 1000 / 24)
    return () => {
      clearInterval(a)
      clearInterval(b)
    }
  }, [])
  const tc = `00:00:${String(Math.floor(frames / 24) % 60).padStart(2, '0')}:${String(frames % 24).padStart(2, '0')}`
  return (
    <div className="grid h-full place-items-center">
      <div className="relative aspect-[9/14] h-[85%] max-h-80 overflow-hidden rounded-2xl border border-white/25 shadow-2xl">
        <AnimatePresence>
          <motion.div
            key={scene}
            className="absolute inset-0"
            style={{ background: SCENES[scene] }}
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          />
        </AnimatePresence>
        <div dir="ltr" className="absolute inset-x-0 top-0 flex items-center justify-between p-3 font-mono text-[11px] text-white">
          <span className="flex items-center gap-1.5">
            <motion.i className="h-2 w-2 rounded-full bg-red-500" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
            REC
          </span>
          <span>{tc}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-lg font-black leading-tight text-white">הסיפור של המותג שלכם</p>
          <div className="mt-2 h-1 overflow-hidden rounded bg-white/25">
            <motion.div key={scene} className="h-full bg-white" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2.6, ease: 'linear' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// בוטים: שיחת וואטסאפ שמתנהלת לבד
const CHAT: { me: boolean; text: string }[] = [
  { me: false, text: 'היי, אפשר לקבוע תור לתספורת מחר?' },
  { me: true, text: 'בטח! יש לנו 10:30 או 17:00. מה נוח לך?' },
  { me: false, text: '17:00 מעולה' },
  { me: true, text: 'נקבע ✅ שלחתי תזכורת ליומן. נתראה מחר!' },
]
function DemoBot() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x >= CHAT.length + 2 ? 0 : x + 1)), 1200)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="grid h-full place-items-center">
      <div className="w-72 overflow-hidden rounded-2xl border border-white/20 bg-[#0b141a] shadow-2xl">
        <div className="flex items-center gap-2 bg-[#202c33] px-3 py-2.5 text-sm font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-wa text-void">
            <WhatsAppIcon className="h-4 w-4" />
          </span>
          המספרה של דני · בוט
        </div>
        <div className="flex h-56 flex-col justify-end gap-1.5 p-3 text-[13px]">
          <AnimatePresence initial={false}>
            {CHAT.slice(0, Math.min(n, CHAT.length)).map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`max-w-[85%] rounded-lg px-2.5 py-1.5 ${m.me ? 'self-start bg-[#005c4b]' : 'self-end bg-[#202c33]'}`}
              >
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

const PANELS: { kicker: string; title: string; text: string; chips: string[]; demo: ReactNode }[] = [
  {
    kicker: '01',
    title: 'אתרי 5D',
    text: 'אתרים חיים בתלת-ממד, עם גלילה קולנועית, סאונד ותנועה. בדיוק כמו האתר שאתם גולשים בו עכשיו.',
    chips: ['WebGL', 'אנימציה', 'סאונד', 'מובייל מהיר'],
    demo: <Demo5D />,
  },
  {
    kicker: '02',
    title: 'סרטוני AI',
    text: 'פרסומות וידאו קולנועיות ב-AI, מהרעיון והתסריט ועד הגרסה הסופית לרשתות.',
    chips: ['Runway', 'Kling', 'Suno', 'עריכה'],
    demo: <DemoVideo />,
  },
  {
    kicker: '03',
    title: 'בוטים לעסקים',
    text: 'בוט וואטסאפ שעונה ללקוחות 24/7, מסנן לידים, לוקח הזמנות וקובע תורים.',
    chips: ['וואטסאפ', 'CRM', 'יומן', 'לידים'],
    demo: <DemoBot />,
  },
]

function Panel({ p }: { p: (typeof PANELS)[number] }) {
  return (
    <article className="grid h-full w-full shrink-0 overflow-hidden rounded-[2rem] border border-white/15 bg-[#151a4c]/80 backdrop-blur-xl lg:w-[78vw] lg:max-w-6xl lg:grid-cols-2">
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <span className="font-mono text-sm text-white/50">{p.kicker}</span>
        <h3 className="mt-2 font-display text-[clamp(2.4rem,5vw,4.5rem)] font-black leading-none tracking-tight">{p.title}</h3>
        <p className="mt-4 max-w-md text-lg text-white/80">{p.text}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {p.chips.map((c) => (
            <span key={c} className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="relative min-h-[300px] border-t border-white/10 bg-black/15 lg:border-t-0 lg:border-s">{p.demo}</div>
    </article>
  )
}

// אקו מדיה: שלושה פאנלים גדולים שזזים לרוחב בזמן הגלילה (במחשב), ובסוף קריאה אחת לפעולה
export function AgencyCTA() {
  const touch = useIsTouch()
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const [wide, setWide] = useState(false)
  const { scrollYProgress } = useScroll({ target: pin, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, dist])
  const bar = useTransform(scrollYProgress, [0.05, 0.95], ['0%', '100%'])

  useLayoutEffect(() => {
    const measure = () => {
      const w = window.innerWidth >= 1024 && !touch
      setWide(w)
      // מימין לשמאל: כמה צריך להזיז כדי שהפאנל האחרון (השמאלי) ייכנס למסך. offsetLeft לא מושפע מה-transform
      const last = track.current?.lastElementChild as HTMLElement | null
      if (last) setDist(Math.max(-last.offsetLeft + window.innerWidth * 0.06, 0))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [touch, wide])

  return (
    <section id="agency" className="relative scroll-mt-24 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-sm font-semibold text-white/75">
          {BRAND.nameHe} · <span dir="ltr">{BRAND.nameEn}</span>
        </p>
        <RevealTitle className="mt-2 text-[clamp(2.6rem,8vw,7rem)] leading-[0.95] tracking-tight">מה אנחנו בונים</RevealTitle>
        <p className="mt-4 max-w-2xl text-lg text-white/85">הפרומפטים בחינם. כשתרצו את הגרסה המלאה, בהתאמה למותג שלכם, אנחנו כאן.</p>
      </div>

      {wide ? (
        <div ref={pin} style={{ height: `calc(100vh + ${dist}px)` }} className="relative mt-10">
          <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
            <motion.div ref={track} style={{ x }} className="flex h-[72vh] gap-6 px-[6vw]">
              {PANELS.map((p) => (
                <Panel key={p.title} p={p} />
              ))}
            </motion.div>
            <div className="mx-auto mt-8 h-[2px] w-48 overflow-hidden rounded bg-white/20">
              <motion.div style={{ width: bar }} className="h-full bg-white" />
            </div>
          </div>
        </div>
      ) : (
        <div ref={track} className="mx-auto mt-10 flex max-w-7xl flex-col gap-5 px-4 sm:px-6">
          {PANELS.map((p) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Panel p={p} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h2 className="font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-black leading-[1.02] tracking-tight">
          האתר הזה נבנה ע"י אקו מדיה.
          <br />
          רוצים כזה לעסק שלכם?
        </h2>
        <div className="mt-10 flex flex-col items-center gap-4">
          <WhatsAppButton label="דברו איתנו בוואטסאפ" />
          <a
            href={BRAND.siteUrl}
            target="_blank"
            rel="noopener"
            className="text-sm font-semibold text-white/80 underline-offset-4 transition hover:text-white hover:underline"
          >
            לאתר אקו מדיה: <span dir="ltr">{BRAND.siteDisplay}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
