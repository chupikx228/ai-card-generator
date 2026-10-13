import { DomainError, ErrorCode } from '../../common/errors';

export class TopicRejectedError extends DomainError {
  readonly code = ErrorCode.TopicRejected;

  constructor(topic: string) {
    super(`The model refused to generate a deck about "${topic}"`);
  }
}
