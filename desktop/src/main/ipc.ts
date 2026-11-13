import { ipcMain } from 'electron'
import { CHANNELS, type CardDraft, type CardsQuery, type Scope } from '../ipc/contract'
import { generateDeck } from './generate-deck'
import type { Repository } from './repository'

const INVALID = { ok: false as const, error: 'Некоректні дані запиту.' }

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

export const registerIpc = (repository: Repository): void => {
  ipcMain.handle(CHANNELS.listDecks, () => repository.listDecks())
  ipcMain.handle(CHANNELS.createDeck, (_event, title: unknown) =>
    isString(title) ? repository.createDeck(title) : INVALID,
  )
  ipcMain.handle(CHANNELS.renameDeck, (_event, id: unknown, title: unknown) =>
    isString(id) && isString(title) ? repository.renameDeck(id, title) : INVALID,
  )
  ipcMain.handle(CHANNELS.removeDeck, (_event, id: unknown) => (isString(id) ? repository.removeDeck(id) : INVALID))
  ipcMain.handle(CHANNELS.stats, (_event, scope: unknown) =>
    repository.stats(isScope(scope) ? scope : { kind: 'all' }),
  )
  ipcMain.handle(CHANNELS.queryCards, (_event, query: unknown) =>
    isQuery(query) ? repository.queryCards(query) : { items: [], total: 0 },
  )
  ipcMain.handle(CHANNELS.studyCards, (_event, scope: unknown, limit: unknown) =>
    isScope(scope) && typeof limit === 'number' ? repository.studyCards(scope, limit) : [],
  )
  ipcMain.handle(CHANNELS.addCards, (_event, deckId: unknown, title: unknown, drafts: unknown) =>
    (deckId === null || isString(deckId)) && isString(title) && Array.isArray(drafts) && drafts.every(isDraft)
      ? repository.addCards(deckId, title, drafts)
      : INVALID,
  )
  ipcMain.handle(CHANNELS.updateCard, (_event, id: unknown, draft: unknown, deckId: unknown) =>
    isId(id) && isDraft(draft) && isString(deckId) ? repository.updateCard(id, draft, deckId) : INVALID,
  )
  ipcMain.handle(CHANNELS.setLearned, (_event, id: unknown, learned: unknown) =>
    isId(id) && typeof learned === 'boolean' ? repository.setLearned(id, learned) : INVALID,
  )
  ipcMain.handle(CHANNELS.removeCard, (_event, id: unknown) => (isId(id) ? repository.removeCard(id) : INVALID))
  ipcMain.handle(CHANNELS.generate, (_event, params: unknown) => generateDeck(params))
}
