import { type INestApplication, RequestMethod, ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { validationExceptionFactory } from './common/validation/validation-exception.factory';
import { API_PREFIX } from './config/app.constants';

export type AppSetupOptions = {
  corsOrigin: string;
};

export const configureApp = (app: INestApplication, options: AppSetupOptions): void => {
  app.setGlobalPrefix(API_PREFIX, { exclude: [{ path: '/', method: RequestMethod.GET }] });
  app.enableCors({ origin: options.corsOrigin });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
};
