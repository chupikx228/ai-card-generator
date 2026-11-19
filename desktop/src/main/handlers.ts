import type { Repository } from '@deckly/shared/storage'
import { type CardDraft, type CardsQuery, CHANNELS, type Scope } from '../ipc/contract.ts'

export const INVALID = { ok: false as const, error: 'Некоректні дані запиту.' }

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isString = (value: unknown): value is string => typeof value === 'string'

const isId = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value)

const isScope = (value: unknown): value is Scope =>
  isRecord(value) && (value.kind === 'all' || (value.kind === 'deck' && isString(value.id)))

const isDraft = (value: unknown): value is CardDraft =>
  isRecord(value) && isString(value.question) && isString(value.answer)

const isQuery = (value: unknown): value is CardsQuery =>
  isRecord(value) &&
  isScope(value.scope) &&
  isString(value.search) &&
  typeof value.offset === 'number' &&
  typeof value.limit === 'number'

export type Handler = (...args: unknown[]) => unknown

export const createHandlers = (repository: Repository): Record<string, Handler> => ({
  [CHANNELS.listDecks]: () => repository.listDecks(),
  [CHANNELS.createDeck]: (title) => (isString(title) ? repository.createDeck(title) : INVALID),
  [CHANNELS.renameDeck]: (id, title) => (isString(id) && isString(title) ? repository.renameDeck(id, title) : INVALID),
  [CHANNELS.removeDeck]: (id) => (isString(id) ? repository.removeDeck(id) : INVALID),
  [CHANNELS.stats]: (scope) => repository.stats(isScope(scope) ? scope : { kind: 'all' }),
  [CHANNELS.queryCards]: (query) => (isQuery(query) ? repository.queryCards(query) : { items: [], total: 0 }),
  [CHANNELS.studyCards]: (scope, limit) =>
    isScope(scope) && typeof limit === 'number' ? repository.studyCards(scope, limit) : [],
  [CHANNELS.addCards]: (deckId, title, drafts) =>
    (deckId === null || isString(deckId)) && isString(title) && Array.isArray(drafts) && drafts.every(isDraft)
      ? repository.addCards(deckId, title, drafts)
      : INVALID,
  [CHANNELS.updateCard]: (id, draft, deckId) =>
    isId(id) && isDraft(draft) && isString(deckId) ? repository.updateCard(id, draft, deckId) : INVALID,
  [CHANNELS.setLearned]: (id, learned) =>
    isId(id) && typeof learned === 'boolean' ? repository.setLearned(id, learned) : INVALID,
  [CHANNELS.removeCard]: (id) => (isId(id) ? repository.removeCard(id) : INVALID),
})
