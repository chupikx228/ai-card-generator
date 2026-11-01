import { cn } from '@/shared/lib/cn'
import type { StudyCard } from '../model/study-card'

type CardItemProps = {
  card: StudyCard
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

const formatDate = (value: string): string => (value ? new Date(value).toLocaleDateString('uk-UA') : 'без дати')

export const CardItem = ({ card, onToggle, onDelete }: CardItemProps) => (
  <li
    className={cn(
      'flex items-center justify-between gap-3 rounded-card border px-4 py-3 transition-colors',
      card.learned ? 'border-success/40 bg-success/15' : 'border-border bg-surface-raised',
    )}
  >
    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={card.learned}
        onChange={() => onToggle(card.id)}
        className="mt-1 size-4 shrink-0 accent-primary"
      />
      <span className="min-w-0">
        <span className={cn('block break-words text-[15px] font-semibold', card.learned ? 'text-muted line-through' : 'text-foreground')}>
          {card.question}
        </span>
        <span className={cn('block break-words text-[14px]', card.learned ? 'text-muted line-through' : 'text-foreground')}>
          {card.answer}
        </span>
        <span className="mt-1 block text-xs text-muted">
          {card.topic} · повторити: {formatDate(card.dueDate)}
        </span>
      </span>
    </label>
    <button
      type="button"
      onClick={() => onDelete(card.id)}
      className="shrink-0 cursor-pointer rounded-card bg-danger px-3.5 py-2 text-[14px] font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      Видалити
    </button>
  </li>
)
