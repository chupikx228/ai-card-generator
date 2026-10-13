import { DomainError, ErrorCode } from '../../common/errors';

export class GenerationFailedError extends DomainError {
  readonly code = ErrorCode.GenerationFailed;
}
