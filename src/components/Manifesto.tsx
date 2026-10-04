import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'

const TEXT = 'לא עוד פרומפטים באנגלית שצריך לנחש איך להשתמש בהם. כאן כל פרומפט מדבר עברית, מכיר את השוק הישראלי, ומוכן לעבוד בשביל העסק שלכם תוך דקה.'

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  const y = useTransform(progress, range, [8, 0])
  return (
    <motion.span style={{ opacity, y }} className="mx-[0.14em] inline-block">
      {word}
    </motion.span>
  )
}

// משפט גדול שנדלק מילה אחרי מילה בזמן הגלילה
export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = TEXT.split(' ')
  return (
    <section className="py-24 sm:py-32">
      <p ref={ref} className="mx-auto max-w-4xl px-4 text-center font-display text-3xl font-black leading-[1.3] sm:px-6 sm:text-4xl lg:text-5xl">
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </p>
    </section>
  )
}
