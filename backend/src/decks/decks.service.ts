import { Inject, Injectable } from '@nestjs/common';
import type { CreateDeckDto, GenerateDeckDto, UpdateDeckDto } from './dto';
import { DeckNotFoundError } from './errors';
import {
  CARD_GENERATOR,
  type CardGenerator,
  type Deck,
  DECKS_REPOSITORY,
  type DecksRepository,
} from './interfaces';
import { toGenerationRequest, toNewDeck } from './mappers/deck.request-mapper';

@Injectable()
export class DecksService {
  constructor(
    @Inject(DECKS_REPOSITORY) private readonly decks: DecksRepository,
    @Inject(CARD_GENERATOR) private readonly generator: CardGenerator,
  ) {}

  findAll(): Promise<Deck[]> {
    return this.decks.findAll();
  }

  async findById(id: string): Promise<Deck> {
    const deck = await this.decks.findById(id);
    if (deck === null) {
      throw new DeckNotFoundError(id);
    }
    return deck;
  }

  create(dto: CreateDeckDto): Promise<Deck> {
    return this.decks.create(toNewDeck(dto));
  }

  async generate(dto: GenerateDeckDto): Promise<Deck> {
    const draft = await this.generator.generate(toGenerationRequest(dto));
    return this.decks.create(draft);
  }

  async replace(id: string, dto: UpdateDeckDto): Promise<Deck> {
    const deck = await this.decks.replace(id, toNewDeck(dto));
    if (deck === null) {
      throw new DeckNotFoundError(id);
    }
    return deck;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.decks.delete(id);
    if (!deleted) {
      throw new DeckNotFoundError(id);
    }
  }
}
