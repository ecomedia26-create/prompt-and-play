import { AgencyCTA } from './components/AgencyCTA'
import { AngelDust } from './components/AngelDust'
import { AssistantChat } from './components/AssistantChat'
import { CloudSky } from './components/CloudSky'
import { CopyFlight } from './components/CopyFlight'
import { CursorRing } from './components/CursorRing'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Intro } from './components/Intro'
import { Library } from './components/Library'
import { Manifesto } from './components/Manifesto'
import { PaperPlane } from './components/PaperPlane'
import { ProTips } from './components/ProTips'
import { ScrollProgress } from './components/ScrollProgress'
import { ToolsMarquee } from './components/ToolsMarquee'
import { WhatsAppFab } from './components/WhatsAppFab'
import { useEffect } from 'react'
import { useIsTouch, usePrefersReducedMotion } from './hooks/useIsTouch'
import { startSmoothScroll } from './lib/smoothScroll'

export default function App() {
  const touch = useIsTouch()
  const reduced = usePrefersReducedMotion()
  useEffect(() => (touch || reduced ? undefined : startSmoothScroll()), [touch, reduced])
  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-clip font-sans text-white">
      {!reduced && <CloudSky lite={touch} />}
      {!reduced && !touch && <AngelDust />}
      {!reduced && <PaperPlane touch={touch} />}
      {!reduced && !touch && <CursorRing />}
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <ToolsMarquee />
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
    </div>
  )
}
