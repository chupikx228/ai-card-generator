import { useEffect, useRef, useState } from 'react'
import type { StudyCard } from '@deckly/shared/study-cards'
import { pluralCards } from '../lib/text'
import { AnswerFace, QuestionFace } from './CardFaces'
import { FlashCard } from './FlashCard'

type StudySessionProps = {
  cards: StudyCard[]
  title: string
  labelFor: (card: StudyCard) => string | undefined
  onAnswer: (id: number, learned: boolean) => void
  onClose: () => void
}

const SCROLL_STEP = 0.6

const Key = ({ children }: { children: string }) => (
  <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 font-sans text-[12px] font-semibold text-foreground">
    {children}
  </kbd>
)

export const StudySession = ({ cards, title, labelFor, onAnswer, onClose }: StudySessionProps) => {
  const [queue] = useState(cards)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const questionScroll = useRef<HTMLSpanElement>(null)
  const answerScroll = useRef<HTMLSpanElement>(null)

  const finished = index >= queue.length
  const card = queue[index]

  const answer = (learned: boolean) => {
    if (!card) {
      return
    }
    onAnswer(card.id, learned)
    setKnown((value) => value + (learned ? 1 : 0))
    setFlipped(false)
    setIndex((value) => value + 1)
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (finished) {
        return
      } else if (event.key === ' ') {
        event.preventDefault()
        setFlipped((value) => !value)
      } else if (event.key === 'ArrowRight') {
        answer(true)
      } else if (event.key === 'ArrowLeft') {
        answer(false)
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        const element = (flipped ? answerScroll : questionScroll).current
        const step = element ? element.clientHeight * SCROLL_STEP : 0
        element?.scrollBy({ top: event.key === 'ArrowDown' ? step : -step, behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="drag-region flex items-center gap-6 px-8 pt-12 pb-4">
        <div className="flex-1">
          <h1 className="font-serif text-[26px] font-semibold">Повторення</h1>
          <p className="text-[13px] font-semibold text-muted">{title}</p>
        </div>
        <p className="text-[14px] font-semibold tabular-nums text-muted">
          {Math.min(index + 1, queue.length)} з {queue.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="no-drag h-10 cursor-pointer rounded-xl border border-border bg-surface px-4 text-[14px] font-semibold hover:border-foreground/30"
        >
          Завершити
        </button>
      </header>
      <div className="mx-8 h-1 overflow-hidden rounded-full bg-border" aria-hidden>
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${(index / queue.length) * 100}%` }}
        />
      </div>

      {finished ? (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <h2 className="font-serif text-[40px] font-semibold">Повторення завершено</h2>
          <p className="text-[16px] text-muted">
            Ви повторили {pluralCards(queue.length)}. Знаєте {known} з {queue.length}.
          </p>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="mt-4 h-12 cursor-pointer rounded-2xl bg-primary px-7 text-[15px] font-bold text-primary-foreground hover:brightness-110"
          >
            Повернутися до карток
          </button>
        </section>
      ) : (
        <section className="flex flex-1 flex-col items-center justify-center gap-8 px-8 pb-8">
          <FlashCard
            key={card.id}
            className="aspect-[3/2] w-full max-w-[620px]"
            flipped={flipped}
            onFlip={() => setFlipped((value) => !value)}
            label={flipped ? `Відповідь: ${card.answer}` : `Питання: ${card.question}`}
            front={
              <QuestionFace
                label={labelFor(card)}
                question={card.question}
                size="lg"
                overflow="scroll"
                scrollRef={questionScroll}
                hint="Пробіл або клік, щоб перевернути"
              />
            }
            back={<AnswerFace answer={card.answer} size="lg" overflow="scroll" scrollRef={answerScroll} />}
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => answer(false)}
              className="h-12 w-40 cursor-pointer rounded-2xl border border-border bg-surface text-[15px] font-bold hover:border-foreground/30"
            >
              Ще раз
            </button>
            <button
              type="button"
              onClick={() => answer(true)}
              className="h-12 w-40 cursor-pointer rounded-2xl bg-success text-[15px] font-bold text-white hover:brightness-110"
            >
              Знаю
            </button>
          </div>
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <Key>←</Key> ще раз <span className="mx-2" /> <Key>→</Key> знаю <span className="mx-2" /> <Key>↑↓</Key> прокрутити{' '}
            <span className="mx-2" /> <Key>Esc</Key>{' '}
            вийти
          </p>
        </section>
      )}
    </div>
  )
}
