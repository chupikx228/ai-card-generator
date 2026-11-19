import type { StudyCard } from './model.ts'

export type CardStorage = {
  load: () => StudyCard[]
  save: (cards: StudyCard[]) => void
}

export const createMemoryStorage = (initial: StudyCard[] = []): CardStorage => {
  let saved = structuredClone(initial)
  return {
    load: () => structuredClone(saved),
    save: (cards) => {
      saved = structuredClone(cards)
    },
  }
}
