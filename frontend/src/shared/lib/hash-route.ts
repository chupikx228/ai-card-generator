import { useSyncExternalStore } from 'react'

export const ROUTES = {
  home: '#/',
  login: '#/login',
} as const

export type Route = keyof typeof ROUTES

const readRoute = (): Route => (window.location.hash.startsWith(ROUTES.login) ? 'login' : 'home')

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export const useHashRoute = (): Route => useSyncExternalStore(subscribe, readRoute, () => 'home')

export const navigate = (route: Route): void => {
  window.location.hash = ROUTES[route]
  window.scrollTo({ top: 0 })
}
