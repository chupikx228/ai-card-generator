export const TOPICS = ['Англійська', 'Історія', 'Програмування', 'Інше'] as const

export type Topic = (typeof TOPICS)[number]

export type StudyCard = {
  id: number
  question: string
  answer: string
  topic: Topic
  dueDate: string
  learned: boolean
  deckId?: string
}

export type NewStudyCard = Pick<StudyCard, 'question' | 'answer' | 'topic' | 'dueDate' | 'deckId'>

export type DeckRecord = {
  id: string
  title: string
  createdAt: number
}

export type CardLibrary = {
  decks: DeckRecord[]
  cards: StudyCard[]
}

export const MAX_CARD_TEXT_LENGTH = 500

export const CARD_MESSAGES = {
  emptyQuestion: 'Введіть текст питання.',
  emptyAnswer: 'Введіть відповідь.',
  questionTooLong: `Питання не повинно перевищувати ${MAX_CARD_TEXT_LENGTH} символів.`,
  answerTooLong: `Відповідь не повинна перевищувати ${MAX_CARD_TEXT_LENGTH} символів.`,
  added: 'Картку додано.',
  updated: 'Картку оновлено.',
  deleted: 'Картку видалено.',
} as const

export const DECK_MESSAGES = {
  emptyTitle: 'Введіть назву колоди.',
  created: 'Колоду створено.',
  renamed: 'Колоду перейменовано.',
  deleted: 'Колоду видалено.',
} as const

export const DEFAULT_DECK_TITLE = 'Мої картки'
