import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Global tokens and base first, so each story's own stylesheet (imported by its component) wins ties.
import './styles.css'
import App from './App'
import { LanguageProvider } from './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)

// The scroll-craft verification harness waits for this before it starts scrolling.
requestAnimationFrame(() => document.documentElement.classList.add('sc-ready'))
