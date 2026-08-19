import { sql } from 'drizzle-orm';
import { Database } from '@app/database';

export async function cleanDatabase(db: Database) {
  return db.execute(
    sql`
      TRUNCATE TABLE
        users
      RESTART IDENTITY
      CASCADE
    `,
  );
}
