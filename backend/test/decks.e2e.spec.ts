import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { configureApp } from '../src/app.setup';
import { DecksController } from '../src/decks/decks.controller';
import { DecksService } from '../src/decks/decks.service';
import { GenerationFailedError, TopicRejectedError } from '../src/decks/errors';
import { CARD_GENERATOR, type CardGenerator, DECKS_REPOSITORY } from '../src/decks/interfaces';
import { flipDeckInput, generatedDraft, generateDeckInput, statementDeckInput } from './support/fixtures';
import { InMemoryDecksRepository } from './support/in-memory-decks.repository';

const DECKS = '/api/decks';
const MISSING_ID = 'ffffffffffffffffffffffff';

const readId = (body: unknown): string => {
  const id: unknown = typeof body === 'object' && body !== null ? Reflect.get(body, 'id') : undefined;
  if (typeof id !== 'string') {
    throw new Error('Response body has no id');
  }
  return id;
};

describe('Decks API', () => {
  let app: INestApplication;
  let generate: ReturnType<typeof vi.fn<CardGenerator['generate']>>;

  beforeEach(async () => {
    generate = vi.fn<CardGenerator['generate']>();
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController, DecksController],
      providers: [
        AppService,
        DecksService,
        { provide: DECKS_REPOSITORY, useValue: new InMemoryDecksRepository() },
        { provide: CARD_GENERATOR, useValue: { generate } },
      ],
    }).compile();

    app = moduleRef.createNestApplication({ logger: false });
    configureApp(app, { corsOrigin: 'http://localhost:5173' });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('answers the root status route outside the /api prefix', async () => {
    await request(app.getHttpServer()).get('/').expect(200, 'Deckly API is running');
  });

  it('runs the full CRUD cycle with the lab status codes', async () => {
    const server = app.getHttpServer();

    await request(server).get(DECKS).expect(200, []);

    const created = await request(server).post(DECKS).send(flipDeckInput()).expect(201);
    const id = readId(created.body);
    expect(created.body).toMatchObject({ title: 'Англійські слова', mode: 'flip', topic: 'базова лексика' });
    expect(created.body.createdAt).toEqual(expect.any(String));

    await request(server).get(`${DECKS}/${id}`).expect(200);
    await request(server).get(DECKS).expect(200).expect(({ body }) => expect(body).toHaveLength(1));

    const replaced = await request(server).put(`${DECKS}/${id}`).send(statementDeckInput()).expect(200);
    expect(replaced.body).toMatchObject({ id, mode: 'truefalse', topic: null });

    await request(server).delete(`${DECKS}/${id}`).expect(200, { message: 'Deck deleted' });
    await request(server).get(`${DECKS}/${id}`).expect(404);
  });

  it.each([
    ['GET', (server: ReturnType<INestApplication['getHttpServer']>) => request(server).get(`${DECKS}/${MISSING_ID}`)],
    ['GET with a malformed id', (server: ReturnType<INestApplication['getHttpServer']>) => request(server).get(`${DECKS}/not-an-id`)],
    ['PUT', (server: ReturnType<INestApplication['getHttpServer']>) => request(server).put(`${DECKS}/${MISSING_ID}`).send(flipDeckInput())],
    ['DELETE', (server: ReturnType<INestApplication['getHttpServer']>) => request(server).delete(`${DECKS}/${MISSING_ID}`)],
  ])('%s on an unknown deck answers 404 DECK_NOT_FOUND', async (_case, send) => {
    const response = await send(app.getHttpServer()).expect(404);

    expect(response.body).toMatchObject({ statusCode: 404, code: 'DECK_NOT_FOUND' });
  });

  it('answers 400 VALIDATION_FAILED with the failing path', async () => {
    const response = await request(app.getHttpServer())
      .post(DECKS)
      .send({ ...statementDeckInput(), cards: [{ front: 'a', back: 'b' }] })
      .expect(400);

    expect(response.body).toMatchObject({ statusCode: 400, code: 'VALIDATION_FAILED' });
    expect(response.body.message).toContain('cards.0');
  });

  it('validates PUT bodies with the same rules as POST', async () => {
    const created = await request(app.getHttpServer()).post(DECKS).send(flipDeckInput()).expect(201);

    await request(app.getHttpServer())
      .put(`${DECKS}/${readId(created.body)}`)
      .send({ ...flipDeckInput(), cards: [] })
      .expect(400);
  });

  it('answers 400 for malformed JSON', async () => {
    const response = await request(app.getHttpServer())
      .post(DECKS)
      .set('Content-Type', 'application/json')
      .send('{"title":')
      .expect(400);

    expect(response.body.code).toBe('VALIDATION_FAILED');
  });

  it('answers 404 ROUTE_NOT_FOUND for an unknown route', async () => {
    const response = await request(app.getHttpServer()).get('/api/unknown').expect(404);

    expect(response.body.code).toBe('ROUTE_NOT_FOUND');
  });

  describe('POST /api/decks/generate', () => {
    it('saves the generated deck and answers 201', async () => {
      generate.mockResolvedValue(generatedDraft());

      const response = await request(app.getHttpServer()).post(`${DECKS}/generate`).send(generateDeckInput()).expect(201);

      expect(response.body).toMatchObject({ title: 'Кольори', mode: 'qa', topic: 'кольори' });
      await request(app.getHttpServer()).get(`${DECKS}/${readId(response.body)}`).expect(200);
    });

    it('validates the request before calling the generator', async () => {
      await request(app.getHttpServer()).post(`${DECKS}/generate`).send({ ...generateDeckInput(), count: 100 }).expect(400);

      expect(generate).not.toHaveBeenCalled();
    });

    it.each([
      [new TopicRejectedError('x'), 422, 'TOPIC_REJECTED'],
      [new GenerationFailedError('down'), 503, 'GENERATION_FAILED'],
    ])('maps %s to its status and code', async (error, status, code) => {
      generate.mockRejectedValue(error);

      const response = await request(app.getHttpServer()).post(`${DECKS}/generate`).send(generateDeckInput()).expect(status);

      expect(response.body.code).toBe(code);
      await request(app.getHttpServer()).get(DECKS).expect(200, []);
    });

    it('hides the details of an unexpected error', async () => {
      generate.mockRejectedValue(new Error('secret stack detail'));

      const response = await request(app.getHttpServer()).post(`${DECKS}/generate`).send(generateDeckInput()).expect(500);

      expect(response.body).toEqual({ statusCode: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' });
    });
  });
});
