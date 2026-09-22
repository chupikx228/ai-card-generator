import type { Card, TrueFalseCard } from '@/entities/card'

export type ReviewMode = 'flip' | 'qa' | 'truefalse'

export type Deck =
  | { id: string; mode: 'flip'; title: string; cards: Card[] }
  | { id: string; mode: 'qa'; title: string; cards: Card[] }
  | { id: string; mode: 'truefalse'; title: string; cards: TrueFalseCard[] }
