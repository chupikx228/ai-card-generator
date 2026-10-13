import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, ErrorCode } from '../errors';

export type ErrorResponse = {
  statusCode: number;
  code: ErrorCode;
  message: string;
};

const STATUS_BY_CODE: Record<ErrorCode, HttpStatus> = {
  [ErrorCode.ValidationFailed]: HttpStatus.BAD_REQUEST,
  [ErrorCode.RouteNotFound]: HttpStatus.NOT_FOUND,
  [ErrorCode.DeckNotFound]: HttpStatus.NOT_FOUND,
  [ErrorCode.TopicRejected]: HttpStatus.UNPROCESSABLE_ENTITY,
  [ErrorCode.GenerationFailed]: HttpStatus.SERVICE_UNAVAILABLE,
  [ErrorCode.InternalError]: HttpStatus.INTERNAL_SERVER_ERROR,
};

const INTERNAL_ERROR_MESSAGE = 'Internal server error';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const body = this.toResponse(exception);
    host.switchToHttp().getResponse<Response>().status(body.statusCode).json(body);
  }

  private toResponse(exception: unknown): ErrorResponse {
    if (exception instanceof DomainError) {
      return { statusCode: STATUS_BY_CODE[exception.code], code: exception.code, message: exception.message };
    }

    if (exception instanceof HttpException && exception.getStatus() < HttpStatus.INTERNAL_SERVER_ERROR) {
      const statusCode = exception.getStatus();
      const code = statusCode === HttpStatus.NOT_FOUND ? ErrorCode.RouteNotFound : ErrorCode.ValidationFailed;
      return { statusCode, code, message: exception.message };
    }

    this.logger.error(exception instanceof Error ? (exception.stack ?? exception.message) : String(exception));
    return {
      statusCode: STATUS_BY_CODE[ErrorCode.InternalError],
      code: ErrorCode.InternalError,
      message: INTERNAL_ERROR_MESSAGE,
    };
  }
}
