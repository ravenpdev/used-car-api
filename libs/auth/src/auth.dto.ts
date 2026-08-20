import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const signupSchema = z
  .object({
    email: z.email({
      error: 'Invalid email',
    }),
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
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password did not match',
    path: ['confirmPassword'],
  });

const signinSchema = z.object({
  email: z.email(),
  password: z.string().nonempty('password is required'),
});

export class SignupDto extends createZodDto(signupSchema) {}

export class SigninDto extends createZodDto(signinSchema) {}
