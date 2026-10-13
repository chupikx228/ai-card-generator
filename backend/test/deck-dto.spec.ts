import { type ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateDeckDto, GenerateDeckDto } from '../src/decks/dto';
import { flipDeckInput, generateDeckInput, statementDeckInput } from './support/fixtures';

const errorsFor = async <T extends object>(type: ClassConstructor<T>, input: unknown): Promise<string[]> => {
  const errors = await validate(plainToInstance(type, input), { whitelist: true, forbidNonWhitelisted: true });
  return errors.map((error) => error.property);
};

describe('CreateDeckDto', () => {
  it.each([
    ['flip', flipDeckInput()],
    ['truefalse', statementDeckInput()],
  ])('accepts a valid %s deck', async (_mode, input) => {
    await expect(errorsFor(CreateDeckDto, input)).resolves.toEqual([]);
  });

  it.each([
    ['text cards in a truefalse deck', { ...statementDeckInput(), cards: [{ front: 'a', back: 'b' }] }],
    ['statement cards in a flip deck', { ...flipDeckInput(), cards: [{ statement: 'a', isTrue: true }] }],
    ['a card with an extra field', { ...flipDeckInput(), cards: [{ front: 'a', back: 'b', hint: 'c' }] }],
    ['a card with whitespace-only text', { ...flipDeckInput(), cards: [{ front: '   ', back: 'b' }] }],
    ['a card with text over 500 characters', { ...flipDeckInput(), cards: [{ front: 'a', back: 'b'.repeat(501) }] }],
    ['isTrue given as a string', { ...statementDeckInput(), cards: [{ statement: 'a', isTrue: 'true' }] }],
    ['a card that is not an object', { ...flipDeckInput(), cards: ['deck'] }],
    ['no cards', { ...flipDeckInput(), cards: [] }],
    ['more than 100 cards', { ...flipDeckInput(), cards: Array.from({ length: 101 }, () => ({ front: 'a', back: 'b' })) }],
  ])('rejects %s', async (_case, input) => {
    await expect(errorsFor(CreateDeckDto, input)).resolves.toEqual(['cards']);
  });

  it('rejects a title that is blank after trimming', async () => {
    await expect(errorsFor(CreateDeckDto, { ...flipDeckInput(), title: '   ' })).resolves.toEqual(['title']);
  });

  it('rejects an unknown mode and language', async () => {
    await expect(errorsFor(CreateDeckDto, { ...flipDeckInput(), mode: 'cloze', language: 'ru' })).resolves.toEqual([
      'mode',
      'language',
    ]);
  });

  it('rejects unknown top-level fields', async () => {
    await expect(errorsFor(CreateDeckDto, { ...flipDeckInput(), owner: 'me' })).resolves.toEqual(['owner']);
  });

  it('accepts a null topic', async () => {
    await expect(errorsFor(CreateDeckDto, { ...flipDeckInput(), topic: null })).resolves.toEqual([]);
  });
});

describe('GenerateDeckDto', () => {
  it('accepts a valid request', async () => {
    await expect(errorsFor(GenerateDeckDto, generateDeckInput())).resolves.toEqual([]);
  });

  it.each([
    ['count below 5', { count: 4 }, 'count'],
    ['count above 30', { count: 31 }, 'count'],
    ['a fractional count', { count: 5.5 }, 'count'],
    ['count given as a string', { count: '5' }, 'count'],
    ['a topic shorter than 3 characters after trimming', { topic: '  ab  ' }, 'topic'],
    ['a topic over 200 characters', { topic: 't'.repeat(201) }, 'topic'],
    ['instructions over 500 characters', { instructions: 'i'.repeat(501) }, 'instructions'],
  ])('rejects %s', async (_case, override, property) => {
    await expect(errorsFor(GenerateDeckDto, { ...generateDeckInput(), ...override })).resolves.toEqual([property]);
  });
});
