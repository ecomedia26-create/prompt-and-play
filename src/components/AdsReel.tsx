import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useSound } from '../lib/sound'

const ADS = [
  { src: '/videos/ad1.mp4?v=2', poster: '/videos/ad1.jpg?v=2', title: '26 פרומפטים בחינם' },
  { src: '/videos/ad2.mp4?v=2', poster: '/videos/ad2.jpg?v=2', title: 'אתרי 5D ובוטים לוואטסאפ' },
]

// שתי הפרסומות שאקו מדיה הפיקה ל-Prompt & Play. קישור ישיר: /#ads
export function AdsReel() {
  const { enabled, toggle } = useSound()
  const list = useRef<HTMLDivElement>(null)

  // סרטון אחד בכל פעם, והמוזיקה של האתר נעצרת כדי לא להתנגש בסאונד של הסרטון
  const onPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    list.current?.querySelectorAll('video').forEach((v) => v !== e.currentTarget && v.pause())
    if (enabled) toggle()
  }

  return (
    <section id="ads" aria-labelledby="ads-title" className="scroll-mt-24 px-4 pt-24 text-center sm:px-6">
      <h3 id="ads-title" className="font-display text-3xl font-bold sm:text-4xl">
        פרסומות שהפקנו <span className="whitespace-nowrap">ל-Prompt & Play</span>
      </h3>
      <p className="mx-auto mt-3 max-w-xl font-medium text-white [text-shadow:0_1px_12px_rgba(18,20,70,.45)]">
        סרטוני AI קצרים לרשתות, עם כתוביות בעברית. ככה זה נראה כשאנחנו עושים את זה בשבילכם.
      </p>
      <div ref={list} className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:gap-8">
        {ADS.map((ad, i) => (
          <motion.figure
            key={ad.src}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <video
              src={ad.src}
              poster={ad.poster}
              controls
              playsInline
              preload="none"
              onPlay={onPlay}
              aria-label={ad.title}
              className="aspect-[9/16] w-full rounded-3xl border border-white/20 bg-[#14183f] object-cover shadow-[0_20px_50px_-20px_rgba(18,20,70,.6)]"
            />
            <figcaption className="mt-3 text-sm font-semibold text-white/85">{ad.title}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
