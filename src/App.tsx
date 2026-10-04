import { MotionConfig } from 'framer-motion'
import { Accessibility } from './components/Accessibility'
import { AgencyCTA } from './components/AgencyCTA'
import { AngelDust } from './components/AngelDust'
import { AssistantChat } from './components/AssistantChat'
import { CloudSky } from './components/CloudSky'
import { CopyFlight } from './components/CopyFlight'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Intro } from './components/Intro'
import { Library } from './components/Library'
import { Manifesto } from './components/Manifesto'
import { PaperPlane } from './components/PaperPlane'
import { ProTips } from './components/ProTips'
import { ToolsMarquee } from './components/ToolsMarquee'
import { WhatsAppFab } from './components/WhatsAppFab'
import { useEffect } from 'react'
import { useIsTouch, usePrefersReducedMotion } from './hooks/useIsTouch'
import { useA11y } from './lib/a11y'
import { startSmoothScroll } from './lib/smoothScroll'

export default function App() {
  const touch = useIsTouch()
  const prefersReduced = usePrefersReducedMotion()
  // "עצירת אנימציות" בתפריט הנגישות שקולה להגדרת הפחתת תנועה במערכת
  const { calm } = useA11y()
  const reduced = prefersReduced || calm
  useEffect(() => (touch || reduced ? undefined : startSmoothScroll()), [touch, reduced])
  return (
    <MotionConfig reducedMotion={calm ? 'always' : 'user'}>
    <div dir="rtl" className="relative min-h-screen overflow-x-clip font-sans text-white">
      {!reduced && <CloudSky lite={touch} />}
      {!reduced && !touch && <AngelDust />}
      {!reduced && <PaperPlane touch={touch} />}
      <Header />
      <main>
        <Hero />
        <ToolsMarquee calm={reduced} />
        <Library />
        <Manifesto />
        <HowItWorks />
        <ProTips />
        <AgencyCTA />
      </main>
      <Footer />
      <WhatsAppFab />
      <AssistantChat />
      <CopyFlight />
      {!reduced && <Intro />}
      <Accessibility />
    </div>
    </MotionConfig>
  )
}
