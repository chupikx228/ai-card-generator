import type { DeckResponse, MessageResponse } from '../dto';
import type { Deck } from '../interfaces';

const DECK_DELETED_MESSAGE = 'Deck deleted';

export const toDeckResponse = (deck: Deck): DeckResponse => ({
  id: deck.id,
  title: deck.title,
  mode: deck.mode,
  language: deck.language,
  topic: deck.topic,
  cards: deck.cards.map((card) => ({ ...card })),
  createdAt: deck.createdAt.toISOString(),
  updatedAt: deck.updatedAt.toISOString(),
});

export const toDeckDeletedResponse = (): MessageResponse => ({ message: DECK_DELETED_MESSAGE });
