import { DECK_LIMITS } from '../interfaces';

export type TextCardInput = {
  front: string;
  back: string;
};

export type StatementCardInput = {
  statement: string;
  isTrue: boolean;
};

export type CardInput = TextCardInput | StatementCardInput;

const TEXT_CARD_KEYS: readonly string[] = ['front', 'back'];

const STATEMENT_CARD_KEYS: readonly string[] = ['statement', 'isTrue'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOnlyKeys = (record: Record<string, unknown>, keys: readonly string[]): boolean =>
  Object.keys(record).every((key) => keys.includes(key));

const isCardText = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }
  const length = value.trim().length;
  return length > 0 && length <= DECK_LIMITS.cardTextMaxLength;
};

export const isTextCardInput = (value: unknown): value is TextCardInput =>
  isRecord(value) && hasOnlyKeys(value, TEXT_CARD_KEYS) && isCardText(value.front) && isCardText(value.back);

export const isStatementCardInput = (value: unknown): value is StatementCardInput =>
  isRecord(value) &&
  hasOnlyKeys(value, STATEMENT_CARD_KEYS) &&
  isCardText(value.statement) &&
  typeof value.isTrue === 'boolean';
