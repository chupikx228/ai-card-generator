import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { DECK_LANGUAGES, DECK_LIMITS, DECK_MODES, type DeckLanguage, type DeckMode } from '../interfaces';
import type { CardInput } from './card-input';
import { trimString } from './transforms/trim-string';
import { CardsMatchMode } from './validators/cards-match-mode.validator';

export class CreateDeckDto {
  @Transform(trimString)
  @IsString()
  @Length(1, DECK_LIMITS.titleMaxLength)
  title: string;

  @IsIn(DECK_MODES)
  mode: DeckMode;

  @IsIn(DECK_LANGUAGES)
  language: DeckLanguage;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @Length(1, DECK_LIMITS.topicMaxLength)
  topic?: string;

  @IsArray()
  @ArrayMinSize(DECK_LIMITS.minCards)
  @ArrayMaxSize(DECK_LIMITS.maxCards)
  @CardsMatchMode()
  cards: CardInput[];
}
