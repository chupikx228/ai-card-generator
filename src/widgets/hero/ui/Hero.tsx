import { Backdrop } from '@/shared/ui/backdrop'
import { Button } from '@/shared/ui/button'
import { ArrowRightIcon, SparklesIcon } from '@/shared/ui/icon'

export const Hero = () => (
  <Backdrop>
    <div className="mx-auto max-w-3xl px-gutter pt-16 pb-section text-center sm:pt-24">
      <p className="inline-flex items-center gap-2 rounded-card bg-primary-soft px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-primary">
        <SparklesIcon className="size-4" />
        ШІ-генерація колод
      </p>

      <h1 className="mt-6 font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.01em] text-foreground sm:text-6xl">
        Перетвори будь-яку тему на колоду карток
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-lg leading-7 text-muted">
        Введи тему — Deckly збере картки за тебе, а FSRS покаже кожну саме тоді, коли ти майже
        готовий її забути.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="#demo">
          <Button size="lg">
            Згенерувати колоду
            <ArrowRightIcon className="size-5" />
          </Button>
        </a>
        <a href="#features">
          <Button size="lg" variant="secondary">
            Як це працює
          </Button>
        </a>
      </div>
    </div>
  </Backdrop>
)
