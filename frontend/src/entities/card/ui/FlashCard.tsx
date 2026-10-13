import { Button } from '@/shared/ui/button'
import type { Card } from '../model/types'

type FlashCardProps = {
  card: Card
  revealed: boolean
  onReveal: () => void
}

export const FlashCard = ({ card, revealed, onReveal }: FlashCardProps) => (
  <article className="flex min-h-56 animate-card-in flex-col rounded-card border border-border bg-surface p-6 shadow-card">
    <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Питання</p>
    <h3 className="mt-2 font-serif text-2xl font-semibold text-foreground">{card.front}</h3>

    <div className="mt-auto pt-6">
      {revealed ? (
        <div className="animate-reveal border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Відповідь</p>
          <p className="mt-2 text-[15px] leading-6 text-foreground">{card.back}</p>
        </div>
      ) : (
        <Button variant="secondary" className="w-full" onClick={onReveal}>
          Показати відповідь
        </Button>
      )}
    </div>
  </article>
)
