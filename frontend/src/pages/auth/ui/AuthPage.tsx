import { type FormEvent, useState } from 'react'
import { useAuthStore } from '@/features/auth'
import { navigate } from '@/shared/lib/hash-route'
import { Backdrop } from '@/shared/ui/backdrop'
import { Button } from '@/shared/ui/button'
import { Chips } from '@/shared/ui/chips'
import { SiteHeader } from '@/widgets/site-header'
import { SiteFooter } from '@/widgets/site-footer'

type AuthMode = 'login' | 'register'

const MODE_LABELS: Record<AuthMode, string> = {
  login: 'Вхід',
  register: 'Реєстрація',
}

const PASSWORD_MIN_LENGTH = 6

const labelClass = 'text-xs font-semibold uppercase tracking-[0.04em] text-muted'

const inputClass =
  'w-full rounded-card border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50'

export const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const clearError = useAuthStore((state) => state.clearError)

  const submitting = status === 'submitting'
  const isRegister = mode === 'register'
  const ready =
    email.trim().length > 0 && password.length >= PASSWORD_MIN_LENGTH && (!isRegister || name.trim().length > 0)

  const onSelectMode = (label: string) => {
    const next = label === MODE_LABELS.register ? 'register' : 'login'
    setMode(next)
    clearError()
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ready) {
      return
    }
    const credentials = { email: email.trim(), password }
    const ok = isRegister ? await register({ ...credentials, name: name.trim() }) : await login(credentials)
    if (ok) {
      navigate('home')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-gutter py-section">
        <Backdrop className="w-full max-w-md rounded-sheet">
          <div className="rounded-sheet border border-border bg-surface-raised p-6 shadow-card sm:p-8">
            <h1 className="font-serif text-3xl font-semibold text-foreground">
              {isRegister ? 'Створи акаунт' : 'З поверненням'}
            </h1>
            <p className="mt-2 text-[15px] text-muted">
              {isRegister ? 'Зареєструйся, щоб зберігати власні колоди.' : 'Увійди, щоб продовжити повторення.'}
            </p>

            <Chips
              className="mt-6"
              items={[MODE_LABELS.login, MODE_LABELS.register]}
              value={MODE_LABELS[mode]}
              onSelect={onSelectMode}
              disabled={submitting}
            />

            <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
              {isRegister ? (
                <>
                  <label htmlFor="auth-name" className={labelClass}>
                    Ім'я
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={submitting}
                    className={inputClass}
                  />
                </>
              ) : null}

              <label htmlFor="auth-email" className={labelClass}>
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                className={inputClass}
              />

              <label htmlFor="auth-password" className={labelClass}>
                Пароль
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={`Щонайменше ${PASSWORD_MIN_LENGTH} символів`}
                disabled={submitting}
                className={inputClass}
              />

              {error ? (
                <p role="alert" className="text-[13px] font-semibold text-danger">
                  {error}
                </p>
              ) : null}

              <Button type="submit" size="lg" className="w-full" disabled={submitting || !ready}>
                {submitting ? 'Зачекай…' : isRegister ? 'Зареєструватися' : 'Увійти'}
              </Button>
            </form>
          </div>
        </Backdrop>
      </main>
      <SiteFooter />
    </div>
  )
}
