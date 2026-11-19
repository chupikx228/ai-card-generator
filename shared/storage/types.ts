import type { DeckRecord, NewStudyCard, StudyCard } from '../study-cards/model.ts'

export type Scope = { kind: 'all' } | { kind: 'deck'; id: string }

export type DeckSummary = DeckRecord & {
  total: number
  learned: number
}

export type Stats = {
  total: number
  learned: number
}

export type CardDraft = Pick<NewStudyCard, 'question' | 'answer'>

export type CardsQuery = {
  scope: Scope
  search: string
  offset: number
  limit: number
}

export type CardsPage = {
  items: StudyCard[]
  total: number
}

export type Failure = { ok: false; error: string }

export type Done = { ok: true } | Failure

export type AddCardsResult = { ok: true; deckId: string; added: number } | Failure

export type CreateDeckResult = { ok: true; deck: DeckRecord } | Failure

export type SqlValue = string | number | null

export type SqlDatabase = {
  all: <T>(sql: string, params?: SqlValue[]) => T[]
  one: <T>(sql: string, params?: SqlValue[]) => T | undefined
  run: (sql: string, params?: SqlValue[]) => number
  transaction: <T>(work: () => T) => T
}
