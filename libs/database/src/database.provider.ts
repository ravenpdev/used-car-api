import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DB = Symbol('DB');
export const DB_CLIENT = Symbol('DB_CLIENT');

export const DatabaseProvider: Provider[] = [
  {
    provide: DB_CLIENT,
    inject: [ConfigService],
    useFactory: (config: ConfigService) => {
      const connectionString = config.getOrThrow('database.url');

      return postgres(connectionString, {
        max: 10,
      });
    },
  },
  {
    provide: DB,
    inject: [DB_CLIENT],
    useFactory: (client: ReturnType<typeof postgres>) => {
      return drizzle(client, { schema });
    },
  },
];
