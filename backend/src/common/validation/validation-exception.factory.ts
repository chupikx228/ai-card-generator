import type { ValidationError } from 'class-validator';
import { ValidationFailedError } from '../errors';

const collectMessages = (errors: readonly ValidationError[], parentPath: string): string[] =>
  errors.flatMap((error) => {
    const path = parentPath.length > 0 ? `${parentPath}.${error.property}` : error.property;
    const own = Object.values(error.constraints ?? {}).map((message) =>
      message.startsWith(error.property) ? `${path}${message.slice(error.property.length)}` : `${path}: ${message}`,
    );
    return [...own, ...collectMessages(error.children ?? [], path)];
  });

export const validationExceptionFactory = (errors: ValidationError[]): ValidationFailedError =>
  new ValidationFailedError(collectMessages(errors, ''));
