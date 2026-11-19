import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { CARD_MESSAGES } from '@deckly/shared/study-cards'
import { buildSchema, createRepository, type Repository, type SqlDatabase, type SqlValue } from '@deckly/shared/storage'

const memoryDatabase = (fullText: boolean): SqlDatabase => {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(buildSchema(fullText))
  return {
    all: <T>(sql: string, params: SqlValue[] = []) => db.prepare(sql).all(...params) as T[],
    one: <T>(sql: string, params: SqlValue[] = []) => db.prepare(sql).get(...params) as T | undefined,
    run: (sql: string, params: SqlValue[] = []) => Number(db.prepare(sql).run(...params).changes),
    transaction: <T>(work: () => T) => {
      db.exec('BEGIN')
      try {
        const result = work()
        db.exec('COMMIT')
        return result
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
  }
}

const setup = (fullText = false): Repository => createRepository(memoryDatabase(fullText), { fullText })

test('addCards створює колоду і зберігає лише коректні картки', () => {
  const repository = setup()
  const result = repository.addCards(null, 'Історія', [
    { question: 'Рік хрещення Русі', answer: '988' },
    { question: '', answer: 'без питання' },
  ])
  assert.equal(result.ok, true)
  assert.equal(result.ok && result.added, 1)
  assert.deepEqual({ ...repository.stats({ kind: 'all' }) }, { total: 1, learned: 0 })
})

test('addCards повертає помилку ядра, якщо жодна картка не пройшла перевірку', () => {
  const result = setup().addCards(null, 'Колода', [{ question: '  ', answer: 'x' }])
  assert.deepEqual(result, { ok: false, error: CARD_MESSAGES.emptyQuestion })
})

test('queryCards шукає без урахування регістру як через LIKE, так і через FTS', () => {
  for (const fullText of [false, true]) {
    const repository = setup(fullText)
    repository.addCards(null, 'Мови', [
      { question: 'Translate apple', answer: 'яблуко' },
      { question: 'Translate pear', answer: 'груша' },
    ])
    const page = repository.queryCards({ scope: { kind: 'all' }, search: 'APPLE', offset: 0, limit: 10 })
    assert.equal(page.total, 1)
    assert.equal(page.items[0]?.answer, 'яблуко')
  }
})

test('setLearned і removeCard оновлюють лічильники колоди', () => {
  const repository = setup()
  repository.addCards(null, 'Колода', [{ question: 'Q', answer: 'A' }])
  const [card] = repository.queryCards({ scope: { kind: 'all' }, search: '', offset: 0, limit: 10 }).items
  assert.ok(card)
  assert.deepEqual(repository.setLearned(card.id, true), { ok: true })
  assert.deepEqual({ ...repository.stats({ kind: 'all' }) }, { total: 1, learned: 1 })
  assert.deepEqual(repository.removeCard(card.id), { ok: true })
  assert.deepEqual({ ...repository.stats({ kind: 'all' }) }, { total: 0, learned: 0 })
})

test('removeCard і renameDeck повідомляють про відсутній запис', () => {
  const repository = setup()
  assert.equal(repository.removeCard(12345).ok, false)
  assert.equal(repository.renameDeck('missing', 'Назва').ok, false)
})

test('removeDeck видаляє колоду разом із картками', () => {
  const repository = setup()
  const added = repository.addCards(null, 'Тимчасова', [{ question: 'Q', answer: 'A' }])
  assert.ok(added.ok)
  assert.deepEqual(repository.removeDeck(added.deckId), { ok: true })
  assert.equal(repository.listDecks().length, 0)
  assert.equal(repository.queryCards({ scope: { kind: 'all' }, search: '', offset: 0, limit: 10 }).items.length, 0)
})
