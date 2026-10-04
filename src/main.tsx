import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './lib/install.ts'
import { SoundProvider } from './lib/sound.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SoundProvider>
      <App />
      {/* סטטיסטיקות כניסה של Vercel (בלי עוגיות). נאסף רק אחרי הפעלת Web Analytics בפרויקט */}
      <Analytics />
    </SoundProvider>
  </StrictMode>,
)

registerServiceWorker()
