import type { NewStudyCard, Topic } from '../study-cards/model'
import type { Deck } from './model'

const TRUE_LABEL = 'Правда'
const FALSE_LABEL = 'Неправда'

export const deckToStudyCards = (deck: Deck, topic: Topic): NewStudyCard[] =>
  deck.mode === 'truefalse'
    ? deck.cards.map((card) => ({
        question: card.statement,
        answer: card.isTrue ? TRUE_LABEL : FALSE_LABEL,
        topic,
        dueDate: '',
      }))
    : deck.cards.map((card) => ({ question: card.front, answer: card.back, topic, dueDate: '' }))
