import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CARD_MESSAGES,
  countLearned,
  createCard,
  createCards,
  filterCards,
  isTopic,
  MAX_CARD_TEXT_LENGTH,
  type NewStudyCard,
  removeCard,
  type StudyCard,
  toggleCard,
  updateCard,
  validateCard,
} from '@deckly/shared/study-cards'

const input = (question: string, answer: string): NewStudyCard => ({ question, answer, topic: 'Інше', dueDate: '' })

const sample: StudyCard[] = [
  { id: 1, question: 'Capital of France', answer: 'Paris', topic: 'Інше', dueDate: '', learned: false },
  { id: 2, question: 'Hook for state', answer: 'useState', topic: 'Програмування', dueDate: '', learned: true },
]

test('validateCard пропускає коректну картку', () => {
  assert.equal(validateCard(input('Питання', 'Відповідь')), null)
})

test('validateCard відхиляє порожнє питання і питання з самих пробілів', () => {
  assert.equal(validateCard(input('', 'Відповідь')), CARD_MESSAGES.emptyQuestion)
  assert.equal(validateCard(input('   ', 'Відповідь')), CARD_MESSAGES.emptyQuestion)
})

test('validateCard відхиляє порожню відповідь', () => {
  assert.equal(validateCard(input('Питання', '  ')), CARD_MESSAGES.emptyAnswer)
})

test('межа довжини: рівно MAX_CARD_TEXT_LENGTH символів допустимо, на один більше — ні', () => {
  const limit = 'а'.repeat(MAX_CARD_TEXT_LENGTH)
  const over = 'а'.repeat(MAX_CARD_TEXT_LENGTH + 1)
  assert.equal(validateCard(input(limit, limit)), null)
  assert.equal(validateCard(input(over, 'Відповідь')), CARD_MESSAGES.questionTooLong)
  assert.equal(validateCard(input('Питання', over)), CARD_MESSAGES.answerTooLong)
})

test('довжина рахується після обрізання пробілів', () => {
  const padded = `  ${'а'.repeat(MAX_CARD_TEXT_LENGTH)}  `
  assert.equal(validateCard(input(padded, 'Відповідь')), null)
})

test('повідомлення про довжину містить актуальне значення ліміту', () => {
  assert.ok(CARD_MESSAGES.questionTooLong.includes(String(MAX_CARD_TEXT_LENGTH)))
})

test('createCard обрізає пробіли і створює невивчену картку', () => {
  const card = createCard(input('  Питання  ', ' Відповідь '), 42)
  assert.deepEqual(card, { id: 42, question: 'Питання', answer: 'Відповідь', topic: 'Інше', dueDate: '', learned: false })
})

test('createCards пропускає некоректні записи і видає унікальні id', () => {
  const cards = createCards([input('A', 'B'), input('', 'B'), input('C', 'D')])
  assert.equal(cards.length, 2)
  assert.equal(new Set(cards.map((card) => card.id)).size, 2)
})

test('toggleCard перемикає стан і не змінює вихідний масив', () => {
  const snapshot = structuredClone(sample)
  const result = toggleCard(sample, 1)
  assert.equal(result[0]?.learned, true)
  assert.deepEqual(sample, snapshot)
})

test('updateCard змінює лише потрібну картку', () => {
  const result = updateCard(sample, 2, { question: ' Новий ', answer: ' Текст ' })
  assert.equal(result[1]?.question, 'Новий')
  assert.equal(result[1]?.answer, 'Текст')
  assert.equal(result[0], sample[0])
})

test('removeCard видаляє наявну картку і ігнорує відсутню', () => {
  assert.deepEqual(
    removeCard(sample, 1).map((card) => card.id),
    [2],
  )
  assert.equal(removeCard(sample, 99).length, 2)
})

test('filterCards шукає без урахування регістру; порожній запит повертає все', () => {
  assert.deepEqual(
    filterCards(sample, 'PARIS').map((card) => card.id),
    [1],
  )
  assert.deepEqual(
    filterCards(sample, 'програм').map((card) => card.id),
    [2],
  )
  assert.equal(filterCards(sample, '   ').length, 2)
})

test('countLearned рахує вивчені картки', () => {
  assert.equal(countLearned(sample), 1)
  assert.equal(countLearned([]), 0)
})

test('isTopic розпізнає лише відомі теми', () => {
  assert.equal(isTopic('Історія'), true)
  assert.equal(isTopic('Хімія'), false)
})
