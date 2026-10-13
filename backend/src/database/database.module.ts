import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { Connection } from 'mongoose';
import type { Env } from '../config/env.schema';

const logger = new Logger('MongoDB');

const logConnectionEvents = (connection: Connection): void => {
  connection.on('connected', () => logger.log('Connected to MongoDB'));
  connection.on('disconnected', () => logger.warn('Disconnected from MongoDB'));
};

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        uri: config.get('MONGO_URI', { infer: true }),
        onConnectionCreate: logConnectionEvents,
      }),
    }),
  ],
})
export class DatabaseModule {}
