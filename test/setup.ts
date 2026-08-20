import { Database, DB, DB_CLIENT } from '@app/database';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/cleanup';
import postgres from 'postgres';

let app: INestApplication;
let db: Database;
let dbClient: ReturnType<typeof postgres>;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  await app.init();

  db = moduleFixture.get(DB);
  dbClient = moduleFixture.get(DB_CLIENT);
});

beforeEach(async () => {
  await cleanDatabase(db);
});

afterAll(async () => {
  await dbClient.end();
  await app.close();
});

export { app };
