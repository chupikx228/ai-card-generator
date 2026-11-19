import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CARD_MESSAGES, createCard, type StudyCard, validateCard } from '@deckly/shared/study-cards'
import {
  createLocalStorageAdapter,
  type KeyValueStorage,
  STORAGE_KEY,
} from '../src/pages/cards/model/local-storage-adapter.ts'

const fakeStorage = (initial: Record<string, string> = {}): KeyValueStorage & { data: Record<string, string> } => {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
  }
}

const card: StudyCard = { id: 1, question: 'Q', answer: 'A', topic: 'Інше', dueDate: '', learned: false }

test('load повертає порожній масив, якщо сховище порожнє', () => {
  assert.deepEqual(createLocalStorageAdapter(fakeStorage()).load(), [])
})

test('save записує JSON під ключем deckly-cards, а load читає його назад', () => {
  const storage = fakeStorage()
  const adapter = createLocalStorageAdapter(storage)
  adapter.save([card])
  assert.deepEqual(JSON.parse(storage.data[STORAGE_KEY] ?? ''), [card])
  assert.deepEqual(createLocalStorageAdapter(storage).load(), [card])
})

test('load повертає [] для пошкодженого JSON і для не-масиву', () => {
  assert.deepEqual(createLocalStorageAdapter(fakeStorage({ [STORAGE_KEY]: '{broken' })).load(), [])
  assert.deepEqual(createLocalStorageAdapter(fakeStorage({ [STORAGE_KEY]: '{"a":1}' })).load(), [])
})

test('save не ламає застосунок, якщо сховище недоступне', () => {
  const adapter = createLocalStorageAdapter({
    getItem: () => {
      throw new Error('denied')
    },
    setItem: () => {
      throw new Error('quota')
    },
  })
  assert.doesNotThrow(() => adapter.save([card]))
  assert.deepEqual(adapter.load(), [])
})

test('адаптер працює разом із правилами ядра', () => {
  const adapter = createLocalStorageAdapter(fakeStorage())
  const empty = { question: ' ', answer: 'A', topic: 'Інше' as const, dueDate: '' }
  assert.equal(validateCard(empty), CARD_MESSAGES.emptyQuestion)
  adapter.save([...adapter.load(), createCard({ ...empty, question: 'Питання' }, 7)])
  assert.deepEqual(
    adapter.load().map((item) => item.question),
    ['Питання'],
  )
})
