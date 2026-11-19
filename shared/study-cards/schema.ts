import { z } from 'zod'
import { normalizeLibrary } from './library.ts'
import { type CardLibrary, type StudyCard, TOPICS } from './model.ts'

export const studyCardSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  topic: z.enum(TOPICS),
  dueDate: z.string(),
  learned: z.boolean(),
  deckId: z.string().optional(),
})

export const deckRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.number(),
})

export const parseStudyCards = (value: unknown): StudyCard[] => {
  const parsed = z.array(studyCardSchema).safeParse(value)
  return parsed.success ? parsed.data : []
}

const librarySchema = z.object({
  decks: z.array(deckRecordSchema),
  cards: z.array(studyCardSchema),
})

export const parseLibrary = (value: unknown): CardLibrary => {
  if (Array.isArray(value)) {
    return normalizeLibrary({ decks: [], cards: parseStudyCards(value) })
  }
  const parsed = librarySchema.safeParse(value)
  return parsed.success ? normalizeLibrary(parsed.data) : { decks: [], cards: [] }
}
