import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Types } from 'mongoose';
import { DECK_LANGUAGES, DECK_LIMITS, DECK_MODES, type DeckLanguage, type DeckMode } from '../interfaces';

export const DECKS_COLLECTION = 'decks';

@Schema()
export class CardEntity {
  declare _id: Types.ObjectId;

  @Prop({ type: String, trim: true, maxlength: DECK_LIMITS.cardTextMaxLength })
  front?: string;

  @Prop({ type: String, trim: true, maxlength: DECK_LIMITS.cardTextMaxLength })
  back?: string;

  @Prop({ type: String, trim: true, maxlength: DECK_LIMITS.cardTextMaxLength })
  statement?: string;

  @Prop({ type: Boolean })
  isTrue?: boolean;
}

export const CardSchema = SchemaFactory.createForClass(CardEntity);

@Schema({ collection: DECKS_COLLECTION, timestamps: true })
export class DeckEntity {
  @Prop({ type: String, required: true, trim: true, maxlength: DECK_LIMITS.titleMaxLength })
  title: string;

  @Prop({ type: String, required: true, enum: DECK_MODES })
  mode: DeckMode;

  @Prop({ type: String, required: true, enum: DECK_LANGUAGES })
  language: DeckLanguage;

  @Prop({ type: String, trim: true, maxlength: DECK_LIMITS.topicMaxLength, default: null })
  topic: string | null;

  @Prop({ type: [CardSchema], required: true })
  cards: CardEntity[];

  createdAt: Date;

  updatedAt: Date;
}

export type DeckDocument = HydratedDocument<DeckEntity>;

export const DeckSchema = SchemaFactory.createForClass(DeckEntity);

DeckSchema.index({ createdAt: -1 });
