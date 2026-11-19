import assert from 'node:assert/strict'
import { test } from 'node:test'
import { type Deck, deckToStudyCards, getGenerationErrorMessage, pickDistinct } from '@deckly/shared/decks'
import { isGenerateDeckParams } from '@deckly/shared/decks/request'

test('isGenerateDeckParams перевіряє тему, режим, мову і кількість', () => {
  assert.equal(isGenerateDeckParams({ topic: 'React', mode: 'flip', language: 'uk', count: 10 }), true)
  assert.equal(isGenerateDeckParams({ topic: 'ab', mode: 'flip', language: 'uk', count: 10 }), false)
  assert.equal(isGenerateDeckParams({ topic: 'React', mode: 'quiz', language: 'uk', count: 10 }), false)
  assert.equal(isGenerateDeckParams(null), false)
})

test('getGenerationErrorMessage повертає текст за кодом або загальне повідомлення', () => {
  assert.match(getGenerationErrorMessage('TOPIC_REJECTED'), /іншу/)
  assert.equal(getGenerationErrorMessage('???'), getGenerationErrorMessage('ще один невідомий код'))
})

test('deckToStudyCards перетворює твердження на картки «Правда / Неправда»', () => {
  const deck: Deck = {
    id: 'd',
    mode: 'truefalse',
    title: 'Факти',
    cards: [
      { id: '1', statement: 'Земля кругла', isTrue: true },
      { id: '2', statement: 'Сонце холодне', isTrue: false },
    ],
  }
  assert.deepEqual(
    deckToStudyCards(deck, 'Інше').map((card) => card.answer),
    ['Правда', 'Неправда'],
  )
})

test('pickDistinct пропускає питання, схожі на вже наявні', () => {
  const picked = pickDistinct([{ question: 'What is React' }, { question: 'Explain closures' }], ['what is react?'])
  assert.equal(picked?.question, 'Explain closures')
})
