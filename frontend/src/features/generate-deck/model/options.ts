import type { DeckLanguage, ReviewMode } from '@/entities/deck'

export type DeckTypeOption = {
  id: ReviewMode
  label: string
}

export const deckTypes: DeckTypeOption[] = [
  { id: 'flip', label: 'Перегортання' },
  { id: 'qa', label: 'Питання-відповідь' },
  { id: 'truefalse', label: 'Правда / Брехня' },
]

export type LanguageOption = {
  id: DeckLanguage
  label: string
}

export const languageOptions: LanguageOption[] = [
  { id: 'uk', label: 'Українська' },
  { id: 'en', label: 'English' },
]

export const cardCountOptions = [5, 10, 15]

export const DEFAULT_CARD_COUNT = 10

export const TOPIC_LIMITS = {
  minLength: 3,
  maxLength: 200,
} as const
