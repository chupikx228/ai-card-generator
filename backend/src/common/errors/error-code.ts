export const ErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED',
  RouteNotFound: 'ROUTE_NOT_FOUND',
  DeckNotFound: 'DECK_NOT_FOUND',
  TopicRejected: 'TOPIC_REJECTED',
  GenerationFailed: 'GENERATION_FAILED',
  InternalError: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
