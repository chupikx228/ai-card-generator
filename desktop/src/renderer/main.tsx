import '@fontsource-variable/literata'
import '@fontsource-variable/manrope'
import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const darkScheme = window.matchMedia('(prefers-color-scheme: dark)')
const applyScheme = (): void => {
  document.documentElement.classList.toggle('dark', darkScheme.matches)
}
applyScheme()
darkScheme.addEventListener('change', applyScheme)

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
