import type { StudyCard } from '../model/study-card'
import { CardItem } from './CardItem'

type CardListProps = {
  cards: StudyCard[]
  emptyText: string
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

export const CardList = ({ cards, emptyText, onToggle, onDelete }: CardListProps) => {
  if (cards.length === 0) {
    return <p className="py-6 text-center text-[15px] text-muted">{emptyText}</p>
  }

  return (
    <ul className="space-y-3">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}
