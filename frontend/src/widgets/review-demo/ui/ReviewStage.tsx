import { FlashCard, FlipCard, StatementCard } from '@/entities/card'
import { RatingBar } from '@/features/rate-card'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'
import { useSessionStore } from '../model/session.store'

const answerButtonClass =
  'flex h-14 items-center justify-center rounded-card font-semibold tracking-[0.01em] transition-opacity active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const ReviewStage = () => {
  const deck = useSessionStore((state) => state.deck)
  const index = useSessionStore((state) => state.index)
  const revealed = useSessionStore((state) => state.revealed)
  const lastCorrect = useSessionStore((state) => state.lastCorrect)
  const reveal = useSessionStore((state) => state.reveal)
  const flip = useSessionStore((state) => state.flip)
  const rate = useSessionStore((state) => state.rate)
  const answer = useSessionStore((state) => state.answer)
  const next = useSessionStore((state) => state.next)

  if (!deck) {
    return null
  }

  const total = deck.cards.length
  const progress = Math.round((index / total) * 100)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-[13px] font-semibold text-muted">
        <span>«{deck.title}»</span>
        <span>
          Картка {index + 1} / {total}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-primary-soft">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
      </div>

      {deck.mode === 'qa' ? (
        <>
          <FlashCard key={deck.cards[index].id} card={deck.cards[index]} revealed={revealed} onReveal={reveal} />
          {revealed ? (
            <div className="animate-reveal">
              <RatingBar onRate={rate} />
            </div>
          ) : (
            <p className="text-center text-[13px] text-muted">Оціни, наскільки легко згадалась відповідь.</p>
          )}
        </>
      ) : null}

      {deck.mode === 'flip' ? (
        <>
          <FlipCard key={deck.cards[index].id} card={deck.cards[index]} flipped={revealed} onFlip={flip} />
          <Button variant="secondary" className="w-full" onClick={next}>
            Далі
          </Button>
        </>
      ) : null}

      {deck.mode === 'truefalse' ? (
        <>
          <StatementCard
            key={deck.cards[index].id}
            statement={deck.cards[index].statement}
            verdict={
              revealed
                ? { correct: lastCorrect === true, answer: deck.cards[index].isTrue ? 'Правда' : 'Брехня' }
                : null
            }
          />
          {revealed ? (
            <Button variant="secondary" className="w-full animate-reveal" onClick={next}>
              Далі
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => answer(true)}
                className={cn(answerButtonClass, 'bg-success text-foreground dark:text-primary-foreground')}
              >
                Правда
              </button>
              <button
                type="button"
                onClick={() => answer(false)}
                className={cn(answerButtonClass, 'bg-danger text-primary-foreground')}
              >
                Брехня
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
