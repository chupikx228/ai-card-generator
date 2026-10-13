import type { Rating } from '@/entities/card'

const intervalLabels: Record<Rating, string> = {
  again: '<1 хв',
  hard: '8 хв',
  good: '1 день',
  easy: '4 дні',
}

export const nextIntervalLabel = (rating: Rating): string => intervalLabels[rating]
