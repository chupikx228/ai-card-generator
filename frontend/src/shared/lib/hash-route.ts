import { useSyncExternalStore } from 'react'
import { matchRoute, type Route, ROUTES } from '@/shared/config'

const readRoute = (): Route => matchRoute(window.location.hash)

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export const useHashRoute = (): Route => useSyncExternalStore(subscribe, readRoute, () => 'home')

export const navigate = (route: Route): void => {
  window.location.hash = ROUTES[route]
  window.scrollTo({ top: 0 })
}
