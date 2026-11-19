import type { CardStorage, StudyCard } from '@deckly/shared/study-cards'
import { parseStudyCards } from '@deckly/shared/study-cards/schema'

export const STORAGE_KEY = 'deckly-cards'

export type KeyValueStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export const createLocalStorageAdapter = (storage: KeyValueStorage, key: string = STORAGE_KEY): CardStorage => ({
  load: (): StudyCard[] => {
    try {
      const raw = storage.getItem(key)
      return raw ? parseStudyCards(JSON.parse(raw)) : []
    } catch {
      return []
    }
  },
  save: (cards: StudyCard[]): void => {
    try {
      storage.setItem(key, JSON.stringify(cards))
    } catch {
      return
    }
  },
})
