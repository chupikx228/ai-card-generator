import type { Rating } from '@/entities/card'

const ratingLabels: Record<Rating, string> = {
  again: 'Знову',
  hard: 'Важко',
  good: 'Добре',
  easy: 'Легко',
}

type RatingSummaryProps = {
  ratings: Rating[]
}

export const RatingSummary = ({ ratings }: RatingSummaryProps) => {
  const counts = ratings.reduce<Record<Rating, number>>(
    (acc, rating) => {
      acc[rating] += 1
      return acc
    },
    { again: 0, hard: 0, good: 0, easy: 0 },
  )

  const order: Rating[] = ['again', 'hard', 'good', 'easy']

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {order.map((rating) => (
        <li key={rating} className="rounded-card border border-border bg-surface px-3 py-3">
          <p className="text-2xl font-semibold text-foreground">{counts[rating]}</p>
          <p className="text-[13px] text-muted">{ratingLabels[rating]}</p>
        </li>
      ))}
    </ul>
  )
}
