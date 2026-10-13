import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DecksService } from '../src/decks/decks.service';
import { DeckNotFoundError, GenerationFailedError, TopicRejectedError } from '../src/decks/errors';
import type { CardGenerator } from '../src/decks/interfaces';
import { flipDeckInput, generatedDraft, generateDeckInput, statementDeckInput } from './support/fixtures';
import { InMemoryDecksRepository } from './support/in-memory-decks.repository';

const MISSING_ID = 'ffffffffffffffffffffffff';

describe('DecksService', () => {
  let repository: InMemoryDecksRepository;
  let generate: ReturnType<typeof vi.fn<CardGenerator['generate']>>;
  let service: DecksService;

  beforeEach(() => {
    repository = new InMemoryDecksRepository();
    generate = vi.fn<CardGenerator['generate']>();
    service = new DecksService(repository, { generate });
  });

  describe('CRUD', () => {
    it('creates a deck and reads it back by id', async () => {
      const created = await service.create(flipDeckInput());

      await expect(service.findById(created.id)).resolves.toEqual(created);
      expect(created.cards).toHaveLength(2);
      expect(created.topic).toBe('базова лексика');
    });

    it('stores a missing topic as null', async () => {
      const created = await service.create(statementDeckInput());

      expect(created.topic).toBeNull();
      expect(created.mode).toBe('truefalse');
    });

    it('trims card text before saving', async () => {
      const created = await service.create({ ...flipDeckInput(), cards: [{ front: '  deck ', back: ' колода  ' }] });

      expect(created.cards).toEqual([expect.objectContaining({ front: 'deck', back: 'колода' })]);
    });

    it('lists decks newest first', async () => {
      const first = await service.create(flipDeckInput());
      const second = await service.create(statementDeckInput());

      const ids = (await service.findAll()).map((deck) => deck.id);
      expect(ids).toEqual([second.id, first.id]);
    });

    it('replaces a deck, including a change of mode', async () => {
      const created = await service.create(flipDeckInput());

      const replaced = await service.replace(created.id, statementDeckInput());

      expect(replaced.id).toBe(created.id);
      expect(replaced.mode).toBe('truefalse');
      expect(replaced.createdAt).toEqual(created.createdAt);
    });

    it('deletes a deck so it can no longer be read', async () => {
      const created = await service.create(flipDeckInput());

      await service.delete(created.id);

      await expect(service.findById(created.id)).rejects.toBeInstanceOf(DeckNotFoundError);
    });

    it.each([
      ['findById', (decks: DecksService) => decks.findById(MISSING_ID)],
      ['replace', (decks: DecksService) => decks.replace(MISSING_ID, flipDeckInput())],
      ['delete', (decks: DecksService) => decks.delete(MISSING_ID)],
    ])('%s throws DeckNotFoundError for an unknown id', async (_name, call) => {
      await expect(call(service)).rejects.toBeInstanceOf(DeckNotFoundError);
    });
  });

  describe('generate', () => {
    it('passes the request to the generator and saves the draft', async () => {
      generate.mockResolvedValue(generatedDraft());

      const deck = await service.generate(generateDeckInput());

      expect(generate).toHaveBeenCalledWith({
        topic: 'кольори',
        mode: 'qa',
        language: 'uk',
        count: 5,
        instructions: null,
      });
      await expect(service.findById(deck.id)).resolves.toEqual(deck);
    });

    it('forwards instructions when present', async () => {
      generate.mockResolvedValue(generatedDraft());

      await service.generate({ ...generateDeckInput(), instructions: 'тільки основні кольори' });

      expect(generate).toHaveBeenCalledWith(expect.objectContaining({ instructions: 'тільки основні кольори' }));
    });

    it.each([new TopicRejectedError('x'), new GenerationFailedError('down')])(
      'saves nothing when the generator throws %s',
      async (error) => {
        generate.mockRejectedValue(error);

        await expect(service.generate(generateDeckInput())).rejects.toBe(error);
        await expect(service.findAll()).resolves.toEqual([]);
      },
    );
  });
});
