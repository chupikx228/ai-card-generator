import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, type Model } from 'mongoose';
import type { Deck, DecksRepository, NewDeck } from '../interfaces';
import { toDeck, toDeckRecord } from '../mappers/deck.persistence-mapper';
import { DeckEntity } from '../schemas/deck.schema';

@Injectable()
export class MongoDecksRepository implements DecksRepository {
  constructor(@InjectModel(DeckEntity.name) private readonly model: Model<DeckEntity>) {}

  async findAll(): Promise<Deck[]> {
    const documents = await this.model.find().sort({ createdAt: -1 }).exec();
    return documents.map(toDeck);
  }

  async findById(id: string): Promise<Deck | null> {
    if (!isObjectIdOrHexString(id)) {
      return null;
    }
    const document = await this.model.findById(id).exec();
    return document === null ? null : toDeck(document);
  }

  async create(deck: NewDeck): Promise<Deck> {
    const document = await this.model.create(toDeckRecord(deck));
    return toDeck(document);
  }

  async replace(id: string, deck: NewDeck): Promise<Deck | null> {
    if (!isObjectIdOrHexString(id)) {
      return null;
    }
    const document = await this.model
      .findByIdAndUpdate(id, { $set: toDeckRecord(deck) }, { returnDocument: 'after', runValidators: true })
      .exec();
    return document === null ? null : toDeck(document);
  }

  async delete(id: string): Promise<boolean> {
    if (!isObjectIdOrHexString(id)) {
      return false;
    }
    const document = await this.model.findByIdAndDelete(id).exec();
    return document !== null;
  }
}
