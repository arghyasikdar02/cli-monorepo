import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App.jsx'
import AppErrorBoundary from './components/ui/AppErrorBoundary.jsx'

const rootElement = document.getElementById('root')
if (rootElement.hasAttribute('data-prerendered')) rootElement.replaceChildren()

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary><App /></AppErrorBoundary>
  </StrictMode>,
)
