import type { Deck, NewDeck } from './deck.interface';

export const DECKS_REPOSITORY = Symbol('DecksRepository');

export interface DecksRepository {
  findAll(): Promise<Deck[]>;
  findById(id: string): Promise<Deck | null>;
  create(deck: NewDeck): Promise<Deck>;
  replace(id: string, deck: NewDeck): Promise<Deck | null>;
  delete(id: string): Promise<boolean>;
}
