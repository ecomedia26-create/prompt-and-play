import { MotionConfig } from 'framer-motion'
import { Accessibility } from './components/Accessibility'
import { AgencyCTA } from './components/AgencyCTA'
import { AngelDust } from './components/AngelDust'
import { AssistantChat } from './components/AssistantChat'
import { CopyFlight } from './components/CopyFlight'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Legal } from './components/Legal'
import { Intro } from './components/Intro'
import { Library } from './components/Library'
import { Manifesto } from './components/Manifesto'
import { ProTips } from './components/ProTips'
import { ToolsMarquee } from './components/ToolsMarquee'
import { WhatsAppFab } from './components/WhatsAppFab'
import { ShareFab } from './components/ShareFab'
import { Suspense, lazy, useEffect } from 'react'
import { useIsTouch, usePrefersReducedMotion } from './hooks/useIsTouch'
import { useA11y } from './lib/a11y'
import { jumpToHash, startSmoothScroll } from './lib/smoothScroll'

// השמיים והמטוס (three.js) נטענים בנפרד, אחרי שהדף כבר מוצג: בלי זה הטלפון מחכה לכל הספרייה לפני שהוא מראה משהו
const CloudSky = lazy(() => import('./components/CloudSky').then((m) => ({ default: m.CloudSky })))
const PaperPlane = lazy(() => import('./components/PaperPlane').then((m) => ({ default: m.PaperPlane })))

export default function App() {
  const touch = useIsTouch()
  const prefersReduced = usePrefersReducedMotion()
  // "עצירת אנימציות" בתפריט הנגישות שקולה להגדרת הפחתת תנועה במערכת
  const { calm } = useA11y()
  const reduced = prefersReduced || calm
  useEffect(() => (touch || reduced ? undefined : startSmoothScroll()), [touch, reduced])
  useEffect(jumpToHash, [])
  return (
    <MotionConfig reducedMotion={calm ? 'always' : 'user'}>
    <div dir="rtl" className="relative min-h-screen overflow-x-clip font-sans text-white">
      {!reduced && (
        <Suspense fallback={<div className="sky-fallback pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />}>
          <CloudSky lite={touch} />
        </Suspense>
      )}
      {!reduced && !touch && <AngelDust />}
      {!reduced && (
        <Suspense fallback={null}>
          <PaperPlane touch={touch} />
        </Suspense>
      )}
      <Header />
      <main>
        <Hero />
        <ToolsMarquee calm={reduced} />
        <HowItWorks />
        <Library />
        <Manifesto />
        <ProTips />
        <AgencyCTA />
      </main>
      <Footer />
      <WhatsAppFab />
      <ShareFab />
      <AssistantChat />
      <CopyFlight />
      {!reduced && <Intro />}
      <Accessibility />
      <Legal />
    </div>
    </MotionConfig>
  )
}
