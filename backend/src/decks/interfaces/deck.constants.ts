export const DECK_MODES = ['flip', 'qa', 'truefalse'] as const;

export const DECK_LANGUAGES = ['uk', 'en'] as const;

export const DECK_LIMITS = {
  titleMaxLength: 120,
  topicMaxLength: 200,
  cardTextMaxLength: 500,
  minCards: 1,
  maxCards: 100,
} as const;

export const GENERATION_LIMITS = {
  topicMinLength: 3,
  topicMaxLength: 200,
  instructionsMaxLength: 500,
  minCount: 5,
  maxCount: 30,
} as const;
