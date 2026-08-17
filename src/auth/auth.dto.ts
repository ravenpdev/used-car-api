import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const signupSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
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
