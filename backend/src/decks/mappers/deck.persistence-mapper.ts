import type { Deck, NewDeck, StatementCard, TextCard } from '../interfaces';
import type { CardEntity, DeckDocument, DeckEntity } from '../schemas/deck.schema';

export type DeckRecord = Pick<DeckEntity, 'title' | 'mode' | 'language' | 'topic'> & {
  cards: Array<Omit<CardEntity, '_id'>>;
};

const corruptCard = (deckId: string, field: keyof CardEntity): Error =>
  new Error(`Deck ${deckId} contains a card without ${field}`);

const toTextCard = (deckId: string, card: CardEntity): TextCard => {
  if (card.front === undefined) {
    throw corruptCard(deckId, 'front');
  }
  if (card.back === undefined) {
    throw corruptCard(deckId, 'back');
  }
  return { id: card._id.toString(), front: card.front, back: card.back };
};

const toStatementCard = (deckId: string, card: CardEntity): StatementCard => {
  if (card.statement === undefined) {
    throw corruptCard(deckId, 'statement');
  }
  if (card.isTrue === undefined) {
    throw corruptCard(deckId, 'isTrue');
  }
  return { id: card._id.toString(), statement: card.statement, isTrue: card.isTrue };
};

export const toDeck = (document: DeckDocument): Deck => {
  const id = document._id.toString();
  const base = {
    id,
    title: document.title,
    language: document.language,
    topic: document.topic,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };

  if (document.mode === 'truefalse') {
    return { ...base, mode: document.mode, cards: document.cards.map((card) => toStatementCard(id, card)) };
  }

  return { ...base, mode: document.mode, cards: document.cards.map((card) => toTextCard(id, card)) };
};

export const toDeckRecord = (deck: NewDeck): DeckRecord => {
  const base = { title: deck.title, mode: deck.mode, language: deck.language, topic: deck.topic };

  if (deck.mode === 'truefalse') {
    return { ...base, cards: deck.cards.map(({ statement, isTrue }) => ({ statement, isTrue })) };
  }

  return { ...base, cards: deck.cards.map(({ front, back }) => ({ front, back })) };
};
