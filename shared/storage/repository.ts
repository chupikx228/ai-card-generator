import { DEFAULT_DECK_TITLE, type StudyCard, type Topic } from '../study-cards/model'
import { isTopic, validateCard } from '../study-cards/logic'
import { createDeck, validateDeckTitle } from '../study-cards/library'
import type {
  AddCardsResult,
  CardDraft,
  CardsPage,
  CardsQuery,
  CreateDeckResult,
  DeckSummary,
  Done,
  Scope,
  SqlDatabase,
  SqlValue,
  Stats,
} from './types'

const CARD_TOPIC: Topic = 'Інше'
const MAX_PAGE = 500
const MIN_FTS_LENGTH = 3
const CARD_COLUMNS = 'c.id, c.deck_id, c.question, c.answer, c.topic, c.due_date, c.learned'
const DECK_NOT_FOUND = 'Колоду не знайдено.'
const CARD_NOT_FOUND = 'Картку не знайдено.'

type CardRow = {
  id: number
  deck_id: string
  question: string
  answer: string
  topic: string
  due_date: string
  learned: number
}

type DeckRow = {
  id: string
  title: string
  created_at: number
  total: number
  learned: number
}

type RepositoryOptions = {
  fullText: boolean
}

const toCard = (row: CardRow): StudyCard => ({
  id: row.id,
  deckId: row.deck_id,
  question: row.question,
  answer: row.answer,
  topic: isTopic(row.topic) ? row.topic : CARD_TOPIC,
  dueDate: row.due_date,
  learned: row.learned === 1,
})

const toDeck = (row: DeckRow): DeckSummary => ({
  id: row.id,
  title: row.title,
  createdAt: row.created_at,
  total: row.total,
  learned: row.learned,
})

const clampLimit = (limit: number): number => Math.max(1, Math.min(MAX_PAGE, Math.floor(limit)))

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`)

const toFtsPhrase = (value: string): string => `"${value.replaceAll('"', '""')}"`

const fail = (error: string) => ({ ok: false as const, error })

export const createRepository = (db: SqlDatabase, { fullText }: RepositoryOptions) => {
  const deckExists = (id: string): boolean => db.one<{ id: string }>('SELECT id FROM decks WHERE id = ?', [id]) !== undefined

  const filterFor = (scope: Scope, search: string): { where: string; params: SqlValue[] } => {
    const clauses: string[] = []
    const params: SqlValue[] = []
    if (scope.kind === 'deck') {
      clauses.push('c.deck_id = ?')
      params.push(scope.id)
    }
    const query = search.trim()
    if (fullText && query.length >= MIN_FTS_LENGTH) {
      clauses.push('c.id IN (SELECT rowid FROM cards_fts WHERE cards_fts MATCH ?)')
      params.push(toFtsPhrase(query))
    } else if (query.length > 0) {
      clauses.push("(c.question LIKE ? ESCAPE '\\' OR c.answer LIKE ? ESCAPE '\\')")
      const pattern = `%${escapeLike(query)}%`
      params.push(pattern, pattern)
    }
    return { where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '', params }
  }

  const stats = (scope: Scope): Stats => {
    const row =
      scope.kind === 'deck'
        ? db.one<Stats>('SELECT total, learned FROM decks WHERE id = ?', [scope.id])
        : db.one<Stats>('SELECT coalesce(sum(total), 0) AS total, coalesce(sum(learned), 0) AS learned FROM decks')
    return row ?? { total: 0, learned: 0 }
  }

  const insertDeck = (title: string): string => {
    const deck = createDeck(title)
    db.run('INSERT INTO decks (id, title, created_at) VALUES (?, ?, ?)', [deck.id, deck.title, deck.createdAt])
    return deck.id
  }

  return {
    listDecks: (): DeckSummary[] =>
      db.all<DeckRow>('SELECT id, title, created_at, total, learned FROM decks ORDER BY created_at, title').map(toDeck),

    createDeck: (title: string): CreateDeckResult => {
      const error = validateDeckTitle(title)
      if (error) {
        return fail(error)
      }
      const deck = createDeck(title)
      db.run('INSERT INTO decks (id, title, created_at) VALUES (?, ?, ?)', [deck.id, deck.title, deck.createdAt])
      return { ok: true, deck }
    },

    renameDeck: (id: string, title: string): Done => {
      const error = validateDeckTitle(title)
      if (error) {
        return fail(error)
      }
      return db.run('UPDATE decks SET title = ? WHERE id = ?', [title.trim(), id]) > 0 ? { ok: true } : fail(DECK_NOT_FOUND)
    },

    removeDeck: (id: string): Done =>
      db.transaction(() => db.run('DELETE FROM decks WHERE id = ?', [id])) > 0 ? { ok: true } : fail(DECK_NOT_FOUND),

    stats,

    queryCards: ({ scope, search, offset, limit }: CardsQuery): CardsPage => {
      const { where, params } = filterFor(scope, search)
      const total = search.trim()
        ? (db.one<{ total: number }>(`SELECT count(*) AS total FROM cards c ${where}`, params)?.total ?? 0)
        : stats(scope).total
      const items = db
        .all<CardRow>(`SELECT ${CARD_COLUMNS} FROM cards c ${where} ORDER BY c.id LIMIT ? OFFSET ?`, [
          ...params,
          clampLimit(limit),
          Math.max(0, Math.floor(offset)),
        ])
        .map(toCard)
      return { items, total }
    },

    studyCards: (scope: Scope, limit: number): StudyCard[] => {
      const { where, params } = filterFor(scope, '')
      return db
        .all<CardRow>(`SELECT ${CARD_COLUMNS} FROM cards c ${where} ORDER BY c.learned, c.id LIMIT ?`, [...params, clampLimit(limit)])
        .map(toCard)
    },

    addCards: (deckId: string | null, newDeckTitle: string, drafts: CardDraft[]): AddCardsResult => {
      const inputs = drafts.map((draft) => ({ ...draft, topic: CARD_TOPIC, dueDate: '' }))
      const valid = inputs.filter((input) => validateCard(input) === null)
      if (valid.length === 0) {
        return fail(validateCard(inputs[0] ?? { question: '', answer: '', topic: CARD_TOPIC, dueDate: '' }) ?? '')
      }
      return db.transaction(() => {
        const target = deckId && deckExists(deckId) ? deckId : insertDeck(newDeckTitle.trim() || DEFAULT_DECK_TITLE)
        for (const input of valid) {
          db.run('INSERT INTO cards (deck_id, question, answer, topic, due_date) VALUES (?, ?, ?, ?, ?)', [
            target,
            input.question.trim(),
            input.answer.trim(),
            input.topic,
            input.dueDate,
          ])
        }
        return { ok: true as const, deckId: target, added: valid.length }
      })
    },

    updateCard: (id: number, draft: CardDraft, deckId: string): Done => {
      const error = validateCard({ ...draft, topic: CARD_TOPIC, dueDate: '' })
      if (error) {
        return fail(error)
      }
      if (!deckExists(deckId)) {
        return fail(DECK_NOT_FOUND)
      }
      const changes = db.transaction(() =>
        db.run('UPDATE cards SET question = ?, answer = ?, deck_id = ? WHERE id = ?', [
          draft.question.trim(),
          draft.answer.trim(),
          deckId,
          id,
        ]),
      )
      return changes > 0 ? { ok: true } : fail(CARD_NOT_FOUND)
    },

    setLearned: (id: number, learned: boolean): Done => {
      const value = learned ? 1 : 0
      const changes = db.transaction(() => db.run('UPDATE cards SET learned = ? WHERE id = ? AND learned <> ?', [value, id, value]))
      return changes > 0 || db.one('SELECT id FROM cards WHERE id = ?', [id]) ? { ok: true } : fail(CARD_NOT_FOUND)
    },

    removeCard: (id: number): Done =>
      db.transaction(() => db.run('DELETE FROM cards WHERE id = ?', [id])) > 0 ? { ok: true } : fail(CARD_NOT_FOUND),
  }
}

export type Repository = ReturnType<typeof createRepository>
