import { motion } from 'framer-motion'
import { Check, Copy, Lock } from 'lucide-react'
import { useState } from 'react'
import { fillPrompt, PROPRIETARY, type Skill } from '../data/skills'
import { withWatermark } from '../lib/brand'
import { copyText } from '../lib/copy'
import { celebrateCopy } from '../lib/copyFx'
import { openSkill } from '../lib/skillBus'
import { useSound } from '../lib/sound'

// כרטיס קומפקטי: מה מקבלים, באילו כלים זה עובד, והעתקה ישירה מהכרטיס
export function SkillCard({ skill, index = 0 }: { skill: Skill; index?: number }) {
  const { play } = useSound()
  const [copied, setCopied] = useState(false)
  const locked = PROPRIETARY.has(skill.category)

  const open = () => {
    play('open')
    openSkill(skill.id)
  }
  const copy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget
    if (await copyText(withWatermark(fillPrompt(skill)))) {
      play('copy')
      celebrateCopy(btn)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: (index % 8) * 0.04, duration: 0.35 }}
      onMouseEnter={() => play('hover')}
      className="glass relative flex h-full flex-col items-center rounded-2xl p-6 text-center transition-colors hover:border-white/35 hover:bg-white/[0.14]"
    >
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-white/60">
        <span>{skill.category_he}</span>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-white/80">
            <Lock className="h-3 w-3" />
            בלעדי לאקו מדיה
          </span>
        )}
      </div>

      <h3 className="mt-2 text-lg font-bold leading-snug">
        {/* כל הכרטיס לחיץ לפתיחה, הכפתורים יושבים מעל */}
        <button type="button" onClick={open} className="text-center after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
          {skill.title_he}
        </button>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-white/75">{skill.outcome_he ?? skill.short_desc}</p>

      {!!skill.tools?.length && (
        <p className="mt-3 text-xs text-white/55">
          מתאים ל:{' '}
          <span dir="ltr" className="font-medium text-white/75">
            {skill.tools.join(' · ')}
          </span>
        </p>
      )}

      <div className="relative z-10 mt-auto flex w-full gap-2 pt-5">
        {!locked && (
          <button
            type="button"
            onClick={copy}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition ${
              copied ? 'bg-wa text-void' : 'bg-white text-[#141846] hover:bg-white/90'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'הועתק!' : 'העתק'}
          </button>
        )}
        <button
          type="button"
          onClick={open}
          className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full border border-white/25 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {locked ? 'לפרטים' : 'התאמה לעסק'}
        </button>
      </div>
    </motion.article>
  )
}
