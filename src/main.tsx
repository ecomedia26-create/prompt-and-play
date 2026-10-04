import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '@fontsource/heebo/300.css'
import '@fontsource/heebo/400.css'
import '@fontsource/heebo/500.css'
import '@fontsource/heebo/700.css'
import '@fontsource/rubik/500.css'
import '@fontsource/rubik/700.css'
import '@fontsource/rubik/800.css'
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
