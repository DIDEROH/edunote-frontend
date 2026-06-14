import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'sonner'
import { ConfirmProvider } from './providers/ConfirmProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ConfirmProvider>
        <Toaster
          richColors
          position='bottom-center'
          closeButton
        />
        <App />
      </ConfirmProvider>
    </AuthProvider>
  </StrictMode>,
)
