import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpLeft, Lock } from 'lucide-react'
import { useRef } from 'react'
import { accentFor, PROPRIETARY, type Skill } from '../data/skills'
import { useIsTouch } from '../hooks/useIsTouch'
import { useSound } from '../lib/sound'

const SPAN: Record<Skill['grid_size'], string> = {
  large: 'sm:col-span-2 lg:row-span-2',
  medium: 'sm:col-span-2',
  compact: '',
}

interface Props {
  skill: Skill
  index: number
  onOpen: (s: Skill) => void
}

// כרטיסיית Glassmorphism עם הטיית 3D Tilt בריחוף וזרקור ניאון שעוקב אחרי הסמן
export function SkillCard({ skill, index, onOpen }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  const touch = useIsTouch()
  const { play } = useSound()
  const accent = accentFor(skill.category)
  const locked = PROPRIETARY.has(skill.category)
  const large = skill.grid_size === 'large'

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [9, -9]), { stiffness: 150, damping: 15 })
  const ry = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 150, damping: 15 })
  const gx = useTransform(mx, (v) => `${v * 100}%`)
  const gy = useTransform(my, (v) => `${v * 100}%`)
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, ${accent}26, transparent 60%)`

  const onMove = (e: React.MouseEvent) => {
    if (touch || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: (index % 8) * 0.06, duration: 0.5 }}
      className={`${SPAN[skill.grid_size]} [perspective:1000px]`}
    >
      <motion.button
        ref={ref}
        type="button"
        onMouseMove={onMove}
        onMouseEnter={() => play('hover')}
        onMouseLeave={reset}
        onClick={() => {
          play('open')
          onOpen(skill)
        }}
        style={touch ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="glass group relative flex h-full min-h-[190px] w-full flex-col overflow-hidden rounded-3xl p-6 text-start transition-colors hover:border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-blue"
      >
        {!touch && <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlight }} />}
        <div
          className="pointer-events-none absolute -top-16 -end-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
          style={{ background: accent }}
        />

        <div className="relative flex items-start justify-between gap-3" style={{ transform: 'translateZ(30px)' }}>
          <span
            className="rounded-full border px-3 py-1 text-[11px] font-semibold"
            style={{ borderColor: `${accent}55`, color: accent, background: `${accent}12` }}
          >
            {skill.category_he}
          </span>
          {locked ? (
            <Lock className="h-5 w-5 text-fuchsia-300" />
          ) : (
            <ArrowUpLeft className="h-5 w-5 text-white/40 transition group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:text-white" />
          )}
        </div>

        <div className="relative mt-auto pt-6" style={{ transform: 'translateZ(45px)' }}>
          <p dir="ltr" className="text-end font-mono text-[11px] uppercase tracking-widest text-white/40">
            {skill.title_en}
          </p>
          <h3 className={`mt-1 font-display font-bold leading-tight ${large ? 'text-3xl' : 'text-xl'}`}>{skill.title_he}</h3>
          <p className={`mt-2 text-white/65 ${large ? 'text-base' : 'line-clamp-2 text-sm'}`}>{skill.short_desc}</p>
          <div className="mt-4 flex flex-wrap gap-1.5" dir="ltr">
            {skill.tags.map((t) => (
              <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/55">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </motion.button>
    </motion.div>
  )
}
