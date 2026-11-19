import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { buildSchema, type CardsPage, createRepository } from '@deckly/shared/storage'
import { CARD_MESSAGES } from '@deckly/shared/study-cards'
import { CHANNELS } from '../src/ipc/contract.ts'
import { toSqlDatabase } from '../src/main/database.ts'
import { createHandlers, type Handler, INVALID } from '../src/main/handlers.ts'

const setup = (): Record<string, Handler> => {
  const db = new DatabaseSync(':memory:')
  db.exec('PRAGMA foreign_keys = ON')
  db.exec(buildSchema(true))
  return createHandlers(createRepository(toSqlDatabase(db), { fullText: true }))
}

const call = (handlers: Record<string, Handler>, channel: string, ...args: unknown[]): unknown => {
  const handler = handlers[channel]
  assert.ok(handler, channel)
  return handler(...args)
}

const allCards = (handlers: Record<string, Handler>, search = ''): CardsPage =>
  call(handlers, CHANNELS.queryCards, { scope: { kind: 'all' }, search, offset: 0, limit: 50 }) as CardsPage

test('обробники зареєстровані для всіх каналів роботи з картками', () => {
  const handlers = setup()
  for (const channel of [CHANNELS.listDecks, CHANNELS.addCards, CHANNELS.queryCards, CHANNELS.removeCard]) {
    assert.equal(typeof handlers[channel], 'function')
  }
})

test('addCards додає картку і вона з’являється у пошуку', () => {
  const handlers = setup()
  const result = call(handlers, CHANNELS.addCards, null, 'Колода', [{ question: 'Event loop', answer: 'Черга задач' }])
  assert.deepEqual(Object.keys(result as object).sort(), ['added', 'deckId', 'ok'])
  assert.equal(allCards(handlers, 'event').total, 1)
  assert.equal(allCards(handlers, 'відсутнє').total, 0)
})

test('addCards повертає помилку ядра для порожньої картки та INVALID для неправильних типів', () => {
  const handlers = setup()
  assert.deepEqual(call(handlers, CHANNELS.addCards, null, 'Колода', [{ question: '', answer: 'A' }]), {
    ok: false,
    error: CARD_MESSAGES.emptyQuestion,
  })
  assert.deepEqual(call(handlers, CHANNELS.addCards, 5, 'Колода', []), INVALID)
  assert.deepEqual(call(handlers, CHANNELS.addCards, null, 'Колода', [{ question: 1, answer: 2 }]), INVALID)
})

test('queryCards ігнорує запит неправильного формату', () => {
  assert.deepEqual(call(setup(), CHANNELS.queryCards, 'all'), { items: [], total: 0 })
})

test('removeCard приймає лише цілий числовий id', () => {
  const handlers = setup()
  call(handlers, CHANNELS.addCards, null, 'Колода', [{ question: 'Q', answer: 'A' }])
  const [card] = allCards(handlers).items
  assert.ok(card)
  assert.deepEqual(call(handlers, CHANNELS.removeCard, String(card.id)), INVALID)
  assert.deepEqual(call(handlers, CHANNELS.removeCard, card.id), { ok: true })
  assert.equal(allCards(handlers).total, 0)
})
