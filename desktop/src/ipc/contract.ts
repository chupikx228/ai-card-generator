import type { GenerateDeckParams } from '@deckly/shared/decks'
import type { GenerateDeckResult } from '@deckly/shared/decks/request'
import type { StudyCard } from '@deckly/shared/study-cards'
import type {
  AddCardsResult,
  CardDraft,
  CardsPage,
  CardsQuery,
  CreateDeckResult,
  DeckSummary,
  Done,
  Scope,
  Stats,
} from '@deckly/shared/storage'

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
  cancelGenerate: 'decks:generate:cancel',
} as const

export type {
  AddCardsResult,
  CardDraft,
  CardsPage,
  CardsQuery,
  CreateDeckResult,
  DeckSummary,
  Done,
  Failure,
  Scope,
  Stats,
} from '@deckly/shared/storage'
export type { GenerateDeckResult } from '@deckly/shared/decks/request'

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
  generateDeck: (params: GenerateDeckParams, requestId: string) => Promise<GenerateDeckResult>
  cancelGenerate: (requestId: string) => Promise<void>
}
