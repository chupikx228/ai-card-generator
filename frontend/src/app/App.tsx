import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth'
import { AuthPage } from '@/pages/auth'
import { CardsPage } from '@/pages/cards'
import { LandingPage } from '@/pages/landing'
import type { Route } from '@/shared/config'
import { useHashRoute } from '@/shared/lib/hash-route'

const PAGES: Record<Route, () => React.JSX.Element> = {
  home: LandingPage,
  login: AuthPage,
  cards: CardsPage,
}

export const App = () => {
  const route = useHashRoute()
  const verify = useAuthStore((state) => state.verify)

  useEffect(() => {
    void verify()
  }, [verify])

  const Page = PAGES[route]
  return <Page />
}
