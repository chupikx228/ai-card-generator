import { type CardLibrary, DECK_MESSAGES, type DeckRecord, type StudyCard } from './model.ts'

const fallbackId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

const newDeckId = (): string =>
  typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : fallbackId()

export const validateDeckTitle = (title: string): string | null => (title.trim() ? null : DECK_MESSAGES.emptyTitle)

export const createDeck = (title: string, createdAt = Date.now()): DeckRecord => ({
  id: newDeckId(),
  title: title.trim(),
  createdAt,
})

export const normalizeLibrary = (library: CardLibrary): CardLibrary => {
  const known = new Set(library.decks.map((deck) => deck.id))
  const isOrphan = (card: StudyCard) => !card.deckId || !known.has(card.deckId)
  if (!library.cards.some(isOrphan)) {
    return library
  }
  const decks = [...library.decks]
  const deckForTitle = (title: string): string => {
    const existing = decks.find((deck) => deck.title === title)
    if (existing) {
      return existing.id
    }
    const deck = createDeck(title)
    decks.push(deck)
    return deck.id
  }
  const cards = library.cards.map((card) => (isOrphan(card) ? { ...card, deckId: deckForTitle(card.topic) } : card))
  return { decks, cards }
}

export const cardsOfDeck = (cards: StudyCard[], deckId: string): StudyCard[] =>
  cards.filter((card) => card.deckId === deckId)

export const renameDeck = (library: CardLibrary, deckId: string, title: string): CardLibrary => ({
  ...library,
  decks: library.decks.map((deck) => (deck.id === deckId ? { ...deck, title: title.trim() } : deck)),
})

export const removeDeck = (library: CardLibrary, deckId: string): CardLibrary => ({
  decks: library.decks.filter((deck) => deck.id !== deckId),
  cards: library.cards.filter((card) => card.deckId !== deckId),
})
