import { motion } from 'framer-motion'
import { Play, Square } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Skill } from '../data/skills'
import { useAiAvailable } from '../lib/ai'
import { useSound } from '../lib/sound'

// "נסו עכשיו": עם מפתח AI ב-Vercel הגולש מריץ את הסקיל על הטקסט שלו והתשובה מוזרמת כאן.
export function TryItNow({ skill }: { skill: Skill }) {
  const ai = useAiAvailable()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const abort = useRef<AbortController | null>(null)
  const { play } = useSound()

  const run = async () => {
    if (running) {
      abort.current?.abort()
      return
    }
    if (!input.trim()) return
    play('click')
    setOutput('')
    setRunning(true)
    abort.current = new AbortController()
    try {
      const r = await fetch('/api/run', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ skill_id: skill.id, input }),
        signal: abort.current.signal,
      })
      if (!r.ok || !r.body) {
        setOutput(r.status === 429 ? 'הגעתם למכסת הניסיונות לעכשיו. נסו שוב מאוחר יותר, או פתחו ב-Claude.' : 'משהו השתבש. נסו לפתוח ב-Claude.')
        return
      }
      const reader = r.body.getReader()
      const dec = new TextDecoder()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        setOutput((o) => o + dec.decode(value, { stream: true }))
      }
      play('copy')
    } catch {
      // עצירה ידנית או ניתוק רשת: משאירים את מה שהגיע
    } finally {
      setRunning(false)
    }
  }

  // בלי מפתח AI ב-Vercel אין הרצה באתר; כפתורי "פתח ב-Claude / ChatGPT" שמעל מכסים את זה
  if (!ai) return null

  return (
    <div className="mt-6 rounded-2xl border border-neon-blue/25 bg-neon-blue/[0.04] p-4">
      <h3 className="flex items-center gap-2 font-bold">
        <Play className="h-4 w-4 text-neon-blue" />
        נסו עכשיו על העסק שלכם
      </h3>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        maxLength={4000}
        rows={3}
        placeholder="כתבו כאן על העסק או הדביקו את הטקסט שלכם. למשל: מסעדה איטלקית בחיפה, רוצים פרסומת לתפריט החדש"
        className="mt-3 w-full resize-y rounded-xl bg-black/35 p-3 text-sm outline-none placeholder:text-white/40 focus:ring-1 focus:ring-neon-blue/60"
      />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => void run()}
            disabled={!running && !input.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-neon-blue px-5 py-3 font-bold text-void transition disabled:opacity-40"
          >
            {running ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? 'עצירה' : 'הריצו כאן'}
          </motion.button>
      </div>
      {output && (
        <div
          aria-live="polite"
          className="mt-4 max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl bg-black/40 p-4 text-sm leading-relaxed text-white/90"
        >
          {output}
        </div>
      )}
    </div>
  )
}
