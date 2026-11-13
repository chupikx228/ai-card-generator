export type ReviewMode = 'flip' | 'qa' | 'truefalse'

export type DeckLanguage = 'uk' | 'en'

export type TextCard = {
  id: string
  front: string
  back: string
}

export type StatementCard = {
  id: string
  statement: string
  isTrue: boolean
}

export type Deck =
  | { id: string; mode: 'flip'; title: string; cards: TextCard[] }
  | { id: string; mode: 'qa'; title: string; cards: TextCard[] }
  | { id: string; mode: 'truefalse'; title: string; cards: StatementCard[] }

export type GenerateDeckParams = {
  topic: string
  mode: ReviewMode
  language: DeckLanguage
  count: number
}
