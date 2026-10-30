import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'sonner'
import { ConfirmProvider } from './providers/ConfirmProvider.jsx'
import MotionProvider from './components/motion/MotionProvider.jsx'
import { registerPwa } from './utils/pwa'

// Service worker : application disponible hors ligne et installable
registerPwa()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionProvider>
      <AuthProvider>
        <ConfirmProvider>
          <Toaster
            richColors
            position='bottom-center'
            closeButton
            toastOptions={{ style: { fontFamily: 'var(--font-sans)', borderRadius: '1rem' } }}
          />
          <App />
        </ConfirmProvider>
      </AuthProvider>
    </MotionProvider>
  </StrictMode>,
)
