import type { Deck, ReviewMode } from '@/entities/deck'
import { buildDeck } from './mock-decks'

const GENERATION_DELAY_MS = 650

export const generateDeck = (mode: ReviewMode): Promise<Deck> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(buildDeck(mode)), GENERATION_DELAY_MS)
  })
