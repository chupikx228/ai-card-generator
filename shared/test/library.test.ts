import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createDeck,
  createMemoryStorage,
  DECK_MESSAGES,
  normalizeLibrary,
  pluralCards,
  removeDeck,
  renameDeck,
  type StudyCard,
  validateDeckTitle,
} from '@deckly/shared/study-cards'
import { parseLibrary, parseStudyCards } from '@deckly/shared/study-cards/schema'

const card = (id: number, deckId?: string): StudyCard => ({
  id,
  question: `Q${id}`,
  answer: `A${id}`,
  topic: 'Історія',
  dueDate: '',
  learned: false,
  deckId,
})

test('validateDeckTitle відхиляє порожню назву', () => {
  assert.equal(validateDeckTitle('  '), DECK_MESSAGES.emptyTitle)
  assert.equal(validateDeckTitle('Колода'), null)
})

test('createDeck обрізає назву і зберігає дату створення', () => {
  const deck = createDeck('  Англійська  ', 1000)
  assert.equal(deck.title, 'Англійська')
  assert.equal(deck.createdAt, 1000)
  assert.notEqual(createDeck('X').id, createDeck('X').id)
})

test('normalizeLibrary переносить картки без колоди у колоду за темою', () => {
  const library = normalizeLibrary({ decks: [], cards: [card(1), card(2)] })
  assert.equal(library.decks.length, 1)
  assert.equal(library.decks[0]?.title, 'Історія')
  assert.ok(library.cards.every((item) => item.deckId === library.decks[0]?.id))
})

test('renameDeck і removeDeck не змінюють вихідну бібліотеку', () => {
  const deck = createDeck('Стара')
  const library = { decks: [deck], cards: [card(1, deck.id)] }
  assert.equal(renameDeck(library, deck.id, ' Нова ').decks[0]?.title, 'Нова')
  assert.deepEqual(removeDeck(library, deck.id), { decks: [], cards: [] })
  assert.equal(library.decks[0]?.title, 'Стара')
})

test('parseStudyCards відкидає пошкоджені дані', () => {
  assert.deepEqual(parseStudyCards([{ id: 'x' }]), [])
  assert.deepEqual(parseStudyCards('not an array'), [])
  assert.equal(parseStudyCards([card(1)]).length, 1)
})

test('parseLibrary підтримує старий формат — масив карток', () => {
  const library = parseLibrary([card(1)])
  assert.equal(library.cards.length, 1)
  assert.equal(library.decks.length, 1)
})

test('pluralCards узгоджує слово з числом', () => {
  assert.equal(pluralCards(1), '1 картка')
  assert.equal(pluralCards(3), '3 картки')
  assert.equal(pluralCards(5), '5 карток')
  assert.equal(pluralCards(11), '11 карток')
})

test('createMemoryStorage зберігає копію даних у пам’яті', () => {
  const storage = createMemoryStorage()
  assert.deepEqual(storage.load(), [])
  const cards = [card(1)]
  storage.save(cards)
  cards.pop()
  assert.equal(storage.load().length, 1)
})
