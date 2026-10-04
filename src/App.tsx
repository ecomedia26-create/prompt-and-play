import { AgencyCTA } from './components/AgencyCTA'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProTips } from './components/ProTips'
import { Vault } from './components/Vault'
import { WhatsAppFab } from './components/WhatsAppFab'
import { WhatsAppSimulator } from './components/WhatsAppSimulator'

export default function App() {
  return (
    <div dir="rtl" className="relative min-h-screen overflow-x-clip bg-void font-sans text-white">
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
    </div>
  )
}
