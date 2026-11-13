import type { Deck, GenerateDeckParams } from '@shared/decks'
import type { DeckRecord, NewStudyCard, StudyCard } from '@shared/study-cards'

export const CHANNELS = {
  listDecks: 'decks:list',
  createDeck: 'decks:create',
  renameDeck: 'decks:rename',
  removeDeck: 'decks:remove',
  stats: 'cards:stats',
  queryCards: 'cards:query',
  studyCards: 'cards:study',
  addCards: 'cards:add',
  updateCard: 'cards:update',
  setLearned: 'cards:learned',
  removeCard: 'cards:remove',
  generate: 'decks:generate',
} as const

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

export type GenerateDeckResult = { ok: true; deck: Deck } | { ok: false; code: string }

export type CardsAPI = {
  listDecks: () => Promise<DeckSummary[]>
  createDeck: (title: string) => Promise<CreateDeckResult>
  renameDeck: (id: string, title: string) => Promise<Done>
  removeDeck: (id: string) => Promise<Done>
  stats: (scope: Scope) => Promise<Stats>
  queryCards: (query: CardsQuery) => Promise<CardsPage>
  studyCards: (scope: Scope, limit: number) => Promise<StudyCard[]>
  addCards: (deckId: string | null, newDeckTitle: string, drafts: CardDraft[]) => Promise<AddCardsResult>
  updateCard: (id: number, draft: CardDraft, deckId: string) => Promise<Done>
  setLearned: (id: number, learned: boolean) => Promise<Done>
  removeCard: (id: number) => Promise<Done>
  generateDeck: (params: GenerateDeckParams) => Promise<GenerateDeckResult>
}
