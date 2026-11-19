import { CARD_MESSAGES, MAX_CARD_TEXT_LENGTH, type NewStudyCard, type StudyCard, TOPICS, type Topic } from './model.ts'

export const isTopic = (value: string): value is Topic => TOPICS.some((topic) => topic === value)

export const validateCard = (input: NewStudyCard): string | null => {
  const question = input.question.trim()
  const answer = input.answer.trim()
  if (!question) {
    return CARD_MESSAGES.emptyQuestion
  }
  if (question.length > MAX_CARD_TEXT_LENGTH) {
    return CARD_MESSAGES.questionTooLong
  }
  if (!answer) {
    return CARD_MESSAGES.emptyAnswer
  }
  if (answer.length > MAX_CARD_TEXT_LENGTH) {
    return CARD_MESSAGES.answerTooLong
  }
  return null
}

export const createCard = (input: NewStudyCard, id = Date.now()): StudyCard => ({
  ...input,
  id,
  question: input.question.trim(),
  answer: input.answer.trim(),
  learned: false,
})

export const createCards = (inputs: NewStudyCard[]): StudyCard[] => {
  const baseId = Date.now()
  return inputs.filter((input) => validateCard(input) === null).map((input, index) => createCard(input, baseId + index))
}

export type CardChanges = Pick<NewStudyCard, 'question' | 'answer' | 'deckId'>

export const updateCard = (cards: StudyCard[], id: number, changes: CardChanges): StudyCard[] =>
  cards.map((card) =>
    card.id === id
      ? {
          ...card,
          question: changes.question.trim(),
          answer: changes.answer.trim(),
          deckId: changes.deckId ?? card.deckId,
        }
      : card,
  )

export const toggleCard = (cards: StudyCard[], id: number): StudyCard[] =>
  cards.map((card) => (card.id === id ? { ...card, learned: !card.learned } : card))

export const setCardLearned = (cards: StudyCard[], id: number, learned: boolean): StudyCard[] =>
  cards.map((card) => (card.id === id ? { ...card, learned } : card))

export const removeCard = (cards: StudyCard[], id: number): StudyCard[] => cards.filter((card) => card.id !== id)

export const countLearned = (cards: StudyCard[]): number => cards.filter((card) => card.learned).length

export const filterCards = (cards: StudyCard[], search: string): StudyCard[] => {
  const query = search.trim().toLowerCase()
  return query ? cards.filter((card) => `${card.question} ${card.answer} ${card.topic}`.toLowerCase().includes(query)) : cards
}
