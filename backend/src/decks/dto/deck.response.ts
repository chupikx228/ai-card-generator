import type { DeckLanguage, DeckMode, StatementCard, TextCard } from '../interfaces';

export type DeckResponse = {
  id: string;
  title: string;
  mode: DeckMode;
  language: DeckLanguage;
  topic: string | null;
  cards: Array<TextCard | StatementCard>;
  createdAt: string;
  updatedAt: string;
};

export type MessageResponse = {
  message: string;
};
