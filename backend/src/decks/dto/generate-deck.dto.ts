import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { DECK_LANGUAGES, DECK_MODES, type DeckLanguage, type DeckMode, GENERATION_LIMITS } from '../interfaces';
import { trimString } from './transforms/trim-string';

export class GenerateDeckDto {
  @Transform(trimString)
  @IsString()
  @Length(GENERATION_LIMITS.topicMinLength, GENERATION_LIMITS.topicMaxLength)
  topic: string;

  @IsIn(DECK_MODES)
  mode: DeckMode;

  @IsIn(DECK_LANGUAGES)
  language: DeckLanguage;

  @IsInt()
  @Min(GENERATION_LIMITS.minCount)
  @Max(GENERATION_LIMITS.maxCount)
  count: number;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @Length(1, GENERATION_LIMITS.instructionsMaxLength)
  instructions?: string;
}
