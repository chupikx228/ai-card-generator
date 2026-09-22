import { Button } from '@/shared/ui/button'
import { CheckIcon } from '@/shared/ui/icon'
import { useSessionStore } from '../model/session.store'
import { RatingSummary } from './RatingSummary'

export const ResultStage = () => {
  const deck = useSessionStore((state) => state.deck)
  const ratings = useSessionStore((state) => state.ratings)
  const correct = useSessionStore((state) => state.correct)
  const reset = useSessionStore((state) => state.reset)

  if (!deck) {
    return null
  }

  return (
    <div className="flex flex-col gap-5 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckIcon className="size-7" />
      </div>
      <div>
        <h3 className="font-serif text-2xl font-semibold text-foreground">Колоду пройдено</h3>
        {deck.mode === 'qa' ? (
          <p className="mt-1 text-[15px] text-muted">
            {deck.cards.length} карток у колоді «{deck.title}». FSRS призначив би кожній свій наступний показ.
          </p>
        ) : null}
        {deck.mode === 'flip' ? (
          <p className="mt-1 text-[15px] text-muted">Переглянуто {deck.cards.length} карток у колоді «{deck.title}».</p>
        ) : null}
        {deck.mode === 'truefalse' ? (
          <p className="mt-1 text-[15px] text-muted">
            Правильних відповідей: {correct} з {deck.cards.length}.
          </p>
        ) : null}
      </div>

      {deck.mode === 'qa' ? <RatingSummary ratings={ratings} /> : null}

      <Button variant="secondary" className="mx-auto" onClick={reset}>
        Спробувати ще раз
      </Button>
    </div>
  )
}
