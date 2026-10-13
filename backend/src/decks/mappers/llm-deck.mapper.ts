import { GenerationFailedError, TopicRejectedError } from '../errors';
import type { LlmStatementDeck, LlmTextDeck } from '../generator/llm-schemas/llm-deck.schema';
import { DECK_LIMITS, type GenerationRequest, type NewDeck } from '../interfaces';

const MIN_USABLE_SHARE = 0.5;

const normalize = (text: string): string => text.trim().replace(/\s+/g, ' ');

const isUsableText = (text: string): boolean => text.length > 0 && text.length <= DECK_LIMITS.cardTextMaxLength;

const sameText = (left: string, right: string): boolean => left.toLocaleLowerCase() === right.toLocaleLowerCase();

const uniqueBy = <T>(items: readonly T[], key: (item: T) => string): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item).toLocaleLowerCase();
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

const assertAllowed = (allowed: boolean, request: GenerationRequest): void => {
  if (!allowed) {
    throw new TopicRejectedError(request.topic);
  }
};

const assertEnoughCards = (usable: number, request: GenerationRequest): void => {
  if (usable < Math.ceil(request.count * MIN_USABLE_SHARE)) {
    throw new GenerationFailedError(`Only ${usable} of ${request.count} generated cards are usable`);
  }
};

const toTitle = (raw: string, request: GenerationRequest): string => {
  const title = normalize(raw);
  return (title.length > 0 ? title : request.topic).slice(0, DECK_LIMITS.titleMaxLength);
};

export const toTextDeckDraft = (request: GenerationRequest, mode: 'flip' | 'qa', output: LlmTextDeck): NewDeck => {
  assertAllowed(output.allowed, request);

  const candidates = output.cards
    .map((card) => ({ front: normalize(card.front), back: normalize(card.back) }))
    .filter((card) => isUsableText(card.front) && isUsableText(card.back) && !sameText(card.front, card.back));
  const cards = uniqueBy(candidates, (card) => card.front).slice(0, request.count);

  assertEnoughCards(cards.length, request);
  return { title: toTitle(output.title, request), language: request.language, topic: request.topic, mode, cards };
};

export const toStatementDeckDraft = (request: GenerationRequest, output: LlmStatementDeck): NewDeck => {
  assertAllowed(output.allowed, request);

  const candidates = output.cards
    .map((card) => ({ statement: normalize(card.statement), isTrue: card.isTrue }))
    .filter((card) => isUsableText(card.statement));
  const cards = uniqueBy(candidates, (card) => card.statement).slice(0, request.count);

  assertEnoughCards(cards.length, request);
  return {
    title: toTitle(output.title, request),
    language: request.language,
    topic: request.topic,
    mode: 'truefalse',
    cards,
  };
};
