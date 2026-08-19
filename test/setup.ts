import { Database, DB } from '@app/database';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/cleanup';

let app: INestApplication;
let db: Database;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  await app.init();

  db = moduleFixture.get<Database>(DB);
});

beforeEach(async () => {
  await cleanDatabase(db);
});

afterAll(async () => {
  await app.close();
});

export { app };
