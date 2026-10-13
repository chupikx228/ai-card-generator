import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = performance.now();
    response.on('finish', () => {
      const duration = Math.round(performance.now() - startedAt);
      this.logger.log(`${request.method} ${request.originalUrl} ${response.statusCode} ${duration}ms`);
    });
    next();
  }
}
