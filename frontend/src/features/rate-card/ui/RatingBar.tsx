import type { Rating } from '@/entities/card'
import { cn } from '@/shared/lib/cn'
import { nextIntervalLabel } from '../model/schedule'

type RatingBarProps = {
  onRate: (rating: Rating) => void
  disabled?: boolean
}

type RatingOption = {
  rating: Rating
  label: string
  fillClass: string
}

const options: RatingOption[] = [
  { rating: 'again', label: 'Знову', fillClass: 'bg-rating-again text-foreground dark:text-primary-foreground' },
  { rating: 'hard', label: 'Важко', fillClass: 'bg-rating-hard text-foreground dark:text-primary-foreground' },
  { rating: 'good', label: 'Добре', fillClass: 'bg-rating-good text-foreground dark:text-primary-foreground' },
  { rating: 'easy', label: 'Легко', fillClass: 'bg-rating-easy text-primary-foreground' },
]

export const RatingBar = ({ onRate, disabled = false }: RatingBarProps) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
    {options.map((option) => (
      <button
        key={option.rating}
        type="button"
        disabled={disabled}
        onClick={() => onRate(option.rating)}
        className={cn(
          'flex h-14 flex-col items-center justify-center rounded-card font-semibold tracking-[0.01em] transition-opacity active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50',
          option.fillClass,
        )}
      >
        <span className="text-[15px] leading-5">{option.label}</span>
        <span className="text-xs opacity-80">{nextIntervalLabel(option.rating)}</span>
      </button>
    ))}
  </div>
)
