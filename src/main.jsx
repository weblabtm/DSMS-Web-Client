import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RuntimeConfigProvider } from './app/providers/runtime-config-provider.jsx'
import { registerSW } from 'virtual:pwa-register'

// Service Worker Registration for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RuntimeConfigProvider>
      <App />
    </RuntimeConfigProvider>
  </StrictMode>,
)
