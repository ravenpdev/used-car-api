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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserWithoutPassword = Omit<User, 'password'>;

const credentialSchema = createInsertSchema(users, {
  email: z.email(),
  password: z
    .string()
    .min(8)
    .superRefine((val, ctx) => {
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Password must contain at least 1 uppercase letter',
        });
      }
      if (!/[^A-Za-z0-9]/.test(val)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Password must contain at least 1 symbol',
        });
      }
    }),
}).pick({ email: true, password: true });

export const signupSchema = credentialSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password did not match',
    path: ['confirmPassword'],
  });

export const signinSchema = credentialSchema;

export const updateUserSchema = createUpdateSchema(users, {
  email: z.email(),
  password: z.string().min(8),
})
  .pick({
    email: true,
    password: true,
  })
  .partial();
