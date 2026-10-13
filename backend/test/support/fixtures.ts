import type { CreateDeckDto, GenerateDeckDto } from '../../src/decks/dto';
import type { GenerationRequest, NewDeck } from '../../src/decks/interfaces';

export const flipDeckInput = (): CreateDeckDto => ({
  title: 'Англійські слова',
  mode: 'flip',
  language: 'uk',
  topic: 'базова лексика',
  cards: [
    { front: 'deck', back: 'колода' },
    { front: 'review', back: 'повторення' },
  ],
});

export const statementDeckInput = (): CreateDeckDto => ({
  title: 'Інтервальне повторення',
  mode: 'truefalse',
  language: 'uk',
  cards: [
    { statement: 'FSRS - це алгоритм планування повторень.', isTrue: true },
    { statement: 'Найкраще вчити все за одну ніч.', isTrue: false },
  ],
});

export const generateDeckInput = (): GenerateDeckDto => ({
  topic: 'кольори',
  mode: 'qa',
  language: 'uk',
  count: 5,
});

export const generationRequest = (overrides: Partial<GenerationRequest> = {}): GenerationRequest => ({
  topic: 'кольори',
  mode: 'qa',
  language: 'uk',
  count: 4,
  instructions: null,
  ...overrides,
});

export const generatedDraft = (): NewDeck => ({
  title: 'Кольори',
  language: 'uk',
  topic: 'кольори',
  mode: 'qa',
  cards: [
    { front: 'Якого кольору небо?', back: 'Блакитного' },
    { front: 'Якого кольору трава?', back: 'Зеленого' },
  ],
});
