import { useThemeStore } from '@/app/providers/theme'
import { Button } from '@/shared/ui/button'
import { MoonIcon, SparklesIcon, SunIcon } from '@/shared/ui/icon'

export const SiteHeader = () => {
  const theme = useThemeStore((state) => state.theme)
  const toggle = useThemeStore((state) => state.toggle)

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
          <a href="#demo" className="hidden sm:block">
            <Button size="md">Спробувати</Button>
          </a>
        </div>
      </div>
    </header>
  )
}
