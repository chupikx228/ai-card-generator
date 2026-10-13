import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { GeminiCardGenerator } from './generator/gemini-card-generator';
import { CARD_GENERATOR, DECKS_REPOSITORY } from './interfaces';
import { MongoDecksRepository } from './repositories/mongo-decks.repository';
import { DeckEntity, DeckSchema } from './schemas/deck.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DeckEntity.name, schema: DeckSchema }])],
  controllers: [DecksController],
  providers: [
    DecksService,
    { provide: DECKS_REPOSITORY, useClass: MongoDecksRepository },
    { provide: CARD_GENERATOR, useClass: GeminiCardGenerator },
  ],
})
export class DecksModule {}
