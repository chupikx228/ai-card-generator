import { createLocalStorageAdapter } from './local-storage-adapter'

export type { NewStudyCard, StudyCard, Topic } from '@deckly/shared/study-cards'

export const cardStorage = createLocalStorageAdapter({
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
})
