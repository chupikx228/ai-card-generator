import { useThemeStore } from '@/app/providers/theme'
import { useAuthStore } from '@/features/auth'
import { ROUTES } from '@/shared/lib/hash-route'
import { Button } from '@/shared/ui/button'
import { MoonIcon, SparklesIcon, SunIcon } from '@/shared/ui/icon'

export const SiteHeader = () => {
  const theme = useThemeStore((state) => state.theme)
  const toggle = useThemeStore((state) => state.toggle)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-[24px] backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-gutter">
        <a href="#top" className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-card bg-primary text-primary-foreground">
            <SparklesIcon className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-[-0.01em] text-foreground">Deckly</span>
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
            className="inline-flex size-10 items-center justify-center rounded-card text-foreground transition hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {theme === 'dark' ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
          </button>
          {user ? (
            <>
              <span className="hidden max-w-40 truncate text-[15px] font-semibold text-foreground sm:block">
                {user.name}
              </span>
              <Button variant="ghost" size="md" onClick={logout}>
                Вийти
              </Button>
            </>
          ) : (
            <a href={ROUTES.login}>
              <Button variant="ghost" size="md" tabIndex={-1}>
                Увійти
              </Button>
            </a>
          )}
          <a href="#demo" className="hidden sm:block">
            <Button size="md">Спробувати</Button>
          </a>
        </div>
      </div>
    </header>
  )
}
