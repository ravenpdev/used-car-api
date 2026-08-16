import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// export const reports = pgTable('reports', {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
// });

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserWithoutPassword = Omit<User, 'password'>;

export const insertUserSchema = createInsertSchema(users, {
  email: z.email(),
  password: z.string().min(8),
}).omit({ createdAt: true, updatedAt: true });

export const updateUserSchema = createUpdateSchema(users, {
  email: z.email(),
  password: z.string().min(8),
})
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();
