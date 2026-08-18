import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DB = Symbol('DB');

export const DatabaseProvider: Provider = {
  provide: DB,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const connectionString = config.getOrThrow('database.url');

    const client = postgres(connectionString, {
      max: 10,
    });

    return drizzle(client, { schema });
  },
};
