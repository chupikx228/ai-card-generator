import type { DeckLanguage, DeckMode, NewDeck } from './deck.interface';

export const CARD_GENERATOR = Symbol('CardGenerator');

export type GenerationRequest = {
  topic: string;
  mode: DeckMode;
  language: DeckLanguage;
  count: number;
  instructions: string | null;
};

export interface CardGenerator {
  generate(request: GenerationRequest): Promise<NewDeck>;
}
