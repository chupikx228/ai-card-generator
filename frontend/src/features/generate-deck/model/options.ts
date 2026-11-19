import type { DeckLanguage, ReviewMode } from '@/entities/deck'
import { CARD_COUNT_OPTIONS } from '@deckly/shared/decks'

export { DEFAULT_CARD_COUNT, TOPIC_LIMITS } from '@deckly/shared/decks'

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

export const cardCountOptions: number[] = [...CARD_COUNT_OPTIONS]
