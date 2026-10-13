import type { DECK_LANGUAGES, DECK_MODES } from './deck.constants';

export type DeckMode = (typeof DECK_MODES)[number];

export type DeckLanguage = (typeof DECK_LANGUAGES)[number];

export type TextCard = {
  id: string;
  front: string;
  back: string;
};

export type StatementCard = {
  id: string;
  statement: string;
  isTrue: boolean;
};

export type NewTextCard = Omit<TextCard, 'id'>;

export type NewStatementCard = Omit<StatementCard, 'id'>;

type DeckFields = {
  title: string;
  language: DeckLanguage;
  topic: string | null;
};

type DeckMeta = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewDeck = DeckFields &
  ({ mode: 'flip' | 'qa'; cards: NewTextCard[] } | { mode: 'truefalse'; cards: NewStatementCard[] });

export type Deck = DeckFields &
  DeckMeta &
  ({ mode: 'flip' | 'qa'; cards: TextCard[] } | { mode: 'truefalse'; cards: StatementCard[] });
