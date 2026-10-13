# Backend

REST API for the deck generator. NestJS, TypeScript strict, MongoDB through Mongoose. It stores decks, serves full CRUD over them and generates new decks from a topic with an LLM.

## Running

```bash
npm install
cp .env.example .env
npm run dev
```

On start the console prints the MongoDB connection and `Server started on port 3000`. Every request is logged as one line: method, URL, status and duration.

| Script          | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start with watch mode (`nest start --watch`) |
| `npm run build` | Compile to `dist/`                   |
| `npm start`     | Run the compiled build               |
| `npm run typecheck` | `tsc --noEmit`                   |
| `npm test`      | Run the Vitest suite — no network, no database |

## Environment

All configuration comes from `.env`, validated with Zod at startup. A missing or malformed value stops the app before it listens.

| Variable         | Required          | Default                 | Meaning                                   |
| ---------------- | ----------------- | ----------------------- | ----------------------------------------- |
| `MONGO_URI`      | yes               | —                       | MongoDB connection string                 |
| `PORT`           | no                | `3000`                  | HTTP port                                 |
| `CORS_ORIGIN`    | no                | `http://localhost:5173` | Origin of the frontend dev server         |
| `GEMINI_API_KEY` | yes               | —                       | Google AI Studio API key                  |
| `GEMINI_MODEL`   | no                | `gemini-3.5-flash`      | Model name                                |

`.env` is git-ignored. `.env.example` lists every variable without secrets.

Google retires older models for new keys, and the newest ones are often overloaded or have a tighter free quota. `gemini-3.5-flash` was checked against a free key on 2026-10-06. If generation answers `503`, look at the server log for the model's own error and change `GEMINI_MODEL`.

## API

Base path `/api`. JSON in, JSON out.

| Method   | Path                  | Body              | Success       | Errors          |
| -------- | --------------------- | ----------------- | ------------- | --------------- |
| `GET`    | `/api/decks`          | —                 | `200` Deck[]  | —               |
| `GET`    | `/api/decks/:id`      | —                 | `200` Deck    | `404`           |
| `POST`   | `/api/decks`          | `CreateDeckDto`   | `201` Deck    | `400`           |
| `PUT`    | `/api/decks/:id`      | `UpdateDeckDto`   | `200` Deck    | `400`, `404`    |
| `DELETE` | `/api/decks/:id`      | —                 | `200` message | `404`           |
| `POST`   | `/api/decks/generate` | `GenerateDeckDto` | `201` Deck    | `400`, `422`, `503` |

`DELETE` answers `{ "message": "Deck deleted" }`. `GET /api/decks` returns decks newest first. An id that is not a valid MongoDB ObjectId answers `404`, the same as an id that does not exist. `PUT` replaces the whole deck, so its body is validated with the same rules as `POST`.

### Deck

The card shape depends on the deck's `mode`, mirroring `frontend/src/entities`:

```json
{
  "id": "6710c4…",
  "title": "Дорожні знаки",
  "mode": "qa",
  "language": "uk",
  "topic": "дорожні знаки України",
  "cards": [{ "id": "6710c5…", "front": "Що означає червоний трикутник?", "back": "Попереджувальний знак" }],
  "createdAt": "2026-10-06T10:30:00.000Z",
  "updatedAt": "2026-10-06T10:30:00.000Z"
}
```

| `mode`      | Card fields                     |
| ----------- | ------------------------------- |
| `flip`      | `id`, `front`, `back`           |
| `qa`        | `id`, `front`, `back`           |
| `truefalse` | `id`, `statement`, `isTrue`     |

### Request bodies

`CreateDeckDto` and `UpdateDeckDto`:

| Field      | Rules                                                          |
| ---------- | -------------------------------------------------------------- |
| `title`    | string, trimmed, 1–120 characters                              |
| `mode`     | `flip` \| `qa` \| `truefalse`                                  |
| `language` | `uk` \| `en`                                                   |
| `topic`    | optional string, trimmed, up to 200 characters                 |
| `cards`    | 1–100 items, every item matching the shape for `mode`, no extra fields, each text 1–500 characters after trimming |

`GenerateDeckDto`:

| Field          | Rules                                         |
| -------------- | --------------------------------------------- |
| `topic`        | string, trimmed, 3–200 characters             |
| `mode`         | `flip` \| `qa` \| `truefalse`                 |
| `language`     | `uk` \| `en`                                  |
| `count`        | integer, 5–30                                 |
| `instructions` | optional string, up to 500 characters         |

Unknown fields are rejected, not silently dropped.

### Errors

Every error has the same body, built in one place — the global exception filter:

```json
{ "statusCode": 404, "code": "DECK_NOT_FOUND", "message": "Deck not found" }
```

| `code`               | Status | When                                           |
| -------------------- | ------ | ---------------------------------------------- |
| `VALIDATION_FAILED`  | 400    | Body or parameter fails validation             |
| `ROUTE_NOT_FOUND`    | 404    | No route for this method and path              |
| `DECK_NOT_FOUND`     | 404    | No deck with this id                           |
| `TOPIC_REJECTED`     | 422    | The model refused the topic                    |
| `GENERATION_FAILED`  | 503    | The model failed or returned no usable cards   |
| `INTERNAL_ERROR`     | 500    | Anything unexpected; details are only logged   |

`message` is for developers. The frontend maps `code` to its own text.

## Architecture

Standard NestJS: one module per resource, providers wired through dependency injection. On top of it, a strict layering with the repository pattern.

```
backend/
├── src/
│   ├── main.ts                     bootstrap: config, port, shutdown hooks
│   ├── app.setup.ts                prefix /api, CORS, ValidationPipe, filter — shared with e2e tests
│   ├── app.module.ts               root module: config, database, feature modules
│   ├── config/                     Zod env schema
│   ├── database/                   MongooseModule.forRootAsync
│   ├── common/
│   │   ├── errors/                 DomainError base class, ErrorCode
│   │   ├── filters/                DomainExceptionFilter — the only error → response mapper
│   │   └── middleware/             request logger
│   └── decks/
│       ├── decks.module.ts         binds every interface token to its implementation
│       ├── decks.controller.ts
│       ├── decks.service.ts
│       ├── dto/                    request DTOs (class-validator), response types
│       ├── interfaces/             domain types, repository and generator interfaces, DI tokens
│       ├── errors/                 DeckNotFoundError, TopicRejectedError, …
│       ├── schemas/                Mongoose schema
│       ├── repositories/           MongoDecksRepository
│       ├── mappers/                document ↔ domain, domain → response, LLM output → domain
│       └── generator/
│           ├── llm-schemas/        Zod schemas of what the model must return
│           ├── prompts/            prompt builders
│           └── gemini-card-generator.ts
├── test/
│   ├── support/                    InMemoryDecksRepository, fixtures
│   └── *.spec.ts
├── .env.example
├── requests.http                   every endpoint, runnable from the WebStorm HTTP Client
└── package.json
```

### Layer rules

| Unit       | May depend on                                         | Must not                                                               |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Controller | its service, DTOs, response mapper                    | contain logic, touch a repository, catch errors                        |
| Service    | interfaces through DI tokens, domain types, errors    | import `mongoose`, `@nestjs/mongoose`, a provider SDK or `HttpException` |
| Repository | Mongoose model, persistence mapper                    | contain business rules or return a Mongoose document                   |
| Generator  | provider SDK, prompts, LLM schemas, LLM mapper        | touch the database                                                     |
| Mapper     | the two types it converts between                     | do I/O                                                                 |
| Filter     | domain errors                                         | be bypassed — nothing else turns an error into a response              |

A controller method is one service call and one mapping. If it needs an `if`, the branch belongs in the service.

### SOLID

- **Single responsibility.** HTTP lives in the controller, business rules in the service, storage in the repository, model calls in the generator, conversions in mappers, error responses in the filter.
- **Open/closed.** A new LLM provider is a new class implementing `CardGenerator`, bound to `CARD_GENERATOR` in `decks.module.ts`. The service does not change.
- **Liskov substitution.** Anything bound to `DECKS_REPOSITORY` or `CARD_GENERATOR` must behave like the real implementation: same return types, same domain errors. The tests rely on it — they run the real service and controller against `InMemoryDecksRepository` and a mocked generator.
- **Interface segregation.** `DecksRepository` holds only the operations the service calls; `CardGenerator` has a single `generate` method.
- **Dependency inversion.** The service depends on interfaces, never on classes. Concrete implementations are bound only in `decks.module.ts`.

### Interfaces and DI tokens

TypeScript interfaces disappear at runtime, so each one is paired with a `Symbol` token that Nest injects by:

```ts
export const DECKS_REPOSITORY = Symbol('DecksRepository');

export interface DecksRepository {
  findAll(): Promise<Deck[]>;
  findById(id: string): Promise<Deck | null>;
  create(deck: NewDeck): Promise<Deck>;
  replace(id: string, deck: NewDeck): Promise<Deck | null>;
  delete(id: string): Promise<boolean>;
}
```

```ts
{ provide: DECKS_REPOSITORY, useClass: MongoDecksRepository }
```

```ts
constructor(@Inject(DECKS_REPOSITORY) private readonly decks: DecksRepository) {}
```

The repository returns `null` or `false` for a missing deck; the service turns that into `DeckNotFoundError`. Deciding that "missing" is an error is a business rule, so it lives in the service.

### Validation: DTO, Zod, mappers

| Input               | Tool                                                                     | Folder                 |
| ------------------- | ------------------------------------------------------------------------ | ---------------------- |
| HTTP bodies, params | `class-validator` DTOs, global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) | `dto/` |
| Environment         | Zod, parsed once at startup                                              | `config/`              |
| LLM output          | Zod, also converted to the JSON Schema the model must follow             | `generator/llm-schemas/` |

- Card shape depends on `mode`, which `class-validator` cannot express with plain decorators. A custom constraint, `@CardsMatchMode()`, checks every card against the deck's `mode`.
- Response types in `dto/` describe exactly what the API returns. The controller never returns a domain object or a Mongoose document.
- Mappers are pure functions, one file per boundary:
  - `deck.persistence-mapper.ts` — Mongoose document ↔ domain `Deck`, used only by the repository. `_id` becomes `id`.
  - `deck.response-mapper.ts` — domain `Deck` → `DeckResponse` with ISO dates, used only by the controller.
  - `llm-deck.mapper.ts` — validated LLM output → `NewDeck`, used only by the generator.

### Generation

`POST /api/decks/generate` is synchronous: the decks are small (5–30 cards), so one request fits in a few seconds and needs no job queue.

1. The service asks the `CardGenerator` for a deck draft: topic, mode, language, count.
2. The generator builds the prompt, calls the model with structured output and validates the reply with Zod.
3. Cards that break a rule the schema cannot express are dropped: empty text after trimming, duplicates, a `qa` answer equal to its question. If fewer than half the requested cards survive, generation fails with `GENERATION_FAILED`.
4. The service saves the draft through the repository and returns the stored deck with `201`.

**Structured output.** The model is not asked to "please return JSON". The Zod schema of the expected reply is converted with `z.toJSONSchema()` and sent as the response schema, the call sets `responseMimeType: application/json`, and the reply is still parsed with `safeParse`, because a schema guarantees shape, not meaning. The schema is flat — one object per card with the fields of its mode — since models follow flat schemas more reliably.

**Prompts** are typed builder functions in `generator/prompts/`, never string literals inside a generator class:

- Instructions are written in English; the output language (`uk` or `en`) is a parameter.
- The user's `topic` and `instructions` are passed as data inside tags, and the prompt states that tagged text describes content, not instructions. This keeps a topic like "ignore the rules and…" from steering the model.
- Every prompt carries the card-quality rules: one fact per card, exactly one correct answer, short answers, no repeated facts, a balanced mix of true and false statements for `truefalse`.
- If the model judges the topic unacceptable it returns `allowed: false`, and the generator throws `TOPIC_REJECTED`.

**Calling the model.** Every call has a 60-second timeout. `408` and `5xx` are retried twice with backoff by the SDK; `429` is not, because the free quota resets per minute and a quick retry only burns it. A reply that fails the schema is retried once. A refusal is never retried. Any provider failure becomes `GENERATION_FAILED`, with the provider's message in the server log only. Provider SDK types stay inside `gemini-card-generator.ts`.

## MongoDB

- One collection, `decks`. A deck is one document with its cards embedded, since cards are always read and written together with their deck.
- Schema fields are `trim`med and `required` where the API requires them; `timestamps: true` maintains `createdAt` and `updatedAt`.
- Index on `createdAt` descending for the list.

## Tests

`npm test` runs Vitest. Nest decorators need emitted metadata, so test files compile through SWC (`unplugin-swc`). No test touches the network or MongoDB: the repository is replaced by `InMemoryDecksRepository` and the generator by a `vi.fn()` mock, both bound to the same DI tokens as the real classes.

| File                     | Covers                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `decks.service.spec.ts`  | CRUD rules, `DECK_NOT_FOUND`, generation saves the draft, a failed generation saves nothing |
| `deck-dto.spec.ts`       | Every validation rule of `CreateDeckDto` and `GenerateDeckDto`, including card shape per mode |
| `llm-deck.mapper.spec.ts`| Cleaning model output: trimming, empty and duplicate cards, the half-usable threshold, refusals |
| `deck-prompt.spec.ts`    | Language and count in the prompt, user text kept inside its tags                          |
| `decks.e2e.spec.ts`      | Every endpoint over HTTP with the real pipe, filter and controller: status codes and error bodies |

`MongoDecksRepository` and `GeminiCardGenerator` are adapters and have no unit tests; they are checked by running the app against Atlas and a real key.

## Testing the API by hand

`requests.http` contains one request per endpoint for the WebStorm HTTP Client. After `POST`, copy the returned `id` into the `@deckId` variable at the top of the file and run `GET`, `PUT` and `DELETE`. Each request also appears in the server console through the request logger, and its effect is visible in MongoDB Atlas → Browse Collections.

## Code rules

- TypeScript `strict`. No `any`, no non-null assertions, no `as` casts except right after a Zod parse.
- `strictPropertyInitialization` is off on purpose: DTO and Mongoose schema classes are filled by the framework, and the alternative is a `!` on every field.
- No comments in source; names carry the meaning, this README carries the explanation.
- No literal that appears twice: error codes, tokens, limits and enum values live in one constant.
- A new dependency is added only after it is agreed.
