import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth'
import { AuthPage } from '@/pages/auth'
import { LandingPage } from '@/pages/landing'
import { useHashRoute } from '@/shared/lib/hash-route'

export const App = () => {
  const route = useHashRoute()
  const verify = useAuthStore((state) => state.verify)

  useEffect(() => {
    void verify()
  }, [verify])

  return route === 'login' ? <AuthPage /> : <LandingPage />
}
