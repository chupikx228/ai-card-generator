import { DomainError } from './domain-error';
import { ErrorCode } from './error-code';

export class ValidationFailedError extends DomainError {
  readonly code = ErrorCode.ValidationFailed;

  constructor(readonly details: readonly string[]) {
    super(details.length > 0 ? details.join('; ') : 'Validation failed');
  }
}
