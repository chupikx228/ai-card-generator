import { type Deck, deckSchema } from '@/entities/deck'
import { postJson } from '@/shared/api'
import { GENERATE_DECK_PATH, type GenerateDeckParams } from '@deckly/shared/decks'

export type { GenerateDeckParams } from '@deckly/shared/decks'

export const requestDeckGeneration = (params: GenerateDeckParams): Promise<Deck> =>
  postJson(GENERATE_DECK_PATH, params, deckSchema)
