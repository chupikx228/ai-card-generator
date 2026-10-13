import { type Deck, type DeckLanguage, deckSchema, type ReviewMode } from '@/entities/deck'
import { postJson } from '@/shared/api'

const GENERATE_DECK_PATH = '/decks/generate'

export type GenerateDeckParams = {
  topic: string
  mode: ReviewMode
  language: DeckLanguage
  count: number
}

export const requestDeckGeneration = (params: GenerateDeckParams): Promise<Deck> =>
  postJson(GENERATE_DECK_PATH, params, deckSchema)
