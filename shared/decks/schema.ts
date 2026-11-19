import { z } from 'zod'
import type { Deck } from './model.ts'

const textCardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
})

const statementCardSchema = z.object({
  id: z.string(),
  statement: z.string(),
  isTrue: z.boolean(),
})

const deckFields = {
  id: z.string(),
  title: z.string(),
}

export const deckSchema: z.ZodType<Deck> = z.discriminatedUnion('mode', [
  z.object({ ...deckFields, mode: z.literal('flip'), cards: z.array(textCardSchema) }),
  z.object({ ...deckFields, mode: z.literal('qa'), cards: z.array(textCardSchema) }),
  z.object({ ...deckFields, mode: z.literal('truefalse'), cards: z.array(statementCardSchema) }),
])

export const apiErrorBodySchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
})
