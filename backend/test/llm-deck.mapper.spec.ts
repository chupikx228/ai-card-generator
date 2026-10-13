import { describe, expect, it } from 'vitest';
import { GenerationFailedError, TopicRejectedError } from '../src/decks/errors';
import { toStatementDeckDraft, toTextDeckDraft } from '../src/decks/mappers/llm-deck.mapper';
import { generationRequest } from './support/fixtures';

const textCard = (front: string, back: string) => ({ front, back });

describe('toTextDeckDraft', () => {
  it('throws TopicRejectedError when the model refuses the topic', () => {
    expect(() => toTextDeckDraft(generationRequest(), 'qa', { allowed: false, title: '', cards: [] })).toThrow(
      TopicRejectedError,
    );
  });

  it('normalizes whitespace in titles and cards', () => {
    const draft = toTextDeckDraft(generationRequest({ count: 2 }), 'qa', {
      allowed: true,
      title: '  Кольори \n веселки ',
      cards: [textCard('  Колір   неба? ', 'Блакитний\n'), textCard('Колір трави?', ' Зелений ')],
    });

    expect(draft.title).toBe('Кольори веселки');
    expect(draft.cards).toEqual([textCard('Колір неба?', 'Блакитний'), textCard('Колір трави?', 'Зелений')]);
  });

  it('drops empty cards, cards whose answer repeats the question and case-insensitive duplicates', () => {
    const draft = toTextDeckDraft(generationRequest({ count: 4 }), 'flip', {
      allowed: true,
      title: 'Слова',
      cards: [
        textCard('red', 'червоний'),
        textCard('   ', 'порожньо'),
        textCard('blue', 'BLUE'),
        textCard('RED', 'червоний'),
        textCard('green', 'зелений'),
      ],
    });

    expect(draft.mode).toBe('flip');
    expect(draft.cards).toEqual([textCard('red', 'червоний'), textCard('green', 'зелений')]);
  });

  it('drops cards longer than the card text limit', () => {
    const draft = toTextDeckDraft(generationRequest({ count: 2 }), 'qa', {
      allowed: true,
      title: 'Кольори',
      cards: [textCard('ok', 'yes'), textCard('long', 'x'.repeat(501))],
    });

    expect(draft.cards).toEqual([textCard('ok', 'yes')]);
  });

  it('keeps at most the requested number of cards', () => {
    const cards = Array.from({ length: 8 }, (_, index) => textCard(`q${index}`, `a${index}`));

    const draft = toTextDeckDraft(generationRequest({ count: 5 }), 'qa', { allowed: true, title: 't', cards });

    expect(draft.cards).toHaveLength(5);
  });

  it('accepts exactly half of the requested cards', () => {
    const cards = Array.from({ length: 5 }, (_, index) => textCard(`q${index}`, `a${index}`));

    expect(() => toTextDeckDraft(generationRequest({ count: 10 }), 'qa', { allowed: true, title: 't', cards })).not.toThrow();
  });

  it('throws GenerationFailedError when fewer than half of the requested cards are usable', () => {
    const cards = Array.from({ length: 4 }, (_, index) => textCard(`q${index}`, `a${index}`));

    expect(() => toTextDeckDraft(generationRequest({ count: 10 }), 'qa', { allowed: true, title: 't', cards })).toThrow(
      GenerationFailedError,
    );
  });

  it('falls back to the topic when the title is blank and cuts long titles', () => {
    const cards = [textCard('q1', 'a1'), textCard('q2', 'a2')];

    const blank = toTextDeckDraft(generationRequest({ count: 2 }), 'qa', { allowed: true, title: '   ', cards });
    const long = toTextDeckDraft(generationRequest({ count: 2 }), 'qa', { allowed: true, title: 't'.repeat(300), cards });

    expect(blank.title).toBe('кольори');
    expect(long.title).toHaveLength(120);
  });
});

describe('toStatementDeckDraft', () => {
  it('builds a truefalse deck and drops blank and duplicate statements', () => {
    const draft = toStatementDeckDraft(generationRequest({ mode: 'truefalse', count: 2 }), {
      allowed: true,
      title: 'Факти',
      cards: [
        { statement: 'Земля кругла.', isTrue: true },
        { statement: '  ', isTrue: false },
        { statement: 'земля КРУГЛА.', isTrue: false },
        { statement: 'Сонце - планета.', isTrue: false },
      ],
    });

    expect(draft.mode).toBe('truefalse');
    expect(draft.cards).toEqual([
      { statement: 'Земля кругла.', isTrue: true },
      { statement: 'Сонце - планета.', isTrue: false },
    ]);
  });

  it('throws TopicRejectedError when the model refuses the topic', () => {
    expect(() =>
      toStatementDeckDraft(generationRequest({ mode: 'truefalse' }), { allowed: false, title: '', cards: [] }),
    ).toThrow(TopicRejectedError);
  });
});
