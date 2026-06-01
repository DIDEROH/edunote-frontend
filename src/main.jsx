import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ThemeProvider from './providers/ThemeProvider.jsx'
import { Toaster } from 'sonner'
import { HelmetProvider } from 'react-helmet-async'
import './i18n'; // Importez la configuration i18n

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <Toaster
          richColors
          position='bottom-center'
          closeButton
        />
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
)
