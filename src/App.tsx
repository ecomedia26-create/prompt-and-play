import { AgencyCTA } from './components/AgencyCTA'
import { AngelDust } from './components/AngelDust'
import { AssistantChat } from './components/AssistantChat'
import { CloudSky } from './components/CloudSky'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProTips } from './components/ProTips'
import { Vault } from './components/Vault'
import { WhatsAppFab } from './components/WhatsAppFab'
import { WhatsAppSimulator } from './components/WhatsAppSimulator'
import { useIsTouch, usePrefersReducedMotion } from './hooks/useIsTouch'

export default function App() {
  const touch = useIsTouch()
  const reduced = usePrefersReducedMotion()
  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-clip font-sans text-white">
      {!reduced && <CloudSky lite={touch} />}
      {!reduced && !touch && <AngelDust />}
      <Header />
      <main>
        <Hero />
        <Vault />
        <WhatsAppSimulator />
        <ProTips />
        <AgencyCTA />
      </main>
      <Footer />
      <WhatsAppFab />
      <AssistantChat />
    </div>
  )
}
