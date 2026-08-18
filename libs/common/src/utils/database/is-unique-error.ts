import { DrizzleQueryError } from 'drizzle-orm';
import { PostgresError } from 'postgres';

export function isUniqueError(error: unknown): boolean {
  return (
    error instanceof DrizzleQueryError &&
    error.cause instanceof PostgresError &&
    error.cause.constraint_name === 'users_email_unique'
  );
}
