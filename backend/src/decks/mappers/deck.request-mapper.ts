import { type CreateDeckDto, type GenerateDeckDto, isStatementCardInput, isTextCardInput } from '../dto';
import type { GenerationRequest, NewDeck } from '../interfaces';

export const toGenerationRequest = (dto: GenerateDeckDto): GenerationRequest => ({
  topic: dto.topic,
  mode: dto.mode,
  language: dto.language,
  count: dto.count,
  instructions: dto.instructions ?? null,
});

export const toNewDeck = (dto: CreateDeckDto): NewDeck => {
  const base = { title: dto.title, language: dto.language, topic: dto.topic ?? null };

  if (dto.mode === 'truefalse') {
    return {
      ...base,
      mode: dto.mode,
      cards: dto.cards
        .filter(isStatementCardInput)
        .map(({ statement, isTrue }) => ({ statement: statement.trim(), isTrue })),
    };
  }

  return {
    ...base,
    mode: dto.mode,
    cards: dto.cards.filter(isTextCardInput).map(({ front, back }) => ({ front: front.trim(), back: back.trim() })),
  };
};
