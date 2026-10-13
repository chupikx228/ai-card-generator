import { z } from 'zod';

const llmTextCardSchema = z.object({
  front: z.string(),
  back: z.string(),
});

const llmStatementCardSchema = z.object({
  statement: z.string(),
  isTrue: z.boolean(),
});

export const llmTextDeckSchema = z.object({
  allowed: z.boolean(),
  title: z.string(),
  cards: z.array(llmTextCardSchema),
});

export const llmStatementDeckSchema = z.object({
  allowed: z.boolean(),
  title: z.string(),
  cards: z.array(llmStatementCardSchema),
});

export type LlmTextDeck = z.infer<typeof llmTextDeckSchema>;

export type LlmStatementDeck = z.infer<typeof llmStatementDeckSchema>;
