import { cn } from '@/shared/lib/cn'
import type { Card } from '../model/types'

type FlipCardProps = {
  card: Card
  flipped: boolean
  onFlip: () => void
}

const faceClass =
  'absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-card border border-border bg-surface p-6 text-center shadow-card [backface-visibility:hidden]'

export const FlipCard = ({ card, flipped, onFlip }: FlipCardProps) => (
  <button
    type="button"
    onClick={onFlip}
    aria-pressed={flipped}
    className="block w-full animate-card-in select-none [perspective:1200px] focus-visible:outline-none"
  >
    <div
      className={cn(
        'relative min-h-56 w-full rounded-card transition-transform duration-700 ease-out [transform-style:preserve-3d]',
        flipped && '[transform:rotateY(180deg)]',
      )}
    >
      <div className={faceClass}>
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Лице</p>
        <h3 className="font-serif text-3xl font-semibold text-foreground">{card.front}</h3>
        <p className="text-[13px] text-muted">Натисни, щоб перевернути</p>
      </div>

      <div className={cn(faceClass, '[transform:rotateY(180deg)]')}>
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Зворот</p>
        <h3 className="font-serif text-3xl font-semibold text-foreground">{card.back}</h3>
        <p className="text-[13px] text-muted">Натисни, щоб перевернути</p>
      </div>
    </div>
  </button>
)
