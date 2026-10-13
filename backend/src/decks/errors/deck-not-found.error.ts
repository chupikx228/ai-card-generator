import { DomainError, ErrorCode } from '../../common/errors';

export class DeckNotFoundError extends DomainError {
  readonly code = ErrorCode.DeckNotFound;

  constructor(id: string) {
    super(`Deck ${id} not found`);
  }
}
