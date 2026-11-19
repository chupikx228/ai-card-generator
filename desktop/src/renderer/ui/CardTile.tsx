import { memo, useState } from 'react'
import type { StudyCard } from '@deckly/shared/study-cards'
import { AnswerFace, QuestionFace } from './CardFaces'
import { FlashCard } from './FlashCard'

type CardTileProps = {
  card: StudyCard
  label?: string
  onToggle: (card: StudyCard) => void
  onRemove: (card: StudyCard) => void
  onEdit: (card: StudyCard) => void
}

const actionClass = 'cursor-pointer rounded-md px-1.5 py-0.5 font-medium text-muted'

export const CardTile = memo(({ card, label, onToggle, onRemove, onEdit }: CardTileProps) => {
  const [flipped, setFlipped] = useState(false)

  return (
    <li className="flex min-w-0 flex-col gap-2.5">
      <FlashCard
        className="aspect-[3/2]"
        flipped={flipped}
        onFlip={() => setFlipped((value) => !value)}
        label={flipped ? `Відповідь: ${card.answer}` : `Питання: ${card.question}. Натисніть, щоб побачити відповідь`}
        front={<QuestionFace label={label} question={card.question} learned={card.learned} />}
        back={<AnswerFace answer={card.answer} />}
      />
      <div className="flex h-6 items-center gap-1 px-1.5 text-[13px]">
        <label className="mr-auto flex cursor-pointer items-center gap-2 font-medium text-muted hover:text-foreground">
          <input
            type="checkbox"
            checked={card.learned}
            onChange={() => onToggle(card)}
            className="size-4 cursor-pointer accent-[var(--success)]"
          />
          Вивчено
        </label>
        <button type="button" onClick={() => onEdit(card)} className={`${actionClass} hover:bg-primary-soft hover:text-primary`}>
          Редагувати
        </button>
        <button type="button" onClick={() => onRemove(card)} className={`${actionClass} hover:bg-danger/10 hover:text-danger`}>
          Видалити
        </button>
      </div>
    </li>
  )
})

export const CardPlaceholder = () => (
  <div className="flex flex-col gap-2.5" aria-hidden>
    <div className="aspect-[3/2] animate-pulse rounded-[22px] bg-background motion-reduce:animate-none" />
    <div className="h-6" />
  </div>
)
