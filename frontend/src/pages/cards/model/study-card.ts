import { z } from 'zod'

export const TOPICS = ['Англійська', 'Історія', 'Програмування', 'Інше'] as const

export type Topic = (typeof TOPICS)[number]

const studyCardSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  topic: z.enum(TOPICS),
  dueDate: z.string(),
  learned: z.boolean(),
})

export type StudyCard = z.infer<typeof studyCardSchema>

export type NewStudyCard = Pick<StudyCard, 'question' | 'answer' | 'topic' | 'dueDate'>

export const STORAGE_KEY = 'deckly-cards'

export const loadCards = (): StudyCard[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = z.array(studyCardSchema).safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}

export const saveCards = (cards: StudyCard[]): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  } catch {
    return
  }
}
